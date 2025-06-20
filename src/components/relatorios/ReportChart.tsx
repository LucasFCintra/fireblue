import { useMemo, useEffect, useState } from "react";
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
import { fichasService } from "@/services/fichasService";

interface ReportChartProps {
  type: "pecas-cortadas" | "pecas-perdidas" | "pecas-recebidas";
  dateRange?: DateRange;
}

export function ReportChart({ type, dateRange }: ReportChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (type === "pecas-cortadas") {
        setLoading(true);
        try {
          const data = await fichasService.buscarCortadasUltimosMeses();
          setChartData(data.map(item => ({ name: item.mes, quantidade: Number(item.total_cortada) || 0 })));
        } catch (e) {
          setChartData([]);
        } finally {
          setLoading(false);
        }
      } else if (type === "pecas-recebidas") {
        setLoading(true);
        try {
          const data = await fichasService.buscarRecebidosUltimosMeses();
          setChartData(data.map(item => ({ name: item.mes, quantidade: Number(item.total_recebido) })));
        } catch (e) {
          setChartData([]);
        } finally {
          setLoading(false);
        }
      } else if (type === "pecas-perdidas") {
        setLoading(true);
        try {
          const data = await fichasService.buscarPerdidasUltimosMeses();
          console.log(data)
          setChartData(data.map(item => ({ name: item.mes, quantidade: Number(item.total_perdido) || 0 })));
        } catch (e) {
          setChartData([]);
        } finally {
          setLoading(false);
        }
      }
    }
    fetchData();
  }, [type, dateRange]);

  const getChartData = useMemo(() => {
    if ((type === "pecas-cortadas" || type === "pecas-recebidas" || type === "pecas-perdidas") && chartData.length > 0) {
      return chartData;
    }
    switch (type) {
      case "pecas-perdidas":
        return [
          { name: 'Jan', quantidade: 40, motivo: 'Quebra' },
          { name: 'Fev', quantidade: 30, motivo: 'Quebra' },
          { name: 'Mar', quantidade: 50, motivo: 'Quebra' },
          { name: 'Abr', quantidade: 45, motivo: 'Quebra' },
          { name: 'Mai', quantidade: 60, motivo: 'Quebra' },
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
  }, [type, chartData]);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  const renderChart = () => {
    if (loading && (type === "pecas-cortadas" || type === "pecas-recebidas" || type === "pecas-perdidas")) {
      return <p>Carregando dados do relatório...</p>;
    }
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
      case "pecas-cortadas": {
        // Cálculos baseados em chartData
        const totalCortadas = chartData.reduce((acc, item) => acc + (item.quantidade || 0), 0);
        const mediaCortadas = chartData.length > 0 ? Math.round(totalCortadas / chartData.length) : 0;
        const maiorCorte = chartData.reduce((max, item) => item.quantidade > max ? item.quantidade : max, 0);
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Total de Peças Cortadas</p>
              <p className="text-xl font-bold">{totalCortadas} unid.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Média Mensal</p>
              <p className="text-xl font-bold">{mediaCortadas} unid.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">Maior Quantidade</p>
              <p className="text-xl font-bold">{maiorCorte} unid.</p>
            </div>
          </div>
        );
      }
      case "pecas-perdidas": {
        // Cálculos baseados em chartData
        const totalPerdidas = chartData.reduce((acc, item) => acc + (item.quantidade || 0), 0);
        const mediaPerdidas = chartData.length > 0 ? Math.round(totalPerdidas / chartData.length) : 0;
        const maiorPerda = chartData.reduce((max, item) => item.quantidade > max ? item.quantidade : max, 0);
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-red-700">Total de Peças Perdidas</p>
              <p className="text-xl font-bold">{totalPerdidas} unid.</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-amber-700">Média Mensal</p>
              <p className="text-xl font-bold">{mediaPerdidas} unid.</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Maior Perda</p>
              <p className="text-xl font-bold">{maiorPerda} unid.</p>
            </div>
          </div>
        );
      }
      case "pecas-recebidas": {
        // Cálculos baseados em chartData
        const totalRecebidas = chartData.reduce((acc, item) => acc + (item.quantidade || 0), 0);
        const mediaMensal = chartData.length > 0 ? Math.round(totalRecebidas / chartData.length) : 0;
        const maiorQuantidade = chartData.reduce((max, item) => item.quantidade > max ? item.quantidade : max, 0);
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700">Total Recebidas</p>
              <p className="text-xl font-bold">{totalRecebidas} unid.</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-700">Média Mensal</p>
              <p className="text-xl font-bold">{mediaMensal} unid.</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-purple-700">Maior Quantidade</p>
              <p className="text-xl font-bold">{maiorQuantidade} unid.</p>
            </div>
          </div>
        );
      }
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
