import { Package, DollarSign, ShoppingCart, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, MoveRight, Clock, Truck, CircleDot } from "lucide-react";
import StatusCard from "@/components/StatusCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from "recharts";
import { useState, useEffect } from "react";
import { StatusTrackingCard } from "@/components/StatusTrackingCard";
import { FichasStatusModal, Ficha } from "@/components/FichasStatusModal";
import { toast } from "@/components/ui/sonner";
// import { fichasAguardandoRetirada, fichasEmProducao, fichasRecebidas } from "@/data/fichasMock";

// Dados fictícios para os gráficos
const productionData = [
  { name: "Seg", producao: 120 },
  { name: "Ter", producao: 140 },
  { name: "Qua", producao: 100 },
  { name: "Qui", producao: 180 },
  { name: "Sex", producao: 150 },
  { name: "Sab", producao: 90 },
  { name: "Dom", producao: 70 },
];

const productData = [
  { name: "Item A", quantidade: 40 },
  { name: "Item B", quantidade: 30 },
  { name: "Item C", quantidade: 20 },
  { name: "Item D", quantidade: 27 },
  { name: "Item E", quantidade: 18 },
];

const lowStockItems = [
  { id: 1, name: "Produto A", current: 5, min: 10 },
  { id: 2, name: "Produto B", current: 3, min: 15 },
  { id: 3, name: "Produto C", current: 8, min: 20 },
];

// Componente de contador animado
function AnimatedCounter({ endValue, duration = 1500 }) {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime;
    let animationFrame;
    
    const updateCount = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      
      if (progress < duration) {
        const newCount = Math.floor((progress / duration) * endValue);
        setCount(newCount);
        animationFrame = requestAnimationFrame(updateCount);
      } else {
        setCount(endValue);
      }
    };
    
    animationFrame = requestAnimationFrame(updateCount);
    
    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [endValue, duration]);
  
  return <span className="text-2xl font-bold">{count}</span>;
}

export default function Dashboard() {
  // Estado para os dados do dashboard
  const [dashboardData, setDashboardData] = useState({
    aguardandoRetirada: 0,
    emProducao: 0,
    concluido: 0,
    totalProdutos: 0,
    totalSaidas: 0,
    totalEntradas: 0,
    itensBaixoEstoque: 0
  });

  // Estado para os dados de produção
  const [producaoSemanal, setProducaoSemanal] = useState([]);

  // Estado para controlar o modal de detalhes
  const [modalOpen, setModalOpen] = useState(false);
  const [statusSelecionado, setStatusSelecionado] = useState<"aguardando_retirada" | "em_producao" | "concluido" | null>(null);
  const [fichasFiltradas, setFichasFiltradas] = useState<Ficha[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Função para carregar os dados do dashboard
  const carregarDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://26.203.75.236:8687/api/fichas/summary/status');
      const data = await response.json();
      
      setDashboardData({
        aguardandoRetirada: data.aguardando_retirada || 0,
        emProducao: data.em_producao || 0,
        concluido: data.concluido || 0,
        totalProdutos: 1234, // Dados mockados por enquanto
        totalSaidas: 584,
        totalEntradas: 356,
        itensBaixoEstoque: 15
      });

      // Carregar dados de produção semanal
      const producaoResponse = await fetch('http://26.203.75.236:8687/api/dashboard/producao-semanal');
      const producaoData = await producaoResponse.json();
      setProducaoSemanal(producaoData);
    } catch (error) {
      toast.error("Erro ao carregar dados do dashboard");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    carregarDashboard();
  }, []);
  
  // Função para abrir o modal com as fichas de um determinado status
  const handleOpenModal = async (status: "aguardando_retirada" | "em_producao" | "concluido") => {
    try {
      setIsLoading(true);
      setStatusSelecionado(status);
      
      const response = await fetch(`http://26.203.75.236:8687/api/fichas/list/${status}`);
      const fichas = await response.json();
      setFichasFiltradas(fichas);
      
      setModalOpen(true);
    } catch (error) {
      toast.error("Erro ao carregar fichas");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatusCard
          title="Produtos em Estoque"
          value={dashboardData.totalProdutos}
          description="Produtos disponíveis no estoque"
          icon={<Package className="h-4 w-4" />}
          trend={{ value: 12, positive: true }}
          animated={true}
        />
        <StatusCard
          title="Saídas de Matéria Prima"
          value={dashboardData.totalSaidas}
          description="+20% em relação ao mês anterior"
          icon={<ArrowUpFromLine className="h-4 w-4" />}
          trend={{ value: 20, positive: false }}
          animated={true}
        />
        <StatusCard
          title="Entrada de Produto"
          value={dashboardData.totalEntradas}
          description="Produtos recebidos no mês"
          icon={<ArrowDownToLine className="h-4 w-4" />}
          trend={{ value: 15, positive: true }}
          animated={true}
        />
        <StatusCard
          title="Itens Baixo Estoque"
          value={dashboardData.itensBaixoEstoque}
          description="Itens abaixo do nível mínimo"
          icon={<AlertTriangle className="h-4 w-4" />}
          className="border-red-200 bg-red-50"
          animated={true}
        />
      </div>
      
      {/* Card de Rastreamento Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Rastreamento Geral</CardTitle>
          <CardDescription>
            Fluxo de trabalho e situação atual das fichas. Clique em um status para ver detalhes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between py-4">
            <StatusTrackingCard 
              icon={<Clock className="h-10 w-10 text-amber-500" />}
              count={dashboardData.aguardandoRetirada}
              label="Aguardando Retirada"
              className="bg-amber-50 border-amber-200 mb-4 md:mb-0 w-full md:w-1/4 cursor-pointer hover:bg-amber-100 transition-colors"
              onClick={() => handleOpenModal("aguardando_retirada")}
            />
            
            <div className="hidden md:flex items-center justify-center w-1/6">
              <MoveRight className="h-10 w-10 text-gray-800 font-bold stroke-2" />
            </div>
            
            <StatusTrackingCard 
              icon={<CircleDot className="h-10 w-10 text-blue-500" />}
              count={dashboardData.emProducao}
              label="Em Produção"
              className="bg-blue-50 border-blue-200 mb-4 md:mb-0 w-full md:w-1/4 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => handleOpenModal("em_producao")}
            />
            
            <div className="hidden md:flex items-center justify-center w-1/6">
              <MoveRight className="h-10 w-10 text-gray-800 font-bold stroke-2" />
            </div>
            
            <StatusTrackingCard 
              icon={<Truck className="h-10 w-10 text-green-500" />}
              count={dashboardData.concluido}
              label="Concluídas"
              className="bg-green-50 border-green-200 w-full md:w-1/4 cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => handleOpenModal("concluido")}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Produção por Período</CardTitle>
            <CardDescription>
              Volume de produção na semana atual
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={producaoSemanal}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorProducao" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#1177ee" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#1177ee" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="producao"
                  stroke="#1177ee"
                  fillOpacity={1}
                  fill="url(#colorProducao)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Top Produtos por Volume</CardTitle>
            <CardDescription>
              Produtos com maior quantidade em estoque
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="quantidade" fill="#0a4f99" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Alerta de Estoque Baixo</CardTitle>
          <CardDescription>
            Produtos que necessitam reposição urgente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estoque Atual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mínimo Recomendado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {lowStockItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.current} unidades
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.min} unidades
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Crítico
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Modal para exibir os detalhes das fichas */}
      {statusSelecionado && (
        <FichasStatusModal 
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          status={statusSelecionado}
          fichas={fichasFiltradas}
        />
      )}
    </div>
  );
}
