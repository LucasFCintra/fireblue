import { useState, useEffect } from "react";
import { 
  Package, FileText, Download, Filter, Edit, Trash2, Plus, 
  Search, Loader2, Scissors, History, CheckCircle, Clock, CircleDot, Truck, MoveRight, Copy, AlertTriangle, MoreVertical, BarChart3 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import DataTable from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ActionButton } from "@/components/ActionButton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { fichasService, Ficha } from "@/services/fichasService";
import { ReactNode } from "react";
import { StatusTrackingCard } from "@/components/StatusTrackingCard";
import { MovimentacaoModal } from "@/components/fichas/MovimentacaoModal";
import { bancasService, Banca } from "@/services/bancasService";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RecebimentoParcialModal } from "@/components/fichas/RecebimentoParcialModal";
import { produtosService, Produto } from "@/services/produtosService";
import { RegistroPerdaModal } from "@/components/fichas/RegistroPerdaModal";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function Fichas() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<Ficha | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMovimentacaoDialogOpen, setIsMovimentacaoDialogOpen] = useState(false);
  const [isConcluirFichaDialogOpen, setIsConcluirFichaDialogOpen] = useState(false);
  const [isNovaFichaDialogOpen, setIsNovaFichaDialogOpen] = useState(false);
  const [isRecebimentoParcialDialogOpen, setIsRecebimentoParcialDialogOpen] = useState(false);
  const [isRegistroPerdaDialogOpen, setIsRegistroPerdaDialogOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<Ficha[]>([]);
  const [statusSummary, setStatusSummary] = useState({
    'aguardando_retirada': 0,
    'em_producao': 0,
    'concluido': 0,
    'recebido_parcialmente': 0
  });
  
  // Estado para nova ficha
  const [novaFicha, setNovaFicha] = useState<Omit<Ficha, 'id'>>({
    codigo: "",
    banca: "",
    data_entrada: new Date(),
    data_previsao: new Date(),
    quantidade: 0,
    quantidade_recebida: 0,
    quantidade_perdida: 0,
    status: "aguardando_retirada",
    produto: "",
    produto_id: "",
    cor: "",
    tamanho: "M",
    observacoes: ""
  });
  
  // Estado para ficha em edição
  const [fichaEditando, setFichaEditando] = useState<Ficha | null>(null);
  
  // Estado para os filtros
  const [filtros, setFiltros] = useState({
    status: "",
    banca: "",
    dataInicio: "",
    dataFim: ""
  });
  
  // Estado para bancas
  const [bancas, setBancas] = useState<Banca[]>([]);
  
  // Estado para todas as fichas (sem filtros)
  const [todasFichas, setTodasFichas] = useState<Ficha[]>([]);
  
  // Estado para produtos
  const [produtos, setProdutos] = useState<Produto[]>([]);
  
  // Estatísticas (agora usando todasFichas ao invés de filteredData)
  const totalPecasCortadas = todasFichas.reduce((total, ficha) => total + ficha.quantidade, 0);
  const totalFichasCriadas = todasFichas.length;
  const totalFichasConcluidas = todasFichas.filter(ficha => ficha.status === "concluido").length;
  
  // Estado para filtrar bancas
  const [bancaSearchQuery, setBancaSearchQuery] = useState("");
  
  // Estado para filtrar produtos
  const [produtoSearchQuery, setProdutoSearchQuery] = useState("");
  
  // Estado para armazenar as perdas por ficha
  const [perdasPorFicha, setPerdasPorFicha] = useState<Record<number, number>>({});
  
  // Função para carregar as perdas das fichas
  const carregarPerdas = async (fichas: Ficha[]) => {
    try {
      const perdas: Record<number, number> = {};
      
      // Para cada ficha concluída, buscar as movimentações de perda
      for (const ficha of fichas.filter(f => f.status === "concluido")) {
        const response = await fetch(`http://192.168.100.134:8687/api/movimentacoes-fichas/${ficha.id}`);
        const movimentacoes = await response.json();
        
        // Somar todas as perdas da ficha
        const totalPerdas = movimentacoes
          .filter((m: any) => m.tipo === "Perda")
          .reduce((total: number, m: any) => total + m.quantidade, 0);
        
        perdas[ficha.id] = totalPerdas;
      }
      
      setPerdasPorFicha(perdas);
    } catch (error) {
      console.error("Erro ao carregar perdas:", error);
    }
  };
  
  // Função para carregar as fichas
  const carregarFichas = async () => {
    try {
      setIsLoading(true);
      const fichas = await fichasService.listarFichas();
      setTodasFichas(fichas);
      setFilteredData(fichas);
      
      // Carregar resumo de status
      const response = await fetch('http://192.168.100.134:8687/api/fichas/summary/status');
      const summary = await response.json();
      setStatusSummary(summary);
      
      // Carregar perdas para fichas concluídas
      await carregarPerdas(fichas);
    } catch (error) {
      toast.error("Erro ao carregar fichas");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para carregar as bancas
  const carregarBancas = async () => {
    try {
      const data = await bancasService.listarBancas();
      setBancas(data);
    } catch (error) {
      toast.error("Erro ao carregar bancas");
      console.error(error);
    }
  };
  
  // Função para carregar os produtos
  const carregarProdutos = async () => {
    try {
      const data = await produtosService.listarProdutos();
      setProdutos(data);
    } catch (error) {
      toast.error("Erro ao carregar produtos");
      console.error(error);
    }
  };
  
  // Carregar dados iniciais
  useEffect(() => {
    void carregarFichas();
    void carregarBancas();
    void carregarProdutos();
  }, []);
  
  // Função para lidar com a pesquisa
  // (REMOVIDA)
  
  // Função para abrir o diálogo de exclusão
  const handleOpenDeleteDialog = (ficha: Ficha) => {
    setSelectedFicha(ficha);
    setIsDeleteDialogOpen(true);
  };
  
  // Função para lidar com a exclusão
  const handleDelete = async () => {
    if (!selectedFicha) return;
    
    try {
      setIsLoading(true);
      await fichasService.excluirFicha(selectedFicha.id);
      
      // Recarregar todas as fichas para garantir dados atualizados
      await carregarFichas();
      
      setIsDeleteDialogOpen(false);
      setSelectedFicha(null);
      toast.success(`Ficha ${selectedFicha.codigo} removida com sucesso`);
    } catch (error) {
      toast.error("Erro ao excluir ficha");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para abrir o diálogo de edição
  const handleOpenEditDialog = (ficha: Ficha) => {
    setBancaSearchQuery("");
    setProdutoSearchQuery("");
    
    // Formatar as datas corretamente
    const fichaComDatasFormatadas = {
      ...ficha,
      data_entrada: ficha.data_entrada instanceof Date 
        ? ficha.data_entrada.toISOString().split('T')[0]
        : new Date(ficha.data_entrada).toISOString().split('T')[0],
      data_previsao: ficha.data_previsao instanceof Date
        ? ficha.data_previsao.toISOString().split('T')[0]
        : new Date(ficha.data_previsao).toISOString().split('T')[0]
    };
    
    setFichaEditando(fichaComDatasFormatadas);
    setIsEditDialogOpen(true);
  };
  
  // Função para lidar com a edição
  const handleEdit = async () => {
    if (!fichaEditando) return;
    
    try {
      setIsLoading(true);
      const fichaParaAtualizar = {
        ...fichaEditando,
        data_entrada: new Date(fichaEditando.data_entrada).toISOString(),
        data_previsao: new Date(fichaEditando.data_previsao).toISOString(),
        quantidade: Number(fichaEditando.quantidade)
      };
      
      const fichaAtualizada = await fichasService.atualizarFicha(fichaParaAtualizar);
      
      // Atualizar a lista local
      const novaLista = filteredData.map(ficha => 
        ficha.id === fichaAtualizada.id ? fichaAtualizada : ficha
      );
      setFilteredData(novaLista);
      
      setIsEditDialogOpen(false);
      setFichaEditando(null);
      toast.success(`Ficha ${fichaAtualizada.codigo} atualizada com sucesso`);
      
      // Recarregar todas as fichas para garantir dados atualizados
      await carregarFichas();
    } catch (error) {
      toast.error("Erro ao atualizar ficha");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para abrir o diálogo de movimentação
  const handleOpenMovimentacaoDialog = (ficha: Ficha) => {
    setSelectedFicha(ficha);
    setIsMovimentacaoDialogOpen(true);
  };
  
  // Função para abrir o diálogo de conclusão
  const handleOpenConcluirDialog = (ficha: Ficha) => {
    setSelectedFicha(ficha);
    setIsConcluirFichaDialogOpen(true);
  };
  
  // Função para lidar com a conclusão da ficha
  const handleConcluirFicha = async () => {
    if (!selectedFicha) return;
    
    // Calcular a quantidade em produção (quantidade total menos quantidade já recebida e perdida)
    const quantidadeRecebida = selectedFicha.quantidade_recebida || 0;
    const quantidadePerdida = selectedFicha.quantidade_perdida || 0;
    const quantidadeEmProducao = selectedFicha.quantidade - quantidadeRecebida - quantidadePerdida;
    
    try {
      setIsLoading(true);
      await fichasService.registrarMovimentacao(
        selectedFicha.id,
        "Conclusão",
        quantidadeEmProducao,
        "Conclusão da produção",
        "Sistema"
      );
      
      // Recarregar todas as fichas para garantir dados atualizados
      await carregarFichas();
      
      setIsConcluirFichaDialogOpen(false);
      setSelectedFicha(null);
      toast.success(`Ficha ${selectedFicha.codigo} concluída com sucesso`);
    } catch (error) {
      toast.error("Erro ao concluir ficha");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para lidar com a adição de uma nova ficha
  const handleAddFicha = () => {
    setBancaSearchQuery("");
    setProdutoSearchQuery("");
    setIsNovaFichaDialogOpen(true);
  };
  
  // Função para lidar com a criação de uma nova ficha
  const handleCreateFicha = async () => {
    try {
      setIsLoading(true);
      const fichaParaCriar = {
        ...novaFicha,
        data_entrada: novaFicha.data_entrada instanceof Date ? novaFicha.data_entrada.toISOString() : novaFicha.data_entrada,
        data_previsao: novaFicha.data_previsao instanceof Date ? novaFicha.data_previsao.toISOString() : novaFicha.data_previsao,
        quantidade: Number(novaFicha.quantidade)
      };
      const novaFichaCriada = await fichasService.criarFicha(fichaParaCriar);
      
      setFilteredData([novaFichaCriada, ...filteredData]);
      
      setIsNovaFichaDialogOpen(false);
      setNovaFicha({
        codigo: "",
        banca: "",
        data_entrada: new Date(),
        data_previsao: new Date(),
        quantidade: 0,
        quantidade_recebida: 0,
        quantidade_perdida: 0,
        status: "aguardando_retirada",
        produto: "",
        produto_id: "",
        cor: "",
        tamanho: "M",
        observacoes: ""
      });
      toast.success("Ficha criada com sucesso");
    } catch (error) {
      toast.error("Erro ao criar ficha");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para lidar com a exportação
  const handleExport = async (format: string) => {
    try {
      setIsLoading(true);
      
      if (format === "excel") {
        await exportarParaExcel();
      } else if (format === "pdf") {
        await exportarParaPDF();
      } else {
        // Em um ambiente real, você faria a chamada ao serviço
        // const response = await fetch(`${API_URL}/fichas/exportar/${format}`...
        
        // Simulando a exportação
        setTimeout(() => {
          toast.success(`Dados exportados com sucesso em formato ${format}`);
          setIsLoading(false);
        }, 1000);
      }
    } catch (error) {
      toast.error("Erro ao exportar dados");
      console.error(error);
      setIsLoading(false);
    }
  };
  
  // Função para exportar dados para Excel
  const exportarParaExcel = async () => {
    try {
      // Preparar dados para exportação (fichas filtradas)
      const dadosParaExportar = filteredData.map(ficha => {
        const dataEntrada = ficha.data_entrada instanceof Date ? ficha.data_entrada : new Date(ficha.data_entrada);
        const dataPrevisao = ficha.data_previsao instanceof Date ? ficha.data_previsao : new Date(ficha.data_previsao);
        
        return {
          'Código': ficha.codigo,
          'Banca': ficha.banca,
          'Data de Entrada': format(dataEntrada, 'dd/MM/yyyy', { locale: ptBR }),
          'Previsão de Retorno': format(dataPrevisao, 'dd/MM/yyyy', { locale: ptBR }),
          'Quantidade': ficha.quantidade,
          'Quantidade Recebida': ficha.quantidade_recebida || 0,
          'Quantidade Perdida': ficha.quantidade_perdida || 0,
          'Status': getStatusDisplayName(ficha.status),
          'Produto': ficha.produto,
          'Cor': ficha.cor,
          'Tamanho': ficha.tamanho,
          'Observações': ficha.observacoes || ''
        };
      });
      
      // Criar workbook
      const workbook = XLSX.utils.book_new();
      
      // 1. Planilha principal com dados das fichas
      const worksheetPrincipal = XLSX.utils.json_to_sheet(dadosParaExportar);
      worksheetPrincipal['!cols'] = [
        { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 18 }, 
        { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 20 }, 
        { wch: 25 }, { wch: 15 }, { wch: 10 }, { wch: 30 }
      ];
      XLSX.utils.book_append_sheet(workbook, worksheetPrincipal, 'Fichas de Produção');
      
      // 2. Planilha com resumo do rastreamento geral
      const resumoRastreamento = [
        { 'Status': 'Todas as Fichas', 'Quantidade': todasFichas.length, 'Total de Peças': totalPecasCortadas },
        { 'Status': 'Aguardando Retirada', 'Quantidade': statusSummary.aguardando_retirada, 'Total de Peças': calcularQuantidadeAguardandoRetirada(filteredData) },
        { 'Status': 'Em Produção', 'Quantidade': statusSummary.em_producao, 'Total de Peças': calcularQuantidadeEmProducao(filteredData) },
        { 'Status': 'Recebido Parcialmente', 'Quantidade': statusSummary.recebido_parcialmente, 'Total de Peças': calcularQuantidadeRecebidaParcialmente(filteredData) },
        { 'Status': 'Concluído', 'Quantidade': statusSummary.concluido, 'Total de Peças': calcularQuantidadeConcluida(filteredData) }
      ];
      
      const worksheetResumo = XLSX.utils.json_to_sheet(resumoRastreamento);
      worksheetResumo['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, worksheetResumo, 'Rastreamento Geral');
      
      // 3. Planilha com estatísticas gerais
      const estatisticasGerais = [
        { 'Métrica': 'Total de Peças Cortadas', 'Valor': totalPecasCortadas },
        { 'Métrica': 'Total de Fichas Criadas', 'Valor': totalFichasCriadas },
        { 'Métrica': 'Total de Fichas Concluídas', 'Valor': totalFichasConcluidas },
        { 'Métrica': 'Taxa de Conclusão (%)', 'Valor': totalFichasCriadas > 0 ? ((totalFichasConcluidas / totalFichasCriadas) * 100).toFixed(2) : '0.00' }
      ];
      
      const worksheetEstatisticas = XLSX.utils.json_to_sheet(estatisticasGerais);
      worksheetEstatisticas['!cols'] = [{ wch: 30 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(workbook, worksheetEstatisticas, 'Estatísticas Gerais');
      
      // Gerar nome do arquivo
      const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const horaAtual = new Date().toLocaleTimeString('pt-BR').replace(/:/g, '-').substring(0, 5);
      const nomeArquivo = `Relatorio_Fichas_${dataAtual}_${horaAtual}.xlsx`;
      
      // Salvar arquivo
      XLSX.writeFile(workbook, nomeArquivo);
      
      toast.success(`Relatório Excel exportado com sucesso: ${nomeArquivo}`);
    } catch (error) {
      console.error('Erro ao exportar para Excel:', error);
      toast.error("Erro ao exportar dados para Excel");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para exportar dados para PDF
  const exportarParaPDF = async () => {
    try {
      // Criar novo documento PDF
      const doc = new jsPDF();
      
      // Configurar fonte para suportar caracteres especiais
      doc.setFont('helvetica');
      
      // Título do documento
      doc.setFontSize(20);
      doc.setTextColor(44, 62, 80);
      doc.text('Relatório de Fichas de Produção', 14, 20);
      
      // Informações do relatório
      doc.setFontSize(12);
      doc.setTextColor(52, 73, 94);
      doc.text(`Data de geração: ${new Date().toLocaleDateString('pt-BR')}`, 14, 30);
      doc.text(`Total de fichas analisadas: ${filteredData.length}`, 14, 37);
      doc.text(`Período: ${format(new Date(), 'dd/MM/yyyy HH:mm', { locale: ptBR })}`, 14, 44);
      
      // Estatísticas gerais
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Estatísticas Gerais', 14, 55);
      
      doc.setFontSize(11);
      doc.setTextColor(52, 73, 94);
      doc.text(`• Total de peças cortadas: ${totalPecasCortadas}`, 20, 65);
      doc.text(`• Total de fichas criadas: ${totalFichasCriadas}`, 20, 72);
      doc.text(`• Total de fichas concluídas: ${totalFichasConcluidas}`, 20, 79);
      doc.text(`• Taxa de conclusão: ${totalFichasCriadas > 0 ? ((totalFichasConcluidas / totalFichasCriadas) * 100).toFixed(2) : '0.00'}%`, 20, 86);
      
      // Rastreamento geral
      doc.setFontSize(14);
      doc.setTextColor(44, 62, 80);
      doc.text('Rastreamento Geral', 14, 100);
      
      doc.setFontSize(11);
      doc.setTextColor(52, 73, 94);
      doc.text(`• Todas as fichas: ${todasFichas.length} fichas (${totalPecasCortadas} peças)`, 20, 110);
      doc.text(`• Aguardando retirada: ${statusSummary.aguardando_retirada} fichas (${calcularQuantidadeAguardandoRetirada(filteredData)} peças)`, 20, 117);
      doc.text(`• Em produção: ${statusSummary.em_producao} fichas (${calcularQuantidadeEmProducao(filteredData)} peças)`, 20, 124);
      doc.text(`• Recebido parcialmente: ${statusSummary.recebido_parcialmente} fichas (${calcularQuantidadeRecebidaParcialmente(filteredData)} peças)`, 20, 131);
      doc.text(`• Concluído: ${statusSummary.concluido} fichas (${calcularQuantidadeConcluida(filteredData)} peças)`, 20, 138);
      
      // Preparar dados para a tabela
      const dadosTabela = filteredData.map(ficha => {
        const dataEntrada = ficha.data_entrada instanceof Date ? ficha.data_entrada : new Date(ficha.data_entrada);
        const dataPrevisao = ficha.data_previsao instanceof Date ? ficha.data_previsao : new Date(ficha.data_previsao);
        
        return [
          ficha.codigo,
          ficha.banca,
          format(dataEntrada, 'dd/MM/yyyy', { locale: ptBR }),
          format(dataPrevisao, 'dd/MM/yyyy', { locale: ptBR }),
          ficha.quantidade.toString(),
          (ficha.quantidade_recebida || 0).toString(),
          (ficha.quantidade_perdida || 0).toString(),
          getStatusDisplayName(ficha.status),
          ficha.produto,
          ficha.cor,
          ficha.tamanho
        ];
      });
      
      // Adicionar tabela
      autoTable(doc, {
        startY: 150,
        head: [['Código', 'Banca', 'Entrada', 'Previsão', 'Qtd', 'Recebido', 'Perdido', 'Status', 'Produto', 'Cor', 'Tamanho']],
        body: dadosTabela,
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
        margin: { top: 150 },
        styles: {
          cellPadding: 2,
          lineWidth: 0.1
        },
        columnStyles: {
          0: { cellWidth: 18 }, // Código
          1: { cellWidth: 20 }, // Banca
          2: { cellWidth: 18 }, // Entrada
          3: { cellWidth: 18 }, // Previsão
          4: { cellWidth: 12 }, // Qtd
          5: { cellWidth: 12 }, // Recebido
          6: { cellWidth: 12 }, // Perdido
          7: { cellWidth: 18 }, // Status
          8: { cellWidth: 20 }, // Produto
          9: { cellWidth: 12 }, // Cor
          10: { cellWidth: 12 }  // Tamanho
        }
      });
      
      // Adicionar rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128);
        doc.text(`Página ${i} de ${pageCount}`, 14, doc.internal.pageSize.height - 10);
        doc.text(`Gerado em ${new Date().toLocaleString('pt-BR')}`, 14, doc.internal.pageSize.height - 5);
      }
      
      // Salvar arquivo
      const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const horaAtual = new Date().toLocaleTimeString('pt-BR').replace(/:/g, '-').substring(0, 5);
      const nomeArquivo = `Relatorio_Fichas_${dataAtual}_${horaAtual}.pdf`;
      
      doc.save(nomeArquivo);
      
      toast.success(`Relatório PDF gerado com sucesso: ${nomeArquivo}`);
    } catch (error) {
      console.error('Erro ao exportar para PDF:', error);
      toast.error("Erro ao gerar relatório PDF");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função auxiliar para obter nome de exibição do status
  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'aguardando_retirada':
        return 'Aguardando Retirada';
      case 'em_producao':
        return 'Em Produção';
      case 'concluido':
        return 'Concluído';
      case 'recebido_parcialmente':
        return 'Recebido Parcialmente';
      default:
        return status;
    }
  };
  
  // Função para lidar com a movimentação registrada
  const handleMovimentacaoRegistrada = () => {
    carregarFichas();
  };
  
  // Função para abrir por status
  const handleAbrirPorStatus = async (status: string) => {
    try {
      setIsLoading(true);
      let fichas;
      
      if (status === "em_producao") {
        const response = await fetch('http://192.168.100.134:8687/api/fichas');
        const todasFichas = await response.json();
        fichas = todasFichas.filter(f => f.status === "em_producao");
      } else if (status === "recebido_parcialmente") {
        const response = await fetch('http://192.168.100.134:8687/api/fichas');
        const todasFichas = await response.json();
        fichas = todasFichas.filter(f => f.status === "em_producao" && f.quantidade_recebida > 0);
      } else {
        const response = await fetch(`http://192.168.100.134:8687/api/fichas/list/${status}`);
        fichas = await response.json();
      }
      
      setFilteredData(fichas);
      
      // Se o status for concluído, carregar as perdas
      if (status === "concluido") {
        await carregarPerdas(fichas);
      }
      
      toast.success(`${fichas.length} ficha(s) encontrada(s) no status ${status}`);
    } catch (error) {
      toast.error("Erro ao carregar fichas por status");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para limpar filtros
  // (REMOVIDA)
  
  // Função para filtrar bancas
  const filteredBancas = bancas.filter(banca => 
    banca.nome.toLowerCase().includes(bancaSearchQuery.toLowerCase())
  );
  
  // Função para filtrar produtos
  const filteredProdutos = produtos.filter(produto => 
    produto.nome_produto.toLowerCase().includes(produtoSearchQuery.toLowerCase())
  );
  
  // Função para duplicar uma ficha
  const handleDuplicarFicha = (ficha: Ficha) => {
    setBancaSearchQuery("");
    setProdutoSearchQuery("");
    setNovaFicha({
      codigo: `${ficha.codigo}-COPY`,
      banca: ficha.banca,
      data_entrada: new Date(),
      data_previsao: new Date(),
      quantidade: ficha.quantidade,
      quantidade_recebida: 0,
      quantidade_perdida: 0,
      status: "aguardando_retirada",
      produto: ficha.produto,
      produto_id: ficha.produto_id,
      cor: ficha.cor,
      tamanho: ficha.tamanho,
      observacoes: ficha.observacoes
    });
    setIsNovaFichaDialogOpen(true);
  };
  
  // Função para iniciar produção
  const handleIniciarProducao = async (ficha: Ficha) => {
    try {
      setIsLoading(true);
      const fichaAtualizada = await fichasService.atualizarFicha({
        ...ficha,
        status: "em_producao"
      });
      
      // Atualizar a lista de fichas
      const novaLista = filteredData.map(f => 
        f.id === fichaAtualizada.id ? fichaAtualizada : f
      );
      setFilteredData(novaLista);
      
      // Atualizar o resumo de status
      const response = await fetch('http://192.168.100.134:8687/api/fichas/summary/status');
      const summary = await response.json();
      setStatusSummary(summary);
      
      // Atualizar as estatísticas
      const totalFichasConcluidas = novaLista.filter(f => f.status === "concluido").length;
      const totalPecasCortadas = novaLista.reduce((total, f) => total + f.quantidade, 0);
      
      toast.success(`Ficha ${ficha.codigo} iniciada em produção`);
    } catch (error) {
      toast.error("Erro ao iniciar produção");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para lidar com o recebimento parcial registrado
  const handleRecebimentoParcialRegistrado = () => {
    carregarFichas();
  };
  
  // Função para abrir o diálogo de recebimento parcial
  const handleOpenRecebimentoParcialDialog = (ficha: Ficha) => {
    setSelectedFicha(ficha);
    setIsRecebimentoParcialDialogOpen(true);
  };
  
  // Função para calcular a quantidade em produção
  const calcularQuantidadeEmProducao = (fichas: Ficha[]) => {
    // Se estiver filtrado por recebido parcialmente, mostrar apenas os itens em produção das fichas com recebimento parcial
    if (filtros.status === "recebido_parcialmente") {
      return fichas
        .filter(f => f.status === "em_producao" && f.quantidade_recebida > 0)
        .reduce((total, f) => total + (f.quantidade - (f.quantidade_recebida || 0) - (f.quantidade_perdida || 0)), 0);
    }
    // Se estiver filtrado por em_producao, mostrar apenas os itens filtrados
    if (filtros.status === "em_producao") {
      return fichas
        .filter(f => f.status === "em_producao")
        .reduce((total, f) => total + (f.quantidade - (f.quantidade_recebida || 0) - (f.quantidade_perdida || 0)), 0);
    }
    // Para outros casos, mostrar o total de todos os itens em produção
    return todasFichas
      .filter(f => f.status === "em_producao")
      .reduce((total, f) => total + (f.quantidade - (f.quantidade_recebida || 0) - (f.quantidade_perdida || 0)), 0);
  };

  // Função para calcular a quantidade recebida parcialmente
  const calcularQuantidadeRecebidaParcialmente = (fichas: Ficha[]) => {
    // Sempre mostrar o total de fichas em produção com quantidade recebida
    return todasFichas
      .filter(f => f.status === "em_producao" && f.quantidade_recebida > 0)
      .length;
  };
  
  // Função para calcular a quantidade aguardando retirada
  const calcularQuantidadeAguardandoRetirada = (fichas: Ficha[]) => {
    // Se estiver filtrado por aguardando retirada, mostrar apenas os itens filtrados
    if (filtros.status === "aguardando_retirada") {
      return fichas
        .filter(f => f.status === "aguardando_retirada")
        .reduce((total, f) => total + f.quantidade, 0);
    }
    // Para outros casos, mostrar o total de todos os itens aguardando retirada
    return todasFichas
      .filter(f => f.status === "aguardando_retirada")
      .reduce((total, f) => total + f.quantidade, 0);
  };

  // Função para calcular a quantidade concluída
  const calcularQuantidadeConcluida = (fichas: Ficha[]) => {
    // Se estiver filtrado por concluído, mostrar apenas os itens filtrados
    if (filtros.status === "concluido") {
      return fichas
        .filter(f => f.status === "concluido")
        .reduce((total, f) => total + f.quantidade, 0);
    }
    // Para outros casos, mostrar o total de todos os itens concluídos
    return todasFichas
      .filter(f => f.status === "concluido")
      .reduce((total, f) => total + f.quantidade, 0);
  };
  
  // Colunas para a tabela de fichas
  const columns: {
    accessor: keyof Ficha | ((row: Ficha) => ReactNode);
    header: string;
    cell?: (row: Ficha) => ReactNode;
  }[] = [
    {
      accessor: "codigo" as keyof Ficha,
      header: "Código",
    },
    {
      accessor: "banca" as keyof Ficha,
      header: "Banca",
    },
    {
      accessor: "data_entrada" as keyof Ficha,
      header: "Data de Entrada",
      cell: (row: Ficha) => {
        try {
          const data = new Date(row.data_entrada);
          if (isNaN(data.getTime())) {
            return "Data inválida";
          }
          return format(data, 'dd/MM/yyyy', { locale: ptBR });
        } catch (error) {
          return "Data inválida";
        }
      },
    },
    {
      accessor: "data_previsao" as keyof Ficha,
      header: "Previsão de retorno",
      cell: (row: Ficha) => {
        try {
          const data = new Date(row.data_previsao);
          if (isNaN(data.getTime())) {
            return "Data inválida";
          }
          return format(data, 'dd/MM/yyyy', { locale: ptBR });
        } catch (error) {
          return "Data inválida";
        }
      },
    },
    {
      accessor: "quantidade" as keyof Ficha,
      header: "Quantidade",
      cell: (row: Ficha) => (
        <div className="flex flex-col">
          <span>{row.quantidade} unid.</span>
          {(row.status === "em_producao" || row.status === "recebido_parcialmente") && (
            <div className="text-sm text-gray-500 space-y-1">
              {row.status === "em_producao" && (
                <div>
                  Em produção: {row.quantidade - (row.quantidade_recebida || 0) - (row.quantidade_perdida || 0)} unid.
                </div>
              )}
              {(row.quantidade_recebida > 0) && (
                <div>
                  Recebido: {row.quantidade_recebida} unid.
                </div>
              )}
              {(row.quantidade_perdida > 0) && (
                <div className="text-red-500">
                  Perdido: {row.quantidade_perdida} unid.
                </div>
              )}
            </div>
          )}
          {row.status === "concluido" && (
            <div className="text-sm text-gray-500 space-y-1">
              <div>
                Recebido: {row.quantidade_recebida} unid.
              </div>
              {(row.quantidade_perdida > 0) && (
                <div className="text-red-500">
                  Perdido: {row.quantidade_perdida} unid.
                </div>
              )}
            </div>
          )}
        </div>
      ),
    },
    {
      accessor: "status" as keyof Ficha,
      header: "Status",
      cell: (row: Ficha) => {
        let variant = "default";
        if (row.status === "aguardando_retirada") variant = "outline";
        if (row.status === "em_producao") variant = "default";
        if (row.status === "concluido") variant = "success";
        if (row.status === "recebido_parcialmente") variant = "warning";
        
        return (
          <Badge variant={variant as any}
            className={row.status === "aguardando_retirada" ? "bg-amber-50 text-amber-500 border-amber-200 hover:bg-amber-50" : ""}
          >
            {row.status === "aguardando_retirada" ? "Aguardando Retirada" : 
             row.status === "em_producao" ? "Em Produção" : 
             row.status === "recebido_parcialmente" ? "Recebido Parcialmente" :
             row.status === "concluido" ? "Concluído" : row.status}
          </Badge>
        );
      },
    },
    {
      accessor: "produto" as keyof Ficha,
      header: "Produto",
    },
    {
      accessor: "cor" as keyof Ficha,
      header: "Cor",
    },
    {
      accessor: "tamanho" as keyof Ficha,
      header: "Tamanho",
    },
    {
      accessor: (row: Ficha) => (
        <div className="flex gap-2 justify-end">
          {row.status === "aguardando_retirada" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleDuplicarFicha(row);
              }}
              className="hover:bg-purple-100 dark:hover:bg-purple-900/20 text-purple-600 dark:text-purple-400"
              title="Duplicar Ficha"
            >
              <Copy className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenMovimentacaoDialog(row);
            }}
            className="hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            title="Histórico de Movimentações"
          >
            <History className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditDialog(row);
            }}
            className="hover:bg-indigo-100 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
            title="Editar Ficha"
          >
            <Edit className="h-4 w-4" />
          </Button>
          {(row.status === "em_producao" || row.status === "recebido_parcialmente") && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenRecebimentoParcialDialog(row);
              }}
              className="hover:bg-yellow-100 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
              title="Recebimento Parcial"
            >
              <Truck className="h-4 w-4" />
            </Button>
          )}
          {row.status !== "concluido" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                if (row.status === "aguardando_retirada") {
                  handleIniciarProducao(row);
                } else {
                  handleOpenConcluirDialog(row);
                }
              }}
              className={row.status === "aguardando_retirada" ? "hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"}
              title={row.status === "aguardando_retirada" ? "Iniciar Produção" : "Concluir Ficha"}
            >
              {row.status === "aguardando_retirada" ? <CircleDot className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreVertical className="h-4 w-4 mr-2" />
                Mais Ações
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleOpenRegistroPerdaDialog(row)}>
                <AlertTriangle className="mr-2 h-4 w-4" />
                Registrar Perda
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleOpenDeleteDialog(row)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Ficha
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      header: "Ações",
    },
  ];
  
  // Função para fechar o modal de edição
  const handleCloseEditDialog = () => {
    setBancaSearchQuery("");
    setProdutoSearchQuery("");
    setIsEditDialogOpen(false);
  };

  // Função para fechar o modal de nova ficha
  const handleCloseNovaFichaDialog = () => {
    setBancaSearchQuery("");
    setProdutoSearchQuery("");
    setIsNovaFichaDialogOpen(false);
  };
  
  const handleOpenRegistroPerdaDialog = (ficha: Ficha) => {
    setSelectedFicha(ficha);
    setIsRegistroPerdaDialogOpen(true);
  };

  const handlePerdaRegistrada = () => {
    void carregarFichas();
    setIsRegistroPerdaDialogOpen(false);
  };
  
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Controle de Fichas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie fichas de produção e acompanhe o fluxo de trabalho
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Exportar Relatório
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                <Download className="w-4 h-4 mr-2" /> 
                Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}> 
                <Download className="w-4 h-4 mr-2" /> 
                PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ActionButton
            size="sm"
            startIcon={<Plus className="h-4 w-4" />}
            onClick={handleAddFicha}
            className="bg-primary hover:bg-primary/90"
          >
            Nova Ficha
          </ActionButton>
        </div>
      </div>
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-700">
        <Card className="border-blue-200 bg-blue-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-blue-800 dark:bg-blue-950 dark:hover:shadow-lg dark:hover:shadow-black/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Total de Peças Cortadas</CardTitle>
            <Scissors className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{totalPecasCortadas}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Unidades cortadas para produção
            </p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-purple-800 dark:bg-purple-950 dark:hover:shadow-lg dark:hover:shadow-black/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Total de Fichas Criadas</CardTitle>
            <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{totalFichasCriadas}</div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Fichas registradas no sistema
            </p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-green-800 dark:bg-green-950 dark:hover:shadow-lg dark:hover:shadow-black/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Total de Fichas Concluídas</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{totalFichasConcluidas}</div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Fichas já finalizadas
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Card de Rastreamento */}
      <Card className="border border-border hover:shadow-md transition-all animate-in fade-in duration-1000 dark:shadow-lg dark:shadow-black/20 dark:hover:shadow-xl dark:hover:shadow-black/30">
        <CardHeader className="bg-muted/30 border-b border-border dark:bg-muted/20">
          <CardTitle className="text-foreground">Rastreamento Geral</CardTitle>
          <p className="text-sm text-muted-foreground">
            Fluxo de trabalho e situação atual das fichas. Clique em um status para filtrar.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between py-4">
            <StatusTrackingCard 
              icon={<FileText className="h-10 w-10 text-foreground" />}
              count={String(todasFichas.length)}
              label="Todas"
              sublabel="Exibir todas as fichas"
              className="bg-muted border border-border mb-4 md:mb-0 w-full md:w-1/4 cursor-pointer hover:bg-accent transition-colors dark:bg-muted/30 dark:border-border dark:hover:bg-accent/20"
              onClick={carregarFichas}
            />

            <div className="hidden md:flex items-center justify-center w-1/6">
              <MoveRight className="h-10 w-10 text-foreground font-bold stroke-2" />
            </div>
            
            <StatusTrackingCard 
              icon={<Clock className="h-10 w-10 text-amber-500 dark:text-amber-400" />}
              count={String(statusSummary.aguardando_retirada)}
              label="Aguardando Retirada"
              sublabel={`${calcularQuantidadeAguardandoRetirada(filteredData)} itens`}
              className="bg-amber-50 border-amber-200 mb-4 md:mb-0 w-full md:w-1/4 cursor-pointer hover:bg-amber-100 transition-colors dark:bg-amber-950 dark:border-amber-800 dark:hover:bg-amber-900"
              onClick={() => handleAbrirPorStatus("aguardando_retirada")}
            />
            
            <div className="hidden md:flex items-center justify-center w-1/6">
              <MoveRight className="h-10 w-10 text-foreground font-bold stroke-2" />
            </div>
            
            <StatusTrackingCard 
              icon={<CircleDot className="h-10 w-10 text-blue-500 dark:text-blue-400" />}
              count={String(statusSummary.em_producao)}
              label="Em Produção"
              sublabel={`${calcularQuantidadeEmProducao(filteredData)} itens com bancas`}
              className="bg-blue-50 border-blue-200 mb-4 md:mb-0 w-full md:w-1/4 cursor-pointer hover:bg-blue-100 transition-colors dark:bg-blue-950 dark:border-blue-800 dark:hover:bg-blue-900"
              onClick={() => handleAbrirPorStatus("em_producao")}
            />
            
            <div className="hidden md:flex items-center justify-center w-1/6">
              <MoveRight className="h-10 w-10 text-foreground font-bold stroke-2" />
            </div>
            
            <StatusTrackingCard 
              icon={<Package className="h-10 w-10 text-yellow-500 dark:text-yellow-400" />}
              count={String(todasFichas.filter(f => f.status === "em_producao" && f.quantidade_recebida > 0).length)}
              label="Recebido Parcialmente"
              sublabel={`${calcularQuantidadeRecebidaParcialmente(todasFichas)} itens recebidos`}
              className="bg-yellow-50 border-yellow-200 mb-4 md:mb-0 w-full md:w-1/4 cursor-pointer hover:bg-yellow-100 transition-colors dark:bg-yellow-950 dark:border-yellow-800 dark:hover:bg-yellow-900"
              onClick={() => handleAbrirPorStatus("recebido_parcialmente")}
            />
            
            <div className="hidden md:flex items-center justify-center w-1/6">
              <MoveRight className="h-10 w-10 text-foreground font-bold stroke-2" />
            </div>
            
            <StatusTrackingCard 
              icon={<CheckCircle className="h-10 w-10 text-green-500 dark:text-green-400" />}
              count={String(statusSummary.concluido)}
              label="Concluídas"
              sublabel={`${calcularQuantidadeConcluida(filteredData)} itens concluídos`}
              className="bg-green-50 border-green-200 w-full md:w-1/4 cursor-pointer hover:bg-green-100 transition-colors dark:bg-green-950 dark:border-green-800 dark:hover:bg-green-900"
              onClick={() => handleAbrirPorStatus("concluido")}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Tabela de Fichas */}
      <div className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all animate-in fade-in duration-1000 dark:shadow-lg dark:shadow-black/20 dark:hover:shadow-xl dark:hover:shadow-black/30">
        <DataTable 
          data={filteredData}
          columns={columns}
          isLoading={isLoading}
        />
      </div>
      
      {/* Diálogo para confirmar exclusão */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Ficha"
        description={selectedFicha ? `Tem certeza que deseja excluir a ficha ${selectedFicha.codigo}?` : "Tem certeza que deseja excluir esta ficha?"}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
      
      {/* Diálogo para confirmar conclusão */}
      <ConfirmDialog
        isOpen={isConcluirFichaDialogOpen}
        onClose={() => setIsConcluirFichaDialogOpen(false)}
        onConfirm={handleConcluirFicha}
        title="Concluir Ficha"
        description={selectedFicha ? `Tem certeza que deseja marcar a ficha ${selectedFicha.codigo} como concluída?` : "Tem certeza que deseja marcar esta ficha como concluída?"}
        confirmText="Concluir"
        cancelText="Cancelar"
        variant="default"
      />
      
      {/* Modal de Movimentações */}
      {selectedFicha && (
        <MovimentacaoModal
          isOpen={isMovimentacaoDialogOpen}
          onClose={() => setIsMovimentacaoDialogOpen(false)}
          ficha={selectedFicha}
          onMovimentacaoRegistrada={handleMovimentacaoRegistrada}
        />
      )}
      
      {/* Modal de Recebimento Parcial */}
      <RecebimentoParcialModal
        isOpen={isRecebimentoParcialDialogOpen}
        onClose={() => setIsRecebimentoParcialDialogOpen(false)}
        ficha={selectedFicha}
        onRecebimentoRegistrado={handleRecebimentoParcialRegistrado}
      />
      
      {/* Modal de Registro de Perda */}
      <RegistroPerdaModal
        isOpen={isRegistroPerdaDialogOpen}
        onClose={() => setIsRegistroPerdaDialogOpen(false)}
        ficha={selectedFicha}
        onPerdaRegistrada={handlePerdaRegistrada}
      />
      
      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleCloseEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5 text-indigo-600" />
              Editar Ficha
            </DialogTitle>
            <DialogDescription>
              Edite os dados da ficha de produção. Todos os campos marcados com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>

          {fichaEditando ? (
            <form onSubmit={(e) => { e.preventDefault(); handleEdit(); }} className="space-y-4">
              {/* Informações da Ficha */}
              <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                <h4 className="font-medium text-sm">Informações da Ficha</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Código:</span>
                    <span className="ml-2 font-medium">{fichaEditando.codigo}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <span className="ml-2 font-medium">{fichaEditando.status}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Quantidade:</span>
                    <span className="ml-2 font-medium">{fichaEditando.quantidade} unid.</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Recebido:</span>
                    <span className="ml-2 font-medium">{fichaEditando.quantidade_recebida || 0} unid.</span>
                  </div>
                </div>
              </div>

              {/* Informações Principais */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Informações Principais</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Banca <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={fichaEditando.banca}
                      onValueChange={(value) => setFichaEditando({ ...fichaEditando, banca: value })}
                    >
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Selecione uma banca" />
                      </SelectTrigger>
                      <SelectContent>
                        <div className="px-2 pb-2">
                          <Input
                            placeholder="Buscar banca..."
                            value={bancaSearchQuery}
                            onChange={(e) => setBancaSearchQuery(e.target.value)}
                            className="h-8 bg-background border-border text-foreground"
                          />
                        </div>
                        {filteredBancas.map((banca) => (
                          <SelectItem key={banca.id} value={banca.nome}>
                            {banca.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Produto (ID) <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={fichaEditando?.produto_id || ''}
                      onValueChange={(value) => {
                        const produtoSelecionado = produtos.find(p => p.id === value);
                        if (produtoSelecionado && fichaEditando) {
                          setFichaEditando({
                            ...fichaEditando,
                            produto_id: value,
                            produto: produtoSelecionado.nome_produto
                          });
                        }
                      }}
                    >
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Selecione o produto pelo ID">
                          {fichaEditando?.produto || "Selecione o produto"}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {produtos.map((produto) => (
                          <SelectItem key={produto.id} value={produto.id}>
                            {produto.nome_produto} (ID: {produto.id})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Cor <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={fichaEditando.cor}
                      onChange={(e) => setFichaEditando({ ...fichaEditando, cor: e.target.value })}
                      placeholder="Informe a cor"
                      className="bg-background border-border text-foreground"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Tamanho <span className="text-red-500">*</span>
                    </Label>
                    <Select
                      value={fichaEditando.tamanho}
                      onValueChange={(value) => setFichaEditando({ ...fichaEditando, tamanho: value as "P" | "M" | "G" | "GG" })}
                    >
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue placeholder="Selecione um tamanho" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="P">P</SelectItem>
                        <SelectItem value="M">M</SelectItem>
                        <SelectItem value="G">G</SelectItem>
                        <SelectItem value="GG">GG</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Quantidade <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="number"
                      value={fichaEditando.quantidade}
                      onChange={(e) => setFichaEditando({ ...fichaEditando, quantidade: parseInt(e.target.value) })}
                      placeholder="0"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>
              </div>

              {/* Datas */}
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Datas</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Data de Entrada <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={typeof fichaEditando?.data_entrada === 'string' ? fichaEditando.data_entrada : ''}
                        onChange={(e) => setFichaEditando(prev => prev ? { 
                          ...prev, 
                          data_entrada: e.target.value 
                        } : null)}
                        className="bg-background border-border text-foreground pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-moz-calendar-picker-indicator]:hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('dataEntrada') as HTMLInputElement;
                          if (input && 'showPicker' in input) {
                            input.showPicker();
                          }
                        }}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-muted/50 rounded-r-md transition-colors"
                      >
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Data de Previsão <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="date"
                        value={typeof fichaEditando?.data_previsao === 'string' ? fichaEditando.data_previsao : ''}
                        onChange={(e) => setFichaEditando(prev => prev ? { 
                          ...prev, 
                          data_previsao: e.target.value 
                        } : null)}
                        className="bg-background border-border text-foreground pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-moz-calendar-picker-indicator]:hidden"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const input = document.getElementById('dataPrevisao') as HTMLInputElement;
                          if (input && 'showPicker' in input) {
                            input.showPicker();
                          }
                        }}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-muted/50 rounded-r-md transition-colors"
                      >
                        <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Observações</Label>
                <Textarea
                  value={fichaEditando.observacoes}
                  onChange={(e) => setFichaEditando({ ...fichaEditando, observacoes: e.target.value })}
                  placeholder="Informe observações adicionais (opcional)"
                  rows={3}
                  className="bg-background border-border text-foreground"
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCloseEditDialog}
                  disabled={isLoading}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Edit className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          ) : (
            <div className="p-4 text-center">
              <Alert variant="destructive">
                <AlertDescription>
                  Nenhuma ficha selecionada para edição.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      {/* Modal de Nova Ficha */}
      <Dialog open={isNovaFichaDialogOpen} onOpenChange={handleCloseNovaFichaDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-green-600" />
              Nova Ficha
            </DialogTitle>
            <DialogDescription>
              Preencha os dados da nova ficha de produção. Todos os campos marcados com * são obrigatórios.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={(e) => { e.preventDefault(); handleCreateFicha(); }} className="space-y-4">
            {/* Informações Principais */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Informações Principais</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Banca <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={novaFicha.banca}
                    onValueChange={(value) => setNovaFicha({ ...novaFicha, banca: value })}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Selecione uma banca" />
                    </SelectTrigger>
                    <SelectContent>
                      <div className="px-2 pb-2">
                        <Input
                          placeholder="Buscar banca..."
                          value={bancaSearchQuery}
                          onChange={(e) => setBancaSearchQuery(e.target.value)}
                          className="h-8 bg-background border-border text-foreground"
                        />
                      </div>
                      {filteredBancas.map((banca) => (
                        <SelectItem key={banca.id} value={banca.nome}>
                          {banca.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Produto (ID) <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={novaFicha.produto_id || ''}
                    onValueChange={(value) => {
                      const produtoSelecionado = produtos.find(p => p.id === value);
                      if (produtoSelecionado) {
                        setNovaFicha({
                          ...novaFicha,
                          produto_id: value,
                          produto: produtoSelecionado.nome_produto
                        });
                      }
                    }}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Selecione o produto pelo ID">
                        {novaFicha.produto || "Selecione o produto"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {produtos.map((produto) => (
                        <SelectItem key={produto.id} value={produto.id}>
                          {produto.nome_produto} (ID: {produto.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Cor <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    value={novaFicha.cor}
                    onChange={(e) => setNovaFicha({ ...novaFicha, cor: e.target.value })}
                    placeholder="Informe a cor"
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Tamanho <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={novaFicha.tamanho}
                    onValueChange={(value) => setNovaFicha({ ...novaFicha, tamanho: value as "P" | "M" | "G" | "GG" })}
                  >
                    <SelectTrigger className="bg-background border-border text-foreground">
                      <SelectValue placeholder="Selecione um tamanho" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="P">P</SelectItem>
                      <SelectItem value="M">M</SelectItem>
                      <SelectItem value="G">G</SelectItem>
                      <SelectItem value="GG">GG</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Quantidade <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    value={novaFicha.quantidade}
                    onChange={(e) => setNovaFicha({ ...novaFicha, quantidade: parseInt(e.target.value) })}
                    placeholder="0"
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </div>
            </div>

            {/* Datas */}
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Datas</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Data de Entrada <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={novaFicha.data_entrada instanceof Date ? novaFicha.data_entrada.toISOString().split('T')[0] : novaFicha.data_entrada}
                      onChange={(e) => setNovaFicha({ ...novaFicha, data_entrada: new Date(e.target.value) })}
                      className="bg-background border-border text-foreground pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-moz-calendar-picker-indicator]:hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('dataEntrada') as HTMLInputElement;
                        if (input && 'showPicker' in input) {
                          input.showPicker();
                        }
                      }}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-muted/50 rounded-r-md transition-colors"
                    >
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Data de Previsão <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      type="date"
                      value={novaFicha.data_previsao instanceof Date ? novaFicha.data_previsao.toISOString().split('T')[0] : novaFicha.data_previsao}
                      onChange={(e) => setNovaFicha({ ...novaFicha, data_previsao: new Date(e.target.value) })}
                      className="bg-background border-border text-foreground pr-10 [&::-webkit-calendar-picker-indicator]:hidden [&::-moz-calendar-picker-indicator]:hidden"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('dataPrevisao') as HTMLInputElement;
                        if (input && 'showPicker' in input) {
                          input.showPicker();
                        }
                      }}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 hover:bg-muted/50 rounded-r-md transition-colors"
                    >
                      <svg className="h-4 w-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Observações */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Observações</Label>
              <Textarea
                value={novaFicha.observacoes}
                onChange={(e) => setNovaFicha({ ...novaFicha, observacoes: e.target.value })}
                placeholder="Informe observações adicionais (opcional)"
                rows={3}
                className="bg-background border-border text-foreground"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseNovaFichaDialog}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Ficha
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 