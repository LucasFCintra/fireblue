import { Package, DollarSign, ShoppingCart, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, MoveRight, Clock, Truck, CircleDot, CheckCircle, Scissors, FileText } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { useNotificationToast } from '@/hooks/useNotificationToast';
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
    recebidoParcialmente: 0,
    concluido: 0,
    totalProdutos: 0,
    totalSaidas: 0,
    totalEntradas: 0,
    itensBaixoEstoque: 0
  });

  // Estado para os produtos com estoque baixo
  const [lowStockItems, setLowStockItems] = useState<Array<{
    id: number;
    nome: string;
    descricao: string;
    quantidade_atual: number;
    estoque_minimo: number;
    unidade: string;
    status: string;
  }>>([]);

  // Estado para os dados de produção
  const [producaoSemanal, setProducaoSemanal] = useState([]);

  // Estado para controlar o modal de detalhes
  const [modalOpen, setModalOpen] = useState(false);
  const [statusSelecionado, setStatusSelecionado] = useState<"aguardando_retirada" | "em_producao" | "recebido_parcialmente" | "concluido" | null>(null);
  const [fichasFiltradas, setFichasFiltradas] = useState<Ficha[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Estado para estatísticas mensais
  const [monthlyStats, setMonthlyStats] = useState({
    total_criadas: 0,
    total_concluidas: 0,
    total_recebidas: 0
  });

  // Estado para os dados de peças recebidas por mês
  const [recebidosUltimosMeses, setRecebidosUltimosMeses] = useState<Array<{ mes: string, total_recebido: number }>>([]);

  // Estado para os dados de peças perdidas por mês
  const [perdidasUltimosMeses, setPerdidasUltimosMeses] = useState<Array<{ mes: string, total_perdido: number }>>([]);

  const { showSuccess, showError, showWarning, showInfo } = useNotificationToast();

  // Função para carregar os dados do dashboard
  const carregarDashboard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://26.203.75.236:8687/api/fichas/summary/status');
      const data = await response.json();


      // Buscar todas as fichas para calcular recebimento parcial
      const fichasResponse = await fetch('http://26.203.75.236:8687/api/fichas');
      const fichas = await fichasResponse.json();
      const fichasRecebidasParcialmente = fichas.filter(f => f.status === "em_producao" && f.quantidade_recebida > 0).length;
      
      // Buscar produtos com estoque baixo
      const lowStockResponse = await fetch('http://26.203.75.236:8687/api/produtos/low-stock');
      const lowStockData = await lowStockResponse.json();
      console.log(lowStockData)
      // Buscar estatísticas mensais
      const monthlyStatsResponse = await fetch('http://26.203.75.236:8687/api/fichas/stats/monthly');
      const monthlyStatsData = await monthlyStatsResponse.json();

      setMonthlyStats(monthlyStatsData);
      
      setDashboardData({
        aguardandoRetirada: data.aguardando_retirada || 0,
        emProducao: data.em_producao || 0,
        recebidoParcialmente: fichasRecebidasParcialmente,
        concluido: data.concluido || 0,
        totalProdutos: monthlyStatsData.total_recebidas, // Dados mockados por enquanto
        totalSaidas: monthlyStatsData.total_criadas,
        totalEntradas: monthlyStatsData.total_recebidas,
        itensBaixoEstoque: Array.isArray(lowStockData) ? lowStockData.length : 0
      });

      setLowStockItems(Array.isArray(lowStockData) ? lowStockData : []);

      // Carregar dados de produção semanal
      const producaoResponse = await fetch('http://26.203.75.236:8687/api/dashboard/producao-semanal');
      const producaoData = await producaoResponse.json();
      setProducaoSemanal(producaoData);

      // Buscar dados de peças recebidas por mês
      const recebidosResponse = await fetch('http://26.203.75.236:8687/api/fichas/recebidos/ultimos-meses');
      const recebidosData = await recebidosResponse.json();
      setRecebidosUltimosMeses(recebidosData);

      // Buscar dados de peças perdidas por mês
      const perdidasResponse = await fetch('http://26.203.75.236:8687/api/fichas/perdidas/ultimos-meses');
      const perdidasData = await perdidasResponse.json();
      setPerdidasUltimosMeses(perdidasData);
    } catch (error) {
      toast.error("Erro ao carregar dados do dashboard");
      console.error(error);
      setLowStockItems([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    carregarDashboard();
  }, []);
  
  // Função para abrir o modal com as fichas de um determinado status
  const handleOpenModal = async (status: "aguardando_retirada" | "em_producao" | "recebido_parcialmente" | "concluido") => {
    try {
      setIsLoading(true);
      setStatusSelecionado(status);
      
      let fichas;
      if (status === "recebido_parcialmente") {
        const response = await fetch('http://26.203.75.236:8687/api/fichas');
        const todasFichas = await response.json();
        fichas = todasFichas.filter(f => f.status === "em_producao" && f.quantidade_recebida > 0);
      } else {
        const response = await fetch(`http://26.203.75.236:8687/api/fichas/list/${status}`);
        fichas = await response.json();
      }
      
      setFichasFiltradas(fichas);
      setModalOpen(true);
    } catch (error) {
      toast.error("Erro ao carregar fichas");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Montar os dados do gráfico de peças cortadas
  const dadosGraficoCorte = recebidosUltimosMeses.map(item => ({
    name: item.mes.split('-').reverse().join('/'), // Ex: 2024-06 -> 06/2024
    quantidade: Number(item.total_recebido) || 0
  }));

  // Montar os dados do gráfico de peças perdidas
  const dadosGraficoPerdidas = perdidasUltimosMeses.map(item => ({
    name: item.mes.split('-').reverse().join('/'),
    quantidade: Number(item.total_perdido) || 0
  }));

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral do sistema e métricas de produção
          </p>
        </div>
      </div>
      
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-700">
        <Card className="border-blue-200 bg-blue-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Total de Peças Cortadas</CardTitle>
            <Scissors className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{dashboardData.totalProdutos}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Unidades cortadas para produção
            </p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-purple-800 dark:bg-purple-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Total de Fichas Criadas</CardTitle>
            <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{dashboardData.totalSaidas}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Fichas registradas no sistema
            </p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Total de Fichas Concluídas</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{dashboardData.concluido}</div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Fichas já finalizadas
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Card de Rastreamento Geral */}
      <Card className="border hover:shadow-md transition-all animate-in fade-in duration-1000">
        <CardHeader className="bg-muted border-b">
          <CardTitle className="text-foreground">Rastreamento Geral</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Fluxo de trabalho e situação atual das fichas. Clique em um status para ver detalhes.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between py-4">
            <StatusTrackingCard 
              icon={<Clock className="h-10 w-10 text-amber-500" />}
              count={String(dashboardData.aguardandoRetirada)}
              label="Aguardando Retirada"
              sublabel={`${dashboardData.aguardandoRetirada} fichas aguardando`}
              className="bg-amber-50 border-amber-200 mb-4 md:mb-0 w-full md:w-1/5 cursor-pointer hover:bg-amber-100 transition-colors dark:bg-amber-950 dark:border-amber-800 dark:hover:bg-amber-900"
              onClick={() => handleOpenModal("aguardando_retirada")}
            />
            
            <div className="hidden md:flex items-center justify-center w-1/10">
              <MoveRight className="h-10 w-10 text-foreground font-bold stroke-2" />
            </div>
            
            <StatusTrackingCard 
              icon={<CircleDot className="h-10 w-10 text-blue-500" />}
              count={String(dashboardData.emProducao)}
              label="Em Produção"
              sublabel={`${dashboardData.emProducao} fichas em produção`}
              className="bg-blue-50 border-blue-200 mb-4 md:mb-0 w-full md:w-1/5 cursor-pointer hover:bg-blue-100 transition-colors dark:bg-blue-950 dark:border-blue-800 dark:hover:bg-blue-900"
              onClick={() => handleOpenModal("em_producao")}
            />
            
            <div className="hidden md:flex items-center justify-center w-1/10">
              <MoveRight className="h-10 w-10 text-foreground font-bold stroke-2" />
            </div>
            
            <StatusTrackingCard 
              icon={<Package className="h-10 w-10 text-yellow-500" />}
              count={String(dashboardData.recebidoParcialmente)}
              label="Recebido Parcialmente"
              sublabel={`${dashboardData.recebidoParcialmente} fichas recebidas`}
              className="bg-yellow-50 border-yellow-200 mb-4 md:mb-0 w-full md:w-1/5 cursor-pointer hover:bg-yellow-100 transition-colors dark:bg-yellow-950 dark:border-yellow-800 dark:hover:bg-yellow-900"
              onClick={() => handleOpenModal("recebido_parcialmente")}
            />
            
            <div className="hidden md:flex items-center justify-center w-1/10">
              <MoveRight className="h-10 w-10 text-foreground font-bold stroke-2" />
            </div>
            
            <StatusTrackingCard 
              icon={<CheckCircle className="h-10 w-10 text-green-500" />}
              count={String(dashboardData.concluido)}
              label="Concluídas"
              sublabel={`${dashboardData.concluido} fichas concluídas`}
              className="bg-green-50 border-green-200 w-full md:w-1/5 cursor-pointer hover:bg-green-100 transition-colors dark:bg-green-950 dark:border-green-800 dark:hover:bg-green-900"
              onClick={() => handleOpenModal("concluido")}
            />
          </div>
        </CardContent>
      </Card>
      
      <div className="grid gap-4 md:grid-cols-2 animate-in fade-in duration-1000">
        {/* Gráfico de Peças Cortadas */}
        <Card className="border hover:shadow-md transition-all">
          <CardHeader className="bg-muted border-b">
            <CardTitle className="text-foreground">Peças Cortadas</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Quantidade de peças recebidas por mês
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGraficoCorte}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                />
                <Legend />
                <Bar dataKey="quantidade" name="Recebidas" fill="#1177ee" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        {/* Gráfico de Peças Perdidas */}
        <Card className="border hover:shadow-md transition-all">
          <CardHeader className="bg-muted border-b">
            <CardTitle className="text-foreground">Peças Perdidas</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Quantidade de peças perdidas por mês
            </CardDescription>
          </CardHeader>
          <CardContent className="h-80 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosGraficoPerdidas}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--popover-foreground))'
                  }}
                />
                <Legend />
                <Bar dataKey="quantidade" name="Perdidas" fill="#ff4d4d" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="border hover:shadow-md transition-all animate-in fade-in duration-1000">
        <CardHeader className="bg-muted border-b">
          <CardTitle className="text-foreground">Alerta de Produtos com Estoque Baixo</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Produtos que necessitam reposição urgente
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-md border">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Produto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Estoque Atual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Mínimo Recomendado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-background divide-y divide-border">
                {lowStockItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 text-center text-sm text-muted-foreground">
                      Nenhum produto com estoque baixo
                    </td>
                  </tr>
                ) : (
                  lowStockItems.map((item) => (
                    <tr key={item.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                        {item.nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {item.quantidade_atual} {item.unidade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                        {item.estoque_minimo} {item.unidade}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.status === 'Sem Estoque'
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      
      {/* Estatísticas Mensais */}
      <div className="col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total de Fichas Criadas</span>
                <span className="text-2xl font-bold">{monthlyStats.total_criadas}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total de Fichas Concluídas</span>
                <span className="text-2xl font-bold">{monthlyStats.total_concluidas}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-muted-foreground">Total de Fichas Recebidas</span>
                <span className="text-2xl font-bold">{monthlyStats.total_recebidas}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
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
