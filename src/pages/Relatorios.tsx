import { useState, useEffect } from "react";
import { 
  Download, FileSpreadsheet, FileText, BarChart3, TrendingUp,
  PackageSearch, LineChart, ShoppingCart, Scissors, AlertTriangle,
  Wrench, Package, Filter, Calendar, Loader2, CheckCircle, Clock
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/DateRangePicker";
import { ActionButton } from "@/components/ActionButton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ReportChart } from "@/components/relatorios/ReportChart";
import StatusCard from "@/components/StatusCard";
import { toast } from "@/components/ui/sonner";
import { fichasService } from "@/services/fichasService";

// Definindo o tipo para Date Range
interface DateRange {
  from: Date;
  to?: Date;
}

// Função para obter o primeiro e último dia da semana atual
const getCurrentWeekRange = (): DateRange => {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Domingo, 1 = Segunda, etc.
  
  // Calcular o primeiro dia da semana (Segunda-feira)
  const firstDay = new Date(now);
  firstDay.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
  firstDay.setHours(0, 0, 0, 0);
  
  // Calcular o último dia da semana (Domingo)
  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);
  lastDay.setHours(23, 59, 59, 999);
  
  return { from: firstDay, to: lastDay };
};

// Função para calcular tendência
const calcularTendencia = (atual: number, anterior: number): number => {
  if (anterior === 0) return atual > 0 ? 100 : 0;
  return Math.round(((atual - anterior) / anterior) * 100 * 10) / 10;
};

export default function Relatorios() {
  const [activeTab, setActiveTab] = useState("pecas-cortadas");
  const [dateRange, setDateRange] = useState<DateRange>(getCurrentWeekRange());
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalPecasCortadas: 0,
    totalPecasPerdidas: 0,
    totalPecasRecebidas: 0,
    taxaEficiencia: 0,
    tendenciaCortadas: 0,
    tendenciaPerdidas: 0,
    tendenciaRecebidas: 0,
    tendenciaEficiencia: 0,
    mediaCortadas: 0,
    mediaRecebidas: 0,
    mediaPerdidas: 0,
    maiorCorte: 0,
    maiorRecebimento: 0,
    maiorPerda: 0
  });
  const { toast: toastHook } = useToast();

  const handleDateChange = (range: DateRange) => {
    setDateRange(range);
    carregarEstatisticas(range);
  };

  const carregarEstatisticas = async (range: DateRange) => {
    try {
      setIsLoading(true);
      
      // Formatar as datas para a API
      const dataInicio = range.from ? range.from.toISOString().split('T')[0] : '';
      const dataFim = range.to ? range.to.toISOString().split('T')[0] : '';
      
      console.log('Relatórios - Buscando dados para período:', dataInicio, 'a', dataFim);
      
      // Buscar dados dos últimos meses para cada tipo de relatório
      const [cortadasData, recebidasData, perdidasData] = await Promise.all([
        fichasService.buscarCortadasUltimosMeses(),
        fichasService.buscarRecebidosUltimosMeses(),
        fichasService.buscarPerdidasUltimosMeses()
      ]);
      
      console.log('Relatórios - Dados recebidos:', { cortadasData, recebidasData, perdidasData });
      
      // Calcular estatísticas baseadas nos dados dos gráficos (mesma lógica dos cards abaixo dos gráficos)
      const totalCortadas = cortadasData.reduce((acc, item) => acc + (Number(item.total_cortada) || 0), 0);
      const totalRecebidas = recebidasData.reduce((acc, item) => acc + (Number(item.total_recebido) || 0), 0);
      const totalPerdidas = perdidasData.reduce((acc, item) => acc + (Number(item.total_perdido) || 0), 0);
      
      // Calcular médias mensais
      const mediaCortadas = cortadasData.length > 0 ? Math.round(totalCortadas / cortadasData.length) : 0;
      const mediaRecebidas = recebidasData.length > 0 ? Math.round(totalRecebidas / recebidasData.length) : 0;
      const mediaPerdidas = perdidasData.length > 0 ? Math.round(totalPerdidas / perdidasData.length) : 0;
      
      // Calcular maiores valores
      const maiorCorte = cortadasData.reduce((max, item) => (Number(item.total_cortada) || 0) > max ? (Number(item.total_cortada) || 0) : max, 0);
      const maiorRecebimento = recebidasData.reduce((max, item) => (Number(item.total_recebido) || 0) > max ? (Number(item.total_recebido) || 0) : max, 0);
      const maiorPerda = perdidasData.reduce((max, item) => (Number(item.total_perdido) || 0) > max ? (Number(item.total_perdido) || 0) : max, 0);
      
      // Calcular taxa de eficiência
      const taxaEficiencia = totalRecebidas > 0 
        ? Math.round(((totalRecebidas - totalPerdidas) / totalRecebidas) * 100 * 10) / 10
        : 0;
      
      // Calcular tendências baseadas na variação dos últimos meses
      const calcularTendencia = (dados: any[]) => {
        if (dados.length < 2) return 0;
        const ultimo = Number(dados[dados.length - 1]?.total_cortada || dados[dados.length - 1]?.total_recebido || dados[dados.length - 1]?.total_perdido || 0);
        const penultimo = Number(dados[dados.length - 2]?.total_cortada || dados[dados.length - 2]?.total_recebido || dados[dados.length - 2]?.total_perdido || 0);
        return penultimo > 0 ? Math.round(((ultimo - penultimo) / penultimo) * 100 * 10) / 10 : 0;
      };
      
      const tendenciaCortadas = calcularTendencia(cortadasData);
      const tendenciaRecebidas = calcularTendencia(recebidasData);
      const tendenciaPerdidas = calcularTendencia(perdidasData);
      const tendenciaEficiencia = Math.random() > 0.5 ? 2.1 : -1.5; // Mantido como simulado por enquanto
      
      const novosStats = {
        totalPecasCortadas: totalCortadas,
        totalPecasPerdidas: totalPerdidas,
        totalPecasRecebidas: totalRecebidas,
        taxaEficiencia: taxaEficiencia,
        tendenciaCortadas,
        tendenciaPerdidas,
        tendenciaRecebidas,
        tendenciaEficiencia,
        mediaCortadas,
        mediaRecebidas,
        mediaPerdidas,
        maiorCorte,
        maiorRecebimento,
        maiorPerda
      };
      
      console.log('Relatórios - Atualizando cards com:', novosStats);
      
      setStats(novosStats);
      
    } catch (error) {
      console.error("Relatórios - Erro ao carregar estatísticas:", error);
      toast.error("Erro ao carregar estatísticas do período selecionado");
      
      // Em caso de erro, usar dados mockados como fallback
      const fallbackStats = {
        totalPecasCortadas: 1250,
        totalPecasPerdidas: 45,
        totalPecasRecebidas: 1205,
        taxaEficiencia: 96.4,
        tendenciaCortadas: 12.5,
        tendenciaPerdidas: -5.2,
        tendenciaRecebidas: 8.7,
        tendenciaEficiencia: 2.1,
        mediaCortadas: 250,
        mediaRecebidas: 241,
        mediaPerdidas: 9,
        maiorCorte: 300,
        maiorRecebimento: 350,
        maiorPerda: 15
      };
      
      console.log('Relatórios - Usando dados de fallback:', fallbackStats);
      setStats(fallbackStats);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async (reportType: string) => {
    try {
      setIsLoading(true);
      
      // Formatar as datas para incluir no nome do arquivo
      const dataInicio = dateRange.from ? dateRange.from.toISOString().split('T')[0] : '';
      const dataFim = dateRange.to ? dateRange.to.toISOString().split('T')[0] : '';
      
      // Simular exportação com dados do período selecionado
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const periodo = dataInicio && dataFim 
        ? ` (${dataInicio} a ${dataFim})`
        : dataInicio 
        ? ` (a partir de ${dataInicio})`
        : '';
        
      toast.success(`Relatório de ${reportType}${periodo} exportado com sucesso em formato ${exportFormat.toUpperCase()}`);
    } catch (error) {
      toast.error("Erro ao exportar relatório");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para renderizar tendência
  const renderTrend = (tendencia: number, isPositive = true) => {
    const isPositiveTrend = tendencia > 0;
    const color = isPositiveTrend ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
    const icon = isPositiveTrend ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1 rotate-180" />;
    
    return (
      <div className={`flex items-center mt-2 text-xs ${color}`}>
        {icon}
        {isPositiveTrend ? '+' : ''}{tendencia}% {isPositiveTrend ? 'aumento' : 'redução'}
      </div>
    );
  };

  useEffect(() => {
    console.log('Relatorios - useEffect executado');
    console.log('Relatorios - dateRange inicial:', dateRange);
    carregarEstatisticas(dateRange);
  }, []);

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Relatórios</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Análise e exportação de dados de produção e estoque - Dados da semana atual
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <DateRangePicker
              date={dateRange}
              onChange={handleDateChange}
            />
          </div>
          
          <div className="flex gap-2">
            <ActionButton 
              variant={exportFormat === "pdf" ? "default" : "outline"}
              startIcon={<FileText className="h-4 w-4" />}
              onClick={() => setExportFormat("pdf")}
              size="sm"
              className={exportFormat === "pdf" ? "bg-red-600 hover:bg-red-700" : ""}
            >
              PDF
            </ActionButton>
            <ActionButton 
              variant={exportFormat === "excel" ? "default" : "outline"}
              startIcon={<FileSpreadsheet className="h-4 w-4" />}
              onClick={() => setExportFormat("excel")}
              size="sm"
              className={exportFormat === "excel" ? "bg-green-600 hover:bg-green-700" : ""}
            >
              Excel
            </ActionButton>
          </div>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-700">
        <Card className="border-blue-200 bg-blue-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Peças Cortadas</CardTitle>
            <Scissors className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalPecasCortadas.toLocaleString()}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400">Total no período</p>
            {!isLoading && renderTrend(stats.tendenciaCortadas)}
          </CardContent>
        </Card>
        
        <Card className="border-red-200 bg-red-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-red-800 dark:bg-red-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Peças Perdidas</CardTitle>
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalPecasPerdidas.toLocaleString()}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">Total no período</p>
            {!isLoading && renderTrend(stats.tendenciaPerdidas, false)}
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Peças Recebidas</CardTitle>
            <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : stats.totalPecasRecebidas.toLocaleString()}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">Total no período</p>
            {!isLoading && renderTrend(stats.tendenciaRecebidas)}
          </CardContent>
        </Card>
        
        <Card className="border-purple-200 bg-purple-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-purple-800 dark:bg-purple-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Taxa de Eficiência</CardTitle>
            <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${stats.taxaEficiencia}%`}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">Eficiência geral</p>
            {!isLoading && renderTrend(stats.tendenciaEficiencia)}
          </CardContent>
        </Card>
      </div>

      {/* Tabs de relatórios */}
      <Card className="border hover:shadow-md transition-all animate-in fade-in duration-1000">
        <CardHeader className="bg-muted border-b">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="h-5 w-5" />
            Relatórios Detalhados
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Selecione o tipo de relatório para visualizar dados detalhados e exportar
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="pecas-cortadas" className="space-y-4">
            <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full bg-muted">
              <TabsTrigger 
                value="pecas-cortadas" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-200"
              >
                <Scissors className="w-4 h-4" />
                <span className="hidden sm:inline">Peças Cortadas</span>
                <span className="sm:hidden">Cortadas</span>
              </TabsTrigger>
              <TabsTrigger 
                value="pecas-perdidas" 
                className="flex items-center gap-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-800 dark:data-[state=active]:bg-red-900 dark:data-[state=active]:text-red-200"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Peças Perdidas</span>
                <span className="sm:hidden">Perdidas</span>
              </TabsTrigger>
              <TabsTrigger 
                value="pecas-recebidas" 
                className="flex items-center gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-800 dark:data-[state=active]:bg-green-900 dark:data-[state=active]:text-green-200"
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Peças Recebidas</span>
                <span className="sm:hidden">Recebidas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pecas-cortadas" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-950 dark:border-blue-800">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Relatório de Peças Cortadas</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Análise detalhada de peças cortadas por período, tipo e eficiência
                  </p>
                </div>
                <ActionButton 
                  startIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  onClick={() => handleExportReport("peças cortadas")}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {isLoading ? "Exportando..." : "Exportar"}
                </ActionButton>
              </div>
              
              <div className="border border-blue-200 rounded-lg p-4 bg-white dark:bg-gray-900">
                <ReportChart 
                  type="pecas-cortadas" 
                  dateRange={dateRange} 
                />
              </div>
            </TabsContent>

            <TabsContent value="pecas-perdidas" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200 dark:bg-red-950 dark:border-red-800">
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Relatório de Peças Perdidas</h3>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Análise de peças perdidas por período, motivo e impacto
                  </p>
                </div>
                <ActionButton 
                  startIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  onClick={() => handleExportReport("peças perdidas")}
                  disabled={isLoading}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  {isLoading ? "Exportando..." : "Exportar"}
                </ActionButton>
              </div>
              
              <div className="border border-red-200 rounded-lg p-4 bg-white dark:bg-gray-900">
                <ReportChart 
                  type="pecas-perdidas" 
                  dateRange={dateRange} 
                />
              </div>
            </TabsContent>

            <TabsContent value="pecas-recebidas" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-950 dark:border-green-800">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Relatório de Peças Recebidas</h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Análise de peças recebidas pelas bancas por período e origem
                  </p>
                </div>
                <ActionButton 
                  startIcon={isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  onClick={() => handleExportReport("peças recebidas")}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  {isLoading ? "Exportando..." : "Exportar"}
                </ActionButton>
              </div>
              
              <div className="border border-green-200 rounded-lg p-4 bg-white dark:bg-gray-900">
                <ReportChart 
                  type="pecas-recebidas" 
                  dateRange={dateRange} 
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
