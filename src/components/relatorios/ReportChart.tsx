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
  type: "pecas-cortadas" | "pecas-perdidas" | "consertos" | "pecas-recebidas";
  dateRange?: DateRange;
}

export function ReportChart({ type, dateRange }: ReportChartProps) {
  // Dados simulados para os gráficos
  const getChartData = useMemo(() => {
    switch (type) {
      case "pecas-cortadas":
        return [
          { name: 'Jan', quantidade: 400 },
          { name: 'Fev', quantidade: 300 },
          { name: 'Mar', quantidade: 500 },
          { name: 'Abr', quantidade: 450 },
          { name: 'Mai', quantidade: 600 },
        ];
      case "pecas-perdidas":
        return [
          { name: 'Jan', quantidade: 40, motivo: 'Quebra' },
          { name: 'Fev', quantidade: 30, motivo: 'Quebra' },
          { name: 'Mar', quantidade: 50, motivo: 'Quebra' },
          { name: 'Abr', quantidade: 45, motivo: 'Quebra' },
          { name: 'Mai', quantidade: 60, motivo: 'Quebra' },
        ];
      case "consertos":
        return [
          { name: 'Jan', recuperadas: 120, perdidas: 40 },
          { name: 'Fev', recuperadas: 80, perdidas: 30 },
          { name: 'Mar', recuperadas: 150, perdidas: 50 },
          { name: 'Abr', recuperadas: 110, perdidas: 45 },
          { name: 'Mai', recuperadas: 180, perdidas: 60 },
        ];
      case "pecas-recebidas":
        return [
          { name: 'Jan', quantidade: 1200 },
          { name: 'Fev', quantidade: 800 },
          { name: 'Mar', quantidade: 1500 },
          { name: 'Abr', quantidade: 1100 },
          { name: 'Mai', quantidade: 1800 },
        ];
      default:
        return [];
    }
  }, [type]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const renderChart = () => {
    switch (type) {
      case "pecas-cortadas":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={getChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" name="Quantidade" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "pecas-perdidas":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart
              data={getChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" name="Quantidade" fill="#ff4d4d" />
            </BarChart>
          </ResponsiveContainer>
        );
      case "consertos":
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
              <Line type="monotone" dataKey="recuperadas" name="Recuperadas" stroke="#82ca9d" />
              <Line type="monotone" dataKey="perdidas" name="Perdidas" stroke="#ff4d4d" />
            </LineChart>
          </ResponsiveContainer>
        );
      case "pecas-recebidas":
        return (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart
              data={getChartData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="quantidade" name="Quantidade" stroke="#8884d8" fill="#8884d8" />
            </AreaChart>
          </ResponsiveContainer>
        );
      default:
        return <p>Selecione um tipo de relatório</p>;
    }
  };

  // Informações adicionais baseadas no tipo de relatório
  const getAdditionalInfo = () => {
    switch (type) {
      case "pecas-cortadas":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Total de Peças Cortadas</p>
              <p className="text-xl font-bold">2.250 unid.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Média Mensal</p>
              <p className="text-xl font-bold">450 unid.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">Maior Quantidade</p>
              <p className="text-xl font-bold">600 unid.</p>
            </div>
          </div>
        );
      case "pecas-perdidas":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">Total de Peças Perdidas</p>
              <p className="text-xl font-bold">225 unid.</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-700">Média Mensal</p>
              <p className="text-xl font-bold">45 unid.</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Taxa de Perda</p>
              <p className="text-xl font-bold">10%</p>
            </div>
          </div>
        );
      case "consertos":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Total Recuperadas</p>
              <p className="text-xl font-bold">640 unid.</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">Total Perdidas</p>
              <p className="text-xl font-bold">225 unid.</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Taxa de Recuperação</p>
              <p className="text-xl font-bold">74%</p>
            </div>
          </div>
        );
      case "pecas-recebidas":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Total Recebidas</p>
              <p className="text-xl font-bold">6.400 unid.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Média Mensal</p>
              <p className="text-xl font-bold">1.280 unid.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">Maior Quantidade</p>
              <p className="text-xl font-bold">1.800 unid.</p>
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
