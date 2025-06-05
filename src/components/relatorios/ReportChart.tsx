
import { useMemo } from "react";
import { DateRange } from "react-day-picker";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

interface ReportChartProps {
  type: "vendas" | "lucro" | "estoque" | "produtos" | "compras";
  dateRange?: DateRange;
}

export function ReportChart({ type, dateRange }: ReportChartProps) {
  // Dados simulados para os gráficos
  const getChartData = useMemo(() => {
    switch (type) {
      case "vendas":
        return [
          { name: 'Jan', vendas: 4000 },
          { name: 'Fev', vendas: 3000 },
          { name: 'Mar', vendas: 5000 },
          { name: 'Abr', vendas: 4500 },
          { name: 'Mai', vendas: 6000 },
        ];
      case "lucro":
        return [
          { name: 'Jan', lucro: 2400, custo: 1600 },
          { name: 'Fev', lucro: 1800, custo: 1200 },
          { name: 'Mar', lucro: 3000, custo: 2000 },
          { name: 'Abr', lucro: 2700, custo: 1800 },
          { name: 'Mai', lucro: 3600, custo: 2400 },
        ];
      case "estoque":
        return [
          { name: 'Jan', entrada: 1200, saida: 900 },
          { name: 'Fev', entrada: 800, saida: 1000 },
          { name: 'Mar', entrada: 1500, saida: 1200 },
          { name: 'Abr', entrada: 1100, saida: 1300 },
          { name: 'Mai', entrada: 1800, saida: 1600 },
        ];
      case "produtos":
        return [
          { name: 'Produto A', value: 400 },
          { name: 'Produto B', value: 300 },
          { name: 'Produto C', value: 300 },
          { name: 'Produto D', value: 200 },
          { name: 'Produto E', value: 100 },
        ];
      case "compras":
        return [
          { name: 'Jan', compras: 1500 },
          { name: 'Fev', compras: 2000 },
          { name: 'Mar', compras: 1800 },
          { name: 'Abr', compras: 2500 },
          { name: 'Mai', compras: 2200 },
        ];
      default:
        return [];
    }
  }, [type]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const renderChart = () => {
    switch (type) {
      case "vendas":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={getChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)} />
              <Legend />
              <Area type="monotone" dataKey="vendas" name="Vendas" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        );
      case "lucro":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={getChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)} />
              <Legend />
              <Bar dataKey="lucro" name="Lucro" fill="#82ca9d" />
              <Bar dataKey="custo" name="Custo" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "estoque":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={getChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="entrada" name="Entrada" stroke="#8884d8" />
              <Line type="monotone" dataKey="saida" name="Saída" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        );
      case "produtos":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={getChartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {getChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR').format(value as number)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      case "compras":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <LineChart
              data={getChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value as number)} />
              <Legend />
              <Line type="monotone" dataKey="compras" name="Compras" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        );
      default:
        return <p>Selecione um tipo de relatório</p>;
    }
  };

  // Informações adicionais baseadas no tipo de relatório
  const getAdditionalInfo = () => {
    switch (type) {
      case "vendas":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Total de Vendas</p>
              <p className="text-xl font-bold">R$ 22.500,00</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Ticket Médio</p>
              <p className="text-xl font-bold">R$ 450,00</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">Nº de Vendas</p>
              <p className="text-xl font-bold">50</p>
            </div>
          </div>
        );
      case "lucro":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Lucro Total</p>
              <p className="text-xl font-bold">R$ 13.500,00</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-700">Custo Total</p>
              <p className="text-xl font-bold">R$ 9.000,00</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Margem Média</p>
              <p className="text-xl font-bold">60%</p>
            </div>
          </div>
        );
      case "estoque":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Total de Entradas</p>
              <p className="text-xl font-bold">6.400 unid.</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-700">Total de Saídas</p>
              <p className="text-xl font-bold">6.000 unid.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Saldo Atual</p>
              <p className="text-xl font-bold">400 unid.</p>
            </div>
          </div>
        );
      case "produtos":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">Produtos em Baixa</p>
              <p className="text-xl font-bold">12</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-700">Produtos Parados</p>
              <p className="text-xl font-bold">8</p>
            </div>
          </div>
        );
      case "compras":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Total de Compras</p>
              <p className="text-xl font-bold">R$ 10.000,00</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">Nº de Pedidos</p>
              <p className="text-xl font-bold">25</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Média por Pedido</p>
              <p className="text-xl font-bold">R$ 400,00</p>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderChart()}
      {getAdditionalInfo()}
    </div>
  );
}
