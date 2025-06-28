import { useState, useEffect } from "react";
import { 
  Download, BarChart3, TrendingUp,
  PackageSearch, LineChart, ShoppingCart, Scissors, AlertTriangle,
  Wrench, Package, Filter, Calendar, Loader2, CheckCircle, Clock, FileText, FileSpreadsheet
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
      
      // Buscar dados dos últimos meses para cada tipo de relatório, passando as datas
      const [cortadasData, recebidasData, perdidasData] = await Promise.all([
        fichasService.buscarCortadasUltimosMeses(dataInicio, dataFim),
        fichasService.buscarRecebidosUltimosMeses(dataInicio, dataFim),
        fichasService.buscarPerdidasUltimosMeses(dataInicio, dataFim)
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
      
      // Em caso de erro, zerar as estatísticas
      const statsVazios = {
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
      };
      
      console.log('Relatórios - Erro ao carregar dados, zerando estatísticas');
      setStats(statsVazios);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = async (format: "pdf" | "excel") => {
    try {
      setIsLoading(true);
      
      // Formatar as datas para incluir no nome do arquivo
      const dataInicio = dateRange.from ? dateRange.from.toISOString().split('T')[0] : '';
      const dataFim = dateRange.to ? dateRange.to.toISOString().split('T')[0] : '';
      
      // Buscar todos os dados dos relatórios
      const [cortadasData, recebidasData, perdidasData] = await Promise.all([
        fichasService.buscarCortadasUltimosMeses(dataInicio, dataFim),
        fichasService.buscarRecebidosUltimosMeses(dataInicio, dataFim),
        fichasService.buscarPerdidasUltimosMeses(dataInicio, dataFim)
      ]);
      
      if (format === "excel") {
        await exportarExcel(cortadasData, recebidasData, perdidasData, dataInicio, dataFim);
      } else {
        await exportarPDF(cortadasData, recebidasData, perdidasData, dataInicio, dataFim);
      }
      
    } catch (error) {
      toast.error("Erro ao exportar relatório");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportSpecificReport = async (reportType: "cortadas" | "recebidas" | "perdidas", format: "pdf" | "excel") => {
    try {
      setIsLoading(true);
      
      // Formatar as datas para incluir no nome do arquivo
      const dataInicio = dateRange.from ? dateRange.from.toISOString().split('T')[0] : '';
      const dataFim = dateRange.to ? dateRange.to.toISOString().split('T')[0] : '';
      
      let data;
      let reportName;
      
      // Buscar dados específicos do relatório
      switch (reportType) {
        case "cortadas":
          data = await fichasService.buscarCortadasUltimosMeses(dataInicio, dataFim);
          reportName = "peças cortadas";
          break;
        case "recebidas":
          data = await fichasService.buscarRecebidosUltimosMeses(dataInicio, dataFim);
          reportName = "peças recebidas";
          break;
        case "perdidas":
          data = await fichasService.buscarPerdidasUltimosMeses(dataInicio, dataFim);
          reportName = "peças perdidas";
          break;
      }
      
      if (format === "excel") {
        await exportarExcelEspecifico(data, reportType, dataInicio, dataFim);
      } else {
        await exportarPDFEspecifico(data, reportType, dataInicio, dataFim);
      }
      
    } catch (error) {
      toast.error("Erro ao exportar relatório específico");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportarExcel = async (cortadasData: any[], recebidasData: any[], perdidasData: any[], dataInicio: string, dataFim: string) => {
    // Criar workbook
    const workbook = XLSX.utils.book_new();
    
    // 1. Planilha de Resumo Executivo
    const resumoExecutivo = [
      { 'Métrica': 'Total de Peças Cortadas', 'Valor': stats.totalPecasCortadas },
      { 'Métrica': 'Total de Peças Recebidas', 'Valor': stats.totalPecasRecebidas },
      { 'Métrica': 'Total de Peças Perdidas', 'Valor': stats.totalPecasPerdidas },
      { 'Métrica': 'Taxa de Eficiência (%)', 'Valor': stats.taxaEficiencia },
      { 'Métrica': 'Média de Peças Cortadas/Mês', 'Valor': stats.mediaCortadas },
      { 'Métrica': 'Média de Peças Recebidas/Mês', 'Valor': stats.mediaRecebidas },
      { 'Métrica': 'Média de Peças Perdidas/Mês', 'Valor': stats.mediaPerdidas },
      { 'Métrica': 'Maior Corte em um Mês', 'Valor': stats.maiorCorte },
      { 'Métrica': 'Maior Recebimento em um Mês', 'Valor': stats.maiorRecebimento },
      { 'Métrica': 'Maior Perda em um Mês', 'Valor': stats.maiorPerda },
      { 'Métrica': 'Tendência Peças Cortadas (%)', 'Valor': stats.tendenciaCortadas },
      { 'Métrica': 'Tendência Peças Recebidas (%)', 'Valor': stats.tendenciaRecebidas },
      { 'Métrica': 'Tendência Peças Perdidas (%)', 'Valor': stats.tendenciaPerdidas },
      { 'Métrica': 'Tendência Eficiência (%)', 'Valor': stats.tendenciaEficiencia },
      { 'Métrica': '', 'Valor': '' },
      { 'Métrica': 'Período do Relatório', 'Valor': `${dataInicio} a ${dataFim}` },
      { 'Métrica': 'Data de Geração', 'Valor': format(new Date(), 'dd/MM/yyyy às HH:mm', { locale: ptBR }) },
      { 'Métrica': 'Gerado por', 'Valor': 'Sistema SGE FireBlue' }
    ];
    
    const worksheetResumo = XLSX.utils.json_to_sheet(resumoExecutivo);
    worksheetResumo['!cols'] = [{ wch: 35 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, worksheetResumo, 'Resumo Executivo');
    
    // 2. Planilha de Peças Cortadas
    const dadosCortadas = cortadasData.map(item => ({
      'Mês': item.mes || 'N/A',
      'Total Cortada': Number(item.total_cortada) || 0,
      'Data de Referência': item.data_referencia || 'N/A'
    }));
    
    const worksheetCortadas = XLSX.utils.json_to_sheet(dadosCortadas);
    worksheetCortadas['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, worksheetCortadas, 'Peças Cortadas');
    
    // 3. Planilha de Peças Recebidas
    const dadosRecebidas = recebidasData.map(item => ({
      'Mês': item.mes || 'N/A',
      'Total Recebido': Number(item.total_recebido) || 0,
      'Data de Referência': item.data_referencia || 'N/A'
    }));
    
    const worksheetRecebidas = XLSX.utils.json_to_sheet(dadosRecebidas);
    worksheetRecebidas['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, worksheetRecebidas, 'Peças Recebidas');
    
    // 4. Planilha de Peças Perdidas
    const dadosPerdidas = perdidasData.map(item => ({
      'Mês': item.mes || 'N/A',
      'Total Perdido': Number(item.total_perdido) || 0,
      'Data de Referência': item.data_referencia || 'N/A'
    }));
    
    const worksheetPerdidas = XLSX.utils.json_to_sheet(dadosPerdidas);
    worksheetPerdidas['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, worksheetPerdidas, 'Peças Perdidas');
    
    // 5. Planilha de Análise Comparativa
    const analiseComparativa = [];
    const maxLength = Math.max(cortadasData.length, recebidasData.length, perdidasData.length);
    
    for (let i = 0; i < maxLength; i++) {
      analiseComparativa.push({
        'Mês': cortadasData[i]?.mes || recebidasData[i]?.mes || perdidasData[i]?.mes || 'N/A',
        'Peças Cortadas': Number(cortadasData[i]?.total_cortada) || 0,
        'Peças Recebidas': Number(recebidasData[i]?.total_recebido) || 0,
        'Peças Perdidas': Number(perdidasData[i]?.total_perdido) || 0,
        'Eficiência (%)': Number(recebidasData[i]?.total_recebido) > 0 
          ? Math.round(((Number(recebidasData[i]?.total_recebido) - Number(perdidasData[i]?.total_perdido)) / Number(recebidasData[i]?.total_recebido)) * 100 * 10) / 10
          : 0
      });
    }
    
    const worksheetAnalise = XLSX.utils.json_to_sheet(analiseComparativa);
    worksheetAnalise['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];
    XLSX.utils.book_append_sheet(workbook, worksheetAnalise, 'Análise Comparativa');
    
    // Configurar propriedades do workbook
    workbook.Props = {
      Title: 'Relatório Completo de Produção - SGE FireBlue',
      Subject: 'Análise de Produção e Eficiência',
      Author: 'SGE FireBlue',
      CreatedDate: new Date(),
      Keywords: 'produção, eficiência, relatório, peças cortadas, peças recebidas, peças perdidas',
      Category: 'Relatório de Produção'
    };
    
    // Gerar nome do arquivo
    const periodo = dataInicio && dataFim ? `${dataInicio}_a_${dataFim}` : 'completo';
    const nomeArquivo = `relatorio_producao_${periodo}_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xlsx`;
    
    // Salvar arquivo
    XLSX.writeFile(workbook, nomeArquivo);
    
    toast.success(`Relatório Excel exportado com sucesso: ${nomeArquivo}`);
  };

  const exportarPDF = async (cortadasData: any[], recebidasData: any[], perdidasData: any[], dataInicio: string, dataFim: string) => {
    // Importar jspdf-autotable dinamicamente
    const autoTable = await import('jspdf-autotable');
    
    // Criar nova instância do jsPDF
    const doc = new jsPDF();
    
    // Configurar fonte
    doc.setFont('helvetica');
    
    // PÁGINA 1 - Cabeçalho, Resumo Executivo e Cards de Estatísticas
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
    doc.text('Relatório Completo de Produção', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text(`Período: ${dataInicio} a ${dataFim}`, 105, 30, { align: 'center' });
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy às HH:mm', { locale: ptBR })}`, 105, 37, { align: 'center' });
    
    // Resumo Executivo
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Resumo Executivo', 14, 55);
    
    doc.setFontSize(11);
    doc.setTextColor(52, 73, 94);
    doc.text(`• Total de Peças Cortadas: ${stats.totalPecasCortadas.toLocaleString()}`, 20, 70);
    doc.text(`• Total de Peças Recebidas: ${stats.totalPecasRecebidas.toLocaleString()}`, 20, 77);
    doc.text(`• Total de Peças Perdidas: ${stats.totalPecasPerdidas.toLocaleString()}`, 20, 84);
    doc.text(`• Taxa de Eficiência: ${stats.taxaEficiencia}%`, 20, 91);
    doc.text(`• Média de Peças Cortadas/Mês: ${stats.mediaCortadas}`, 20, 98);
    doc.text(`• Média de Peças Recebidas/Mês: ${stats.mediaRecebidas}`, 20, 105);
    doc.text(`• Média de Peças Perdidas/Mês: ${stats.mediaPerdidas}`, 20, 112);
    doc.text(`• Maior Corte em um Mês: ${stats.maiorCorte}`, 20, 119);
    doc.text(`• Maior Recebimento em um Mês: ${stats.maiorRecebimento}`, 20, 126);
    doc.text(`• Maior Perda em um Mês: ${stats.maiorPerda}`, 20, 133);
    
    // Tendências
    doc.setFontSize(14);
    doc.setTextColor(44, 62, 80);
    doc.text('Tendências', 14, 145);
    
    doc.setFontSize(11);
    doc.setTextColor(52, 73, 94);
    doc.text(`• Peças Cortadas: ${stats.tendenciaCortadas > 0 ? '+' : ''}${stats.tendenciaCortadas}%`, 20, 155);
    doc.text(`• Peças Recebidas: ${stats.tendenciaRecebidas > 0 ? '+' : ''}${stats.tendenciaRecebidas}%`, 20, 162);
    doc.text(`• Peças Perdidas: ${stats.tendenciaPerdidas > 0 ? '+' : ''}${stats.tendenciaPerdidas}%`, 20, 169);
    doc.text(`• Eficiência: ${stats.tendenciaEficiencia > 0 ? '+' : ''}${stats.tendenciaEficiencia}%`, 20, 176);
    
    // PÁGINA 2 - Análise Detalhada (Peças Cortadas e Recebidas)
    doc.addPage();
    
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text('Análise Detalhada de Produção', 14, 20);
    
    // Peças Cortadas
    doc.setFontSize(14);
    doc.setTextColor(52, 73, 94);
    doc.text('Peças Cortadas por Mês', 14, 35);
    
    const dadosCortadas = cortadasData.map(item => [
      item.mes || 'N/A',
      Number(item.total_cortada) || 0,
      item.data_referencia || 'N/A'
    ]);
    
    autoTable.default(doc, {
      startY: 40,
      head: [['Mês', 'Total Cortada', 'Data de Referência']],
      body: dadosCortadas,
      theme: 'grid',
      headStyles: { 
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 9
      },
      bodyStyles: { 
        fontSize: 8,
        textColor: 44
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 40 },
      styles: {
        cellPadding: 2,
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 50 }, // Mês
        1: { cellWidth: 40 }, // Total Cortada
        2: { cellWidth: 50 }  // Data de Referência
      }
    });
    
    // Peças Recebidas (na mesma página)
    const currentY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(52, 73, 94);
    doc.text('Peças Recebidas por Mês', 14, currentY);
    
    const dadosRecebidas = recebidasData.map(item => [
      item.mes || 'N/A',
      Number(item.total_recebido) || 0,
      item.data_referencia || 'N/A'
    ]);
    
    autoTable.default(doc, {
      startY: currentY + 5,
      head: [['Mês', 'Total Recebido', 'Data de Referência']],
      body: dadosRecebidas,
      theme: 'grid',
      headStyles: { 
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 9
      },
      bodyStyles: { 
        fontSize: 8,
        textColor: 44
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: currentY + 5 },
      styles: {
        cellPadding: 2,
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 50 }, // Mês
        1: { cellWidth: 40 }, // Total Recebido
        2: { cellWidth: 50 }  // Data de Referência
      }
    });
    
    // PÁGINA 3 - Peças Perdidas e Análise Comparativa
    doc.addPage();
    
    doc.setFontSize(18);
    doc.setTextColor(44, 62, 80);
    doc.text('Análise de Perdas e Comparativo', 14, 20);
    
    // Peças Perdidas
    doc.setFontSize(14);
    doc.setTextColor(52, 73, 94);
    doc.text('Peças Perdidas por Mês', 14, 35);
    
    const dadosPerdidas = perdidasData.map(item => [
      item.mes || 'N/A',
      Number(item.total_perdido) || 0,
      item.data_referencia || 'N/A'
    ]);
    
    autoTable.default(doc, {
      startY: 40,
      head: [['Mês', 'Total Perdido', 'Data de Referência']],
      body: dadosPerdidas,
      theme: 'grid',
      headStyles: { 
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 9
      },
      bodyStyles: { 
        fontSize: 8,
        textColor: 44
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 40 },
      styles: {
        cellPadding: 2,
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 50 }, // Mês
        1: { cellWidth: 40 }, // Total Perdido
        2: { cellWidth: 50 }  // Data de Referência
      }
    });
    
    // Análise Comparativa (na mesma página)
    const currentY2 = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(14);
    doc.setTextColor(52, 73, 94);
    doc.text('Análise Comparativa Mensal', 14, currentY2);
    
    const analiseComparativa = [];
    const maxLength = Math.max(cortadasData.length, recebidasData.length, perdidasData.length);
    
    for (let i = 0; i < maxLength; i++) {
      const eficiencia = Number(recebidasData[i]?.total_recebido) > 0 
        ? Math.round(((Number(recebidasData[i]?.total_recebido) - Number(perdidasData[i]?.total_perdido)) / Number(recebidasData[i]?.total_recebido)) * 100 * 10) / 10
        : 0;
      
      analiseComparativa.push([
        cortadasData[i]?.mes || recebidasData[i]?.mes || perdidasData[i]?.mes || 'N/A',
        Number(cortadasData[i]?.total_cortada) || 0,
        Number(recebidasData[i]?.total_recebido) || 0,
        Number(perdidasData[i]?.total_perdido) || 0,
        eficiencia
      ]);
    }
    
    autoTable.default(doc, {
      startY: currentY2 + 5,
      head: [['Mês', 'Cortadas', 'Recebidas', 'Perdidas', 'Eficiência (%)']],
      body: analiseComparativa,
      theme: 'grid',
      headStyles: { 
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 8
      },
      bodyStyles: { 
        fontSize: 7,
        textColor: 44
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: currentY2 + 5 },
      styles: {
        cellPadding: 1,
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 35 }, // Mês
        1: { cellWidth: 25 }, // Cortadas
        2: { cellWidth: 25 }, // Recebidas
        3: { cellWidth: 25 }, // Perdidas
        4: { cellWidth: 25 }  // Eficiência
      }
    });
    
    // Adicionar rodapé em todas as páginas
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.height - 10);
      doc.text(`Relatório gerado em ${new Date().toLocaleString('pt-BR')}`, 14, doc.internal.pageSize.height - 5);
    }
    
    // Gerar nome do arquivo
    const periodo = dataInicio && dataFim ? `${dataInicio}_a_${dataFim}` : 'completo';
    const nomeArquivo = `relatorio_producao_${periodo}_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`;
    
    // Salvar arquivo
    doc.save(nomeArquivo);
    
    toast.success(`Relatório PDF exportado com sucesso: ${nomeArquivo}`);
  };

  const exportarExcelEspecifico = async (data: any[], reportType: string, dataInicio: string, dataFim: string) => {
    // Criar workbook
    const workbook = XLSX.utils.book_new();
    
    // Configurar dados baseado no tipo de relatório
    let worksheetData;
    let sheetName;
    let totalField;
    
    switch (reportType) {
      case "cortadas":
        worksheetData = data.map(item => ({
          'Mês': item.mes || 'N/A',
          'Total Cortada': Number(item.total_cortada) || 0,
          'Data de Referência': item.data_referencia || 'N/A'
        }));
        sheetName = 'Peças Cortadas';
        totalField = 'total_cortada';
        break;
      case "recebidas":
        worksheetData = data.map(item => ({
          'Mês': item.mes || 'N/A',
          'Total Recebido': Number(item.total_recebido) || 0,
          'Data de Referência': item.data_referencia || 'N/A'
        }));
        sheetName = 'Peças Recebidas';
        totalField = 'total_recebido';
        break;
      case "perdidas":
        worksheetData = data.map(item => ({
          'Mês': item.mes || 'N/A',
          'Total Perdido': Number(item.total_perdido) || 0,
          'Data de Referência': item.data_referencia || 'N/A'
        }));
        sheetName = 'Peças Perdidas';
        totalField = 'total_perdido';
        break;
    }
    
    // Planilha de dados
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    worksheet['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
    
    // Planilha de resumo
    const total = data.reduce((acc, item) => acc + (Number(item[totalField]) || 0), 0);
    const media = data.length > 0 ? Math.round(total / data.length) : 0;
    const maior = data.reduce((max, item) => (Number(item[totalField]) || 0) > max ? (Number(item[totalField]) || 0) : max, 0);
    
    const resumo = [
      { 'Métrica': 'Total', 'Valor': total },
      { 'Métrica': 'Média Mensal', 'Valor': media },
      { 'Métrica': 'Maior Valor Mensal', 'Valor': maior },
      { 'Métrica': 'Quantidade de Meses', 'Valor': data.length },
      { 'Métrica': '', 'Valor': '' },
      { 'Métrica': 'Período do Relatório', 'Valor': `${dataInicio} a ${dataFim}` },
      { 'Métrica': 'Data de Geração', 'Valor': format(new Date(), 'dd/MM/yyyy às HH:mm', { locale: ptBR }) },
      { 'Métrica': 'Gerado por', 'Valor': 'Sistema SGE FireBlue' }
    ];
    
    const worksheetResumo = XLSX.utils.json_to_sheet(resumo);
    worksheetResumo['!cols'] = [{ wch: 35 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, worksheetResumo, 'Resumo');
    
    // Configurar propriedades do workbook
    workbook.Props = {
      Title: `Relatório de ${sheetName} - SGE FireBlue`,
      Subject: `Análise de ${sheetName}`,
      Author: 'SGE FireBlue',
      CreatedDate: new Date(),
      Keywords: `${sheetName.toLowerCase()}, produção, relatório`,
      Category: 'Relatório Específico'
    };
    
    // Gerar nome do arquivo
    const periodo = dataInicio && dataFim ? `${dataInicio}_a_${dataFim}` : 'completo';
    const nomeArquivo = `relatorio_${reportType}_${periodo}_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xlsx`;
    
    // Salvar arquivo
    XLSX.writeFile(workbook, nomeArquivo);
    
    toast.success(`Relatório Excel de ${sheetName} exportado com sucesso: ${nomeArquivo}`);
  };

  const exportarPDFEspecifico = async (data: any[], reportType: string, dataInicio: string, dataFim: string) => {
    // Importar jspdf-autotable dinamicamente
    const autoTable = await import('jspdf-autotable');
    
    // Criar nova instância do jsPDF
    const doc = new jsPDF();
    
    // Configurar fonte
    doc.setFont('helvetica');
    
    // Configurar dados baseado no tipo de relatório
    let reportTitle;
    let dataField;
    let tableHeaders;
    let totalField;
    
    switch (reportType) {
      case "cortadas":
        reportTitle = 'Relatório de Peças Cortadas';
        dataField = 'total_cortada';
        tableHeaders = ['Mês', 'Total Cortada', 'Data de Referência'];
        totalField = 'total_cortada';
        break;
      case "recebidas":
        reportTitle = 'Relatório de Peças Recebidas';
        dataField = 'total_recebido';
        tableHeaders = ['Mês', 'Total Recebido', 'Data de Referência'];
        totalField = 'total_recebido';
        break;
      case "perdidas":
        reportTitle = 'Relatório de Peças Perdidas';
        dataField = 'total_perdido';
        tableHeaders = ['Mês', 'Total Perdido', 'Data de Referência'];
        totalField = 'total_perdido';
        break;
    }
    
    // PÁGINA 1 - Cabeçalho e Resumo
    doc.setFontSize(24);
    doc.setTextColor(44, 62, 80);
    doc.text(reportTitle, 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(52, 73, 94);
    doc.text(`Período: ${dataInicio} a ${dataFim}`, 105, 30, { align: 'center' });
    doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy às HH:mm', { locale: ptBR })}`, 105, 37, { align: 'center' });
    
    // Resumo
    const total = data.reduce((acc, item) => acc + (Number(item[totalField]) || 0), 0);
    const media = data.length > 0 ? Math.round(total / data.length) : 0;
    const maior = data.reduce((max, item) => (Number(item[totalField]) || 0) > max ? (Number(item[totalField]) || 0) : max, 0);
    
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Resumo', 14, 55);
    
    doc.setFontSize(11);
    doc.setTextColor(52, 73, 94);
    doc.text(`• Total: ${total.toLocaleString()}`, 20, 70);
    doc.text(`• Média Mensal: ${media}`, 20, 77);
    doc.text(`• Maior Valor Mensal: ${maior}`, 20, 84);
    doc.text(`• Quantidade de Meses: ${data.length}`, 20, 91);
    
    // Dados detalhados
    doc.setFontSize(16);
    doc.setTextColor(44, 62, 80);
    doc.text('Dados Detalhados', 14, 110);
    
    const tableData = data.map(item => [
      item.mes || 'N/A',
      Number(item[dataField]) || 0,
      item.data_referencia || 'N/A'
    ]);
    
    autoTable.default(doc, {
      startY: 120,
      head: [tableHeaders],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [52, 73, 94],
        textColor: 255,
        fontSize: 10
      },
      bodyStyles: { 
        fontSize: 9,
        textColor: 44
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 120 },
      styles: {
        cellPadding: 3,
        lineWidth: 0.1
      },
      columnStyles: {
        0: { cellWidth: 50 }, // Mês
        1: { cellWidth: 40 }, // Total
        2: { cellWidth: 50 }  // Data de Referência
      }
    });
    
    // Adicionar rodapé
    doc.setFontSize(8);
    doc.setTextColor(128);
    doc.text(`Página 1 de 1`, 14, doc.internal.pageSize.height - 10);
    doc.text(`Relatório gerado em ${new Date().toLocaleString('pt-BR')}`, 14, doc.internal.pageSize.height - 5);
    
    // Gerar nome do arquivo
    const periodo = dataInicio && dataFim ? `${dataInicio}_a_${dataFim}` : 'completo';
    const nomeArquivo = `relatorio_${reportType}_${periodo}_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`;
    
    // Salvar arquivo
    doc.save(nomeArquivo);
    
    toast.success(`Relatório PDF de ${reportTitle} exportado com sucesso: ${nomeArquivo}`);
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
            <DateRangePicker
              date={dateRange}
              onChange={handleDateChange}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Exportar Relatório
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExportReport("pdf")}>
                <FileText className="w-4 h-4 mr-2" />
                Exportar PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExportReport("excel")}>
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Exportar Excel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-700">
        <Card className="border-blue-200 bg-blue-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-blue-800 dark:bg-blue-950 dark:hover:shadow-lg dark:hover:shadow-black/20">
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
        
        <Card className="border-red-200 bg-red-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-red-800 dark:bg-red-950 dark:hover:shadow-lg dark:hover:shadow-black/20">
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
        
        <Card className="border-green-200 bg-green-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-green-800 dark:bg-green-950 dark:hover:shadow-lg dark:hover:shadow-black/20">
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
        
        <Card className="border-purple-200 bg-purple-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-purple-800 dark:bg-purple-950 dark:hover:shadow-lg dark:hover:shadow-black/20">
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
      <Card className="border border-border hover:shadow-md transition-all animate-in fade-in duration-1000 dark:shadow-lg dark:shadow-black/20 dark:hover:shadow-xl dark:hover:shadow-black/30">
        <CardHeader className="bg-muted/30 border-b border-border dark:bg-muted/20">
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
            <TabsList className="grid grid-cols-1 md:grid-cols-3 w-full bg-muted dark:bg-muted/50">
              <TabsTrigger 
                value="pecas-cortadas" 
                className="flex items-center gap-2 data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800 dark:data-[state=active]:bg-blue-900 dark:data-[state=active]:text-blue-200 transition-colors"
              >
                <Scissors className="w-4 h-4" />
                <span className="hidden sm:inline">Peças Cortadas</span>
                <span className="sm:hidden">Cortadas</span>
              </TabsTrigger>
              <TabsTrigger 
                value="pecas-perdidas" 
                className="flex items-center gap-2 data-[state=active]:bg-red-100 data-[state=active]:text-red-800 dark:data-[state=active]:bg-red-900 dark:data-[state=active]:text-red-200 transition-colors"
              >
                <AlertTriangle className="w-4 h-4" />
                <span className="hidden sm:inline">Peças Perdidas</span>
                <span className="sm:hidden">Perdidas</span>
              </TabsTrigger>
              <TabsTrigger 
                value="pecas-recebidas" 
                className="flex items-center gap-2 data-[state=active]:bg-green-100 data-[state=active]:text-green-800 dark:data-[state=active]:bg-green-900 dark:data-[state=active]:text-green-200 transition-colors"
              >
                <Package className="w-4 h-4" />
                <span className="hidden sm:inline">Peças Recebidas</span>
                <span className="sm:hidden">Recebidas</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="pecas-cortadas" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200 dark:bg-blue-950/50 dark:border-blue-800/50 hover:shadow-sm dark:hover:shadow-md dark:hover:shadow-black/10 transition-all">
                <div>
                  <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">Relatório de Peças Cortadas</h3>
                  <p className="text-sm text-blue-600 dark:text-blue-400">
                    Análise detalhada de peças cortadas por período, tipo e eficiência
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExportSpecificReport("cortadas", "pdf")}>
                      <FileText className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportSpecificReport("cortadas", "excel")}>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Exportar Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="border border-blue-200 rounded-lg p-4 bg-white dark:bg-card dark:border-blue-800/30 shadow-sm dark:shadow-md dark:shadow-black/10">
                <ReportChart 
                  type="pecas-cortadas" 
                  dateRange={dateRange} 
                />
              </div>
            </TabsContent>

            <TabsContent value="pecas-perdidas" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-red-50 rounded-lg border border-red-200 dark:bg-red-950/50 dark:border-red-800/50 hover:shadow-sm dark:hover:shadow-md dark:hover:shadow-black/10 transition-all">
                <div>
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-200">Relatório de Peças Perdidas</h3>
                  <p className="text-sm text-red-600 dark:text-red-400">
                    Análise de peças perdidas por período, motivo e impacto
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExportSpecificReport("perdidas", "pdf")}>
                      <FileText className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportSpecificReport("perdidas", "excel")}>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Exportar Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="border border-red-200 rounded-lg p-4 bg-white dark:bg-card dark:border-red-800/30 shadow-sm dark:shadow-md dark:shadow-black/10">
                <ReportChart 
                  type="pecas-perdidas" 
                  dateRange={dateRange} 
                />
              </div>
            </TabsContent>

            <TabsContent value="pecas-recebidas" className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 bg-green-50 rounded-lg border border-green-200 dark:bg-green-950/50 dark:border-green-800/50 hover:shadow-sm dark:hover:shadow-md dark:hover:shadow-black/10 transition-all">
                <div>
                  <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">Relatório de Peças Recebidas</h3>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    Análise de peças recebidas pelas bancas por período e origem
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Download className="h-4 w-4 mr-2" />}
                      Exportar
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleExportSpecificReport("recebidas", "pdf")}>
                      <FileText className="w-4 h-4 mr-2" />
                      Exportar PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleExportSpecificReport("recebidas", "excel")}>
                      <FileSpreadsheet className="w-4 h-4 mr-2" />
                      Exportar Excel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              <div className="border border-green-200 rounded-lg p-4 bg-white dark:bg-card dark:border-green-800/30 shadow-sm dark:shadow-md dark:shadow-black/10">
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
