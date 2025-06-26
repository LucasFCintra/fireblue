import { useState, useEffect } from "react";
import { Package, FileText, Download, Filter, Edit, Trash2, Plus, Search, Loader2, Scissors, History, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import DataTable from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ActionButton } from "@/components/ActionButton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { materiaPrimaService, Bobina, Movimentacao, Estoque } from "@/services/materiaPrimaService";
import { ReactNode } from "react";
import { io } from 'socket.io-client';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

const API_URL = 'http://localhost:8687/api';

export default function MateriaPrima() {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Bobina | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCorteDialogOpen, setIsCorteDialogOpen] = useState(false);
  const [isHistoricoDialogOpen, setIsHistoricoDialogOpen] = useState(false);
  const [isNovaBobinaDialogOpen, setIsNovaBobinaDialogOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [quantidade_totalCorte, setquantidade_totalCorte] = useState("");
  const [ordemProducao, setOrdemProducao] = useState("");
  const [bobinasOriginais, setBobinasOriginais] = useState<Bobina[]>([]);
  const [filteredData, setFilteredData] = useState<Bobina[]>([]);
  const [historico, setHistorico] = useState<Movimentacao[]>([]);
  const [socket, setSocket] = useState<any>(null);
  const [estoque, setEstoque] = useState<Estoque>({
    semEstoque: [],
    baixoEstoque: [],
    emEstoque: []
  });
  
  // Estados para tipos de tecido e cores
  const [tiposTecido, setTiposTecido] = useState<string[]>([]);
  const [cores, setCores] = useState<string[]>([]);
  const [coresPorTipoTecido, setCoresPorTipoTecido] = useState<string[]>([]);
  
  // Estado para o formulário de nova bobina
  const [novaBobina, setNovaBobina] = useState<Omit<Bobina, 'id'>>({
    tipo_tecido: "",
    cor: "",
    lote: "",
    fornecedor: "",
    quantidade_total: 0,
    quantidade_disponivel: 0,
    unidade: "Bobina",
    localizacao: "",
    data_entrada: new Date(),
    status: "em_estoque",
    codigo_barras: "",
    observacoes: ""
  });
  
  // Estado para o formulário de edição
  const [bobinaEditando, setBobinaEditando] = useState<Bobina | null>(null);
  
  // Estado para os filtros
  const [filtros, setFiltros] = useState({
    status: "",
    fornecedor: "",
    dataInicio: "",
    dataFim: ""
  });
  
  // Função para limpar o formulário de nova bobina
  const limparFormulario = () => {
    setNovaBobina({
      tipo_tecido: "",
      cor: "",
      lote: "",
      fornecedor: "",
      quantidade_total: 0,
      quantidade_disponivel: 0,
      unidade: "Bobina",
      localizacao: "",
      data_entrada: new Date(),
      status: "em_estoque",
      codigo_barras: "",
      observacoes: ""
    });
  };
  
  // Função para carregar as bobinas
  const carregarBobinas = async () => {
    try {
      setIsLoading(true);
      const bobinas = await materiaPrimaService.listarBobinas();
      setBobinasOriginais(bobinas);
      setFilteredData(bobinas);
    } catch (error) {
      toast.error("Erro ao carregar bobinas");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para carregar o estoque
  const carregarEstoque = async () => {
    try {
      const estoqueData = await materiaPrimaService.retornaEstoque();
      setEstoque(estoqueData);
    } catch (error) {
      toast.error("Erro ao carregar dados do estoque");
      console.error(error);
    }
  };
  
  // Função para carregar tipos de tecido
  const carregarTiposTecido = async () => {
    try {
      const tipos = await materiaPrimaService.buscarTiposTecido();
      setTiposTecido(tipos);
      console.log('Tipos de tecido carregados:', tipos); // DEBUG
    } catch (error) {
      toast.error("Erro ao carregar tipos de tecido");
      console.error(error);
    }
  };
  
  // Função para carregar cores
  const carregarCores = async () => {
    try {
      const coresData = await materiaPrimaService.buscarCores();
      setCores(coresData);
    } catch (error) {
      toast.error("Erro ao carregar cores");
      console.error(error);
    }
  };
  
  // Função para carregar cores por tipo de tecido
  const carregarCoresPorTipoTecido = async (tipoTecido: string) => {
    try {
      const coresData = await materiaPrimaService.buscarCoresPorTipoTecido(tipoTecido);
      setCoresPorTipoTecido(coresData);
      console.log('Cores carregadas para', tipoTecido, ':', coresData); // DEBUG
    } catch (error) {
      toast.error("Erro ao carregar cores para o tipo de tecido selecionado");
      console.error(error);
    }
  };
  
  // Carregar dados iniciais
  useEffect(() => {
    void carregarBobinas();
    void carregarEstoque();
    void carregarTiposTecido();
    void carregarCores();
  }, []);
  
  // Atualizar o estoque quando houver mudanças nas bobinas
  useEffect(() => {
    void carregarEstoque();
  }, [filteredData]);
  
  // Função para lidar com a adição de uma nova bobina
  const handleAddBobina = () => {
    setIsNovaBobinaDialogOpen(true);
  };
  
  // Função para gerar relatório em Excel
  const gerarRelatorioExcel = () => {
    try {
      // Criar um novo workbook
      const workbook = XLSX.utils.book_new();
      
      // Preparar dados para a planilha principal
      const dadosPlanilha = filteredData.map(bobina => ({
        'Tipo de Tecido': bobina.tipo_tecido,
        'Cor': bobina.cor,
        'Lote': bobina.lote,
        'Fornecedor': bobina.fornecedor,
        'Quantidade Total': bobina.quantidade_total,
        'Quantidade Disponível': bobina.quantidade_disponivel,
        'Unidade': bobina.unidade,
        'Localização': bobina.localizacao,
        'Data de Entrada': format(new Date(bobina.data_entrada), 'dd/MM/yyyy'),
        'Status': bobina.status,
        'Código de Barras': bobina.codigo_barras,
        'Observações': bobina.observacoes
      }));
      
      // Criar planilha principal
      const worksheet = XLSX.utils.json_to_sheet(dadosPlanilha);
      
      // Configurar larguras das colunas
      const colWidths = [
        { wch: 20 }, // Tipo de Tecido
        { wch: 15 }, // Cor
        { wch: 15 }, // Lote
        { wch: 20 }, // Fornecedor
        { wch: 15 }, // Quantidade Total
        { wch: 15 }, // Quantidade Disponível
        { wch: 10 }, // Unidade
        { wch: 15 }, // Localização
        { wch: 15 }, // Data de Entrada
        { wch: 15 }, // Status
        { wch: 20 }, // Código de Barras
        { wch: 30 }  // Observações
      ];
      worksheet['!cols'] = colWidths;
      
      // Adicionar planilha ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Bobinas');
      
      // Criar planilha de resumo
      const dadosResumo = [
        { 'Métrica': 'Total de Bobinas', 'Valor': filteredData.length },
        { 'Métrica': 'Em Estoque', 'Valor': estoque.emEstoque.length },
        { 'Métrica': 'Baixo Estoque', 'Valor': estoque.baixoEstoque.length },
        { 'Métrica': 'Sem Estoque', 'Valor': estoque.semEstoque.length },
        { 'Métrica': '', 'Valor': '' }, // Linha em branco
        { 'Métrica': 'Data do Relatório', 'Valor': format(new Date(), 'dd/MM/yyyy às HH:mm', { locale: ptBR }) },
        { 'Métrica': 'Gerado por', 'Valor': 'Sistema SGE FireBlue' }
      ];
      
      const worksheetResumo = XLSX.utils.json_to_sheet(dadosResumo);
      worksheetResumo['!cols'] = [{ wch: 25 }, { wch: 20 }];
      
      // Adicionar planilha de resumo ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheetResumo, 'Resumo');
      
      // Criar planilha de estoque por status
      const dadosEstoque = [
        { 'Status': 'Em Estoque', 'Quantidade': estoque.emEstoque.length, 'Percentual': `${((estoque.emEstoque.length / filteredData.length) * 100).toFixed(1)}%` },
        { 'Status': 'Baixo Estoque', 'Quantidade': estoque.baixoEstoque.length, 'Percentual': `${((estoque.baixoEstoque.length / filteredData.length) * 100).toFixed(1)}%` },
        { 'Status': 'Sem Estoque', 'Quantidade': estoque.semEstoque.length, 'Percentual': `${((estoque.semEstoque.length / filteredData.length) * 100).toFixed(1)}%` }
      ];
      
      const worksheetEstoque = XLSX.utils.json_to_sheet(dadosEstoque);
      worksheetEstoque['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];
      
      // Adicionar planilha de estoque ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheetEstoque, 'Análise de Estoque');
      
      // Configurar propriedades do workbook
      workbook.Props = {
        Title: 'Relatório de Bobinas - Controle de Matéria Prima',
        Subject: 'Relatório de Estoque de Bobinas',
        Author: 'SGE FireBlue',
        CreatedDate: new Date(),
        Keywords: 'bobinas, estoque, matéria prima, relatório',
        Category: 'Relatório de Estoque'
      };
      
      // Gerar o arquivo Excel
      const nomeArquivo = `relatorio_bobinas_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xlsx`;
      XLSX.writeFile(workbook, nomeArquivo);
      
      toast.success('Relatório Excel exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relatório Excel');
      console.error(error);
    }
  };

  // Função para gerar relatório em PDF
  const gerarRelatorioPDF = async () => {
    try {
      // Importar jspdf-autotable dinamicamente
      const autoTable = await import('jspdf-autotable');
      
      // Criar nova instância do jsPDF
      const doc = new jsPDF();
      
      // Configurar fonte para suportar caracteres especiais
      doc.setFont('helvetica');
      
      // Título do relatório
      doc.setFontSize(20);
      doc.setTextColor(51, 51, 51);
      doc.text('Relatório de Bobinas - Controle de Matéria Prima', 105, 20, { align: 'center' });
      
      // Data de geração
      doc.setFontSize(12);
      doc.setTextColor(102, 102, 102);
      doc.text(`Gerado em: ${format(new Date(), 'dd/MM/yyyy às HH:mm', { locale: ptBR })}`, 105, 30, { align: 'center' });
      
      // Resumo do estoque
      doc.setFontSize(14);
      doc.setTextColor(51, 51, 51);
      doc.text('Resumo do Estoque', 20, 50);
      
      doc.setFontSize(10);
      doc.setTextColor(0, 0, 0);
      doc.text(`Total de Bobinas: ${filteredData.length}`, 20, 60);
      doc.text(`Em Estoque: ${estoque.emEstoque.length}`, 20, 67);
      doc.text(`Baixo Estoque: ${estoque.baixoEstoque.length}`, 20, 74);
      doc.text(`Sem Estoque: ${estoque.semEstoque.length}`, 20, 81);
      
      // Preparar dados para a tabela
      const dadosTabela = filteredData.map(bobina => [
        bobina.tipo_tecido,
        bobina.cor,
        bobina.lote,
        bobina.fornecedor,
        `${bobina.quantidade_total} ${bobina.unidade}`,
        `${bobina.quantidade_disponivel} ${bobina.unidade}`,
        bobina.localizacao,
        format(new Date(bobina.data_entrada), 'dd/MM/yyyy'),
        bobina.status
      ]);
      
      // Cabeçalhos da tabela
      const headers = [
        'Tipo de Tecido',
        'Cor',
        'Lote',
        'Fornecedor',
        'Qtd. Total',
        'Qtd. Disponível',
        'Localização',
        'Data Entrada',
        'Status'
      ];
      
      // Configurações da tabela
      const tableConfig = {
        head: [headers],
        body: dadosTabela,
        startY: 95,
        styles: {
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak' as const,
          halign: 'left' as const
        },
        headStyles: {
          fillColor: [51, 122, 183] as [number, number, number],
          textColor: 255,
          fontStyle: 'bold' as const,
          fontSize: 9
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245] as [number, number, number]
        },
        columnStyles: {
          0: { cellWidth: 25 }, // Tipo de Tecido
          1: { cellWidth: 20 }, // Cor
          2: { cellWidth: 20 }, // Lote
          3: { cellWidth: 25 }, // Fornecedor
          4: { cellWidth: 20 }, // Qtd. Total
          5: { cellWidth: 20 }, // Qtd. Disponível
          6: { cellWidth: 20 }, // Localização
          7: { cellWidth: 20 }, // Data Entrada
          8: { cellWidth: 20 }  // Status
        },
        didParseCell: function(data: any) {
          // Colorir células de status
          if (data.column.index === 8) { // Coluna Status
            const status = data.cell.text[0];
            if (status === 'em_estoque') {
              data.cell.styles.textColor = [0, 128, 0]; // Verde
            } else if (status === 'baixo_estoque') {
              data.cell.styles.textColor = [255, 140, 0]; // Laranja
            } else if (status === 'sem_estoque') {
              data.cell.styles.textColor = [220, 53, 69]; // Vermelho
            }
          }
        }
      };
      
      // Adicionar tabela ao PDF usando a função importada
      autoTable.default(doc, tableConfig);
      
      // Adicionar rodapé com informações
      const pageCount = (doc as any).internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(`Página ${i} de ${pageCount}`, 105, doc.internal.pageSize.height - 10, { align: 'center' });
      }
      
      // Salvar o PDF
      const nomeArquivo = `relatorio_bobinas_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`;
      doc.save(nomeArquivo);
      
      toast.success('Relatório PDF exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao gerar relatório PDF');
      console.error(error);
    }
  };

  // Função para lidar com a exportação
  const handleExport = async (format: string) => {
    if (format === 'excel') {
      gerarRelatorioExcel();
    } else if (format === 'pdf') {
      await gerarRelatorioPDF();
    } else {
      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/materia-prima/exportar/${format}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao exportar dados');
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `materia-prima.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        toast.success(`Dados exportados com sucesso em formato ${format}`);
      } catch (error) {
        toast.error("Erro ao exportar dados");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
  };
  
  // Função para abrir o diálogo de exclusão
  const handleOpenDeleteDialog = (bobina: Bobina) => {
    setSelectedRow(bobina);
    setIsDeleteDialogOpen(true);
  };
  
  // Função para lidar com a exclusão de uma bobina
  const handleDelete = async () => {
    if (!selectedRow) return;
    
    try {
      setIsLoading(true);
      await materiaPrimaService.excluirBobina(selectedRow.id);
      await carregarBobinas();
      setIsDeleteDialogOpen(false);
      setSelectedRow(null);
      toast.success(`Bobina ${selectedRow.tipo_tecido} removida com sucesso`);
    } catch (error) {
      toast.error("Erro ao excluir bobina");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para abrir o diálogo de edição
  const handleOpenEditDialog = async (bobina: Bobina) => {
    setBobinaEditando(bobina);
    setIsEditDialogOpen(true);
    // Carregar cores para o tipo de tecido da bobina sendo editada
    if (bobina.tipo_tecido) {
      await carregarCoresPorTipoTecido(bobina.tipo_tecido);
    }
  };
  
  // Função para lidar com a edição de uma bobina
  const handleEdit = async () => {
    if (!bobinaEditando) return;
    
    try {
      setIsLoading(true);
      await materiaPrimaService.atualizarBobina(bobinaEditando);
      await carregarBobinas();
      setIsEditDialogOpen(false);
      setBobinaEditando(null);
      toast.success(`Bobina ${bobinaEditando.tipo_tecido} atualizada com sucesso`);
    } catch (error) {
      toast.error("Erro ao atualizar bobina");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para abrir o diálogo de corte
  const handleOpenCorteDialog = (bobina: Bobina) => {
    setSelectedRow(bobina);
    setIsCorteDialogOpen(true);
  };
  
  // Função para lidar com o corte de uma bobina
  const handleCorte = async () => {
    if (!selectedRow || !quantidade_totalCorte) return;
    
    const quantidade = parseFloat(quantidade_totalCorte);
    if (quantidade > selectedRow.quantidade_total) {
      toast.error("Quantidade de corte não pode ser maior que a quantidade disponível");
      return;
    }
    
    try {
      setIsLoading(true);
      await materiaPrimaService.registrarCorte(selectedRow.id, quantidade, ordemProducao);
      await carregarBobinas();
      setIsCorteDialogOpen(false);
      setquantidade_totalCorte("");
      setOrdemProducao("");
      setSelectedRow(null);
      toast.success(`Corte de ${quantidade}m realizado com sucesso`);
    } catch (error) {
      toast.error("Erro ao registrar corte");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para carregar histórico 
  const carregarHistorico = async (id: string) => {
    try {
      setIsLoading(true);
      const historicoData = await materiaPrimaService.buscarHistorico(id);
      setHistorico(historicoData);
    } catch (error) {
      toast.error("Erro ao carregar histórico");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para lidar com a criação de uma nova bobina
  const handleCreateBobina = async () => {
    try {
      setIsLoading(true);
      await materiaPrimaService.criarBobina(novaBobina);
      await carregarBobinas();
      setIsNovaBobinaDialogOpen(false);
      limparFormulario();
      toast.success("Bobina criada com sucesso");
    } catch (error) {
      toast.error("Erro ao criar bobina");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para abrir o diálogo de histórico
  const handleOpenHistoricoDialog = async (bobina: Bobina) => {
    setSelectedRow(bobina);
    setIsHistoricoDialogOpen(true);
    await carregarHistorico(bobina.id);
  };
  
  // Função para lidar com a aplicação dos filtros
  const handleAplicarFiltros = async () => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filtros.status) queryParams.append('status', filtros.status);
      if (filtros.fornecedor) queryParams.append('fornecedor', filtros.fornecedor);
      if (filtros.dataInicio) queryParams.append('dataInicio', filtros.dataInicio);
      if (filtros.dataFim) queryParams.append('dataFim', filtros.dataFim);

      const response = await fetch(`${API_URL}/materia-prima/filtrar?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error('Erro ao aplicar filtros');
      }

      const bobinas = await response.json();
      setFilteredData(bobinas);
      toast.success(`${bobinas.length} bobina(s) encontrada(s)`);
    } catch (error) {
      toast.error("Erro ao aplicar filtros");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para limpar os filtros
  const handleLimparFiltros = () => {
    setFiltros({
      status: "",
      fornecedor: "",
      dataInicio: "",
      dataFim: ""
    });
    carregarBobinas();
  };
  
  // Função para abrir o diálogo de filtros
  const handleOpenFilterDialog = () => {
    setIsFilterDialogOpen(true);
  };
  
  // Colunas para a tabela de bobinas
  const columns: {
    accessor: keyof Bobina | ((row: Bobina) => ReactNode);
    header: string;
    cell?: (row: Bobina) => ReactNode;
  }[] = [
    {
      accessor: "tipo_tecido" as keyof Bobina,
      header: "Tipo de Tecido",
    },
    {
      accessor: "cor" as keyof Bobina,
      header: "Cor",
    },
    {
      accessor: "lote" as keyof Bobina,
      header: "Lote",
    },
    {
      accessor: "fornecedor" as keyof Bobina,
      header: "Fornecedor",
    },
    {
      accessor: "quantidade_total" as keyof Bobina,
      header: "quantidade_total",
      cell: (row: Bobina) => {
        let textColor = "";
        let bgColor = "";
        let borderColor = "";
        
        if (row.status === "em_estoque") {
          textColor = "text-green-700";
          bgColor = "bg-green-50";
          borderColor = "border-green-200";
        } else if (row.status === "baixo_estoque") {
          textColor = "text-yellow-700";
          bgColor = "bg-yellow-50";
          borderColor = "border-yellow-200";
        } else if (row.status === "sem_estoque") {
          textColor = "text-red-700";
          bgColor = "bg-red-50";
          borderColor = "border-red-200";
        }
        
        return (
          <span className={`font-medium px-2 py-1 rounded-md ${textColor} ${bgColor} ${borderColor} border`}>
            {row.quantidade_total} {row.unidade}
          </span>
        );
      },
    },
    {
      accessor: "quantidade_disponivel" as keyof Bobina,
      header: "Quantidade Disponível",
      cell: (row: Bobina) => (
        <span className={row.quantidade_disponivel === 0 ? "text-red-500 font-medium" : ""}>
          {row.quantidade_disponivel} {row.unidade}
        </span>
      ),
    },
    {
      accessor: "localizacao" as keyof Bobina,
      header: "Localização",
    },
    {
      accessor: "data_entrada" as keyof Bobina,
      header: "Data de Entrada",
      cell: (row: Bobina) => {
        let textColor = "";
        let bgColor = "";
        
        if (row.status === "em_estoque") {
          textColor = "text-green-700";
          bgColor = "bg-green-50";
        } else if (row.status === "baixo_estoque") {
          textColor = "text-yellow-700";
          bgColor = "bg-yellow-50";
        } else if (row.status === "sem_estoque") {
          textColor = "text-red-700";
          bgColor = "bg-red-50";
        }
        
        return (
          <span className={`${textColor} ${bgColor} px-2 py-1 rounded-md font-medium`}>
            {new Date(row.data_entrada).toLocaleDateString("pt-BR")}
          </span>
        );
      },
    },
    {
      accessor: "status" as keyof Bobina,
      header: "Status",
      cell: (row: Bobina) => {
        let color = "bg-green-100 text-green-800";
        if (row.status === "baixo_estoque") color = "bg-yellow-100 text-yellow-800";
        if (row.status === "sem_estoque") color = "bg-red-100 text-red-800";
        
        return (
          <Badge variant="outline" className={`${color}`}>
            {row.status}
          </Badge>
        );
      },
    },
    {
      accessor: "id" as keyof Bobina,
      header: "Ações",
      cell: (row: Bobina) => {
        let iconColor = "";
        let borderColor = "";
        let bgHoverColor = "";
        
        if (row.status === "em_estoque") {
          iconColor = "text-green-600";
          borderColor = "border-green-200";
          bgHoverColor = "hover:bg-green-50";
        } else if (row.status === "baixo_estoque") {
          iconColor = "text-yellow-600";
          borderColor = "border-yellow-200";
          bgHoverColor = "hover:bg-yellow-50";
        } else if (row.status === "sem_estoque") {
          iconColor = "text-red-600";
          borderColor = "border-red-200";
          bgHoverColor = "hover:bg-red-50";
        }
        
        return (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className={`${bgHoverColor}`}
              onClick={() => handleOpenHistoricoDialog(row)}
              title="Histórico de Movimentações"
            >
              <History className={`h-4 w-4 ${iconColor}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`${bgHoverColor}`}
              onClick={() => handleOpenCorteDialog(row)}
              title="Registrar Corte"
            >
              <Scissors className={`h-4 w-4 ${iconColor}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`${bgHoverColor}`}
              onClick={() => handleOpenEditDialog(row)}
              title="Editar Bobina"
            >
              <Pencil className={`h-4 w-4 ${iconColor}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`${bgHoverColor}`}
              onClick={() => handleOpenDeleteDialog(row)}
              title="Excluir Bobina"
            >
              <Trash2 className={`h-4 w-4 ${iconColor}`} />
            </Button>
          </div>
        );
      },
    },
  ];
  
  // Configurar Socket.IO
  useEffect(() => {
    const newSocket = io('http://26.203.75.236:8687');
    setSocket(newSocket);

    // Escutar eventos de atualização
    newSocket.on('bobina_status_atualizado', (data) => {
      setBobinasOriginais(prevData => 
        prevData.map(bobina => 
          bobina.id === data.id 
            ? { ...bobina, status: data.status, quantidade_disponivel: data.quantidade_disponivel }
            : bobina
        )
      );
      setFilteredData(prevData => 
        prevData.map(bobina => 
          bobina.id === data.id 
            ? { ...bobina, status: data.status, quantidade_disponivel: data.quantidade_disponivel }
            : bobina
        )
      );
    });

    newSocket.on('nova_bobina', (bobina) => {
      setBobinasOriginais(prevData => [...prevData, bobina]);
      setFilteredData(prevData => [...prevData, bobina]);
    });

    newSocket.on('bobina_atualizada', (bobina) => {
      setBobinasOriginais(prevData => 
        prevData.map(b => b.id === bobina.id ? bobina : b)
      );
      setFilteredData(prevData => 
        prevData.map(b => b.id === bobina.id ? bobina : b)
      );
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);
  
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Controle de Bobinas</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie bobinas de matéria-prima e controle o estoque
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
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
            onClick={handleAddBobina}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Nova Bobina
          </ActionButton>
        </div>
      </div>
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-in fade-in duration-700">
        <Card className="border-blue-200 bg-blue-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Total de Bobinas</CardTitle>
            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{filteredData.length}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Bobinas cadastradas no sistema
            </p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Bobinas com Estoque</CardTitle>
            <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {estoque.emEstoque.length}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Bobinas disponíveis para uso
            </p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-yellow-800 dark:bg-yellow-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Baixo Estoque</CardTitle>
            <Package className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {estoque.baixoEstoque.length}
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Bobinas com estoque baixo
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-red-800 dark:bg-red-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Bobinas sem Estoque</CardTitle>
            <Package className="h-5 w-5 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {estoque.semEstoque.length}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              Bobinas que precisam de reposição
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Bobinas */}
      <Card className="border hover:shadow-md transition-all animate-in fade-in duration-1000">
        <CardHeader className="bg-muted border-b">
          <CardTitle className="text-foreground">Lista de Bobinas</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gerencie e visualize todas as bobinas de matéria-prima cadastradas no sistema
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <DataTable
            data={bobinasOriginais}
            columns={columns}
            searchable={true}
            pagination={true}
            isLoading={isLoading}
            onFilterChange={(filtered) => setFilteredData(filtered)}
          />
        </CardContent>
      </Card>

      {/* Modal de Corte */}
      <Dialog open={isCorteDialogOpen} onOpenChange={setIsCorteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Corte</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <label htmlFor="corte-quantidade_total">quantidade_total a Cortar</label>
              <Input
                id="corte-quantidade_total"
                type="number"
                value={quantidade_totalCorte}
                onChange={(e) => setquantidade_totalCorte(e.target.value)}
                placeholder="quantidade_total em metros"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="corte-ordem">Ordem de Produção</label>
              <Input
                id="corte-ordem"
                value={ordemProducao}
                onChange={(e) => setOrdemProducao(e.target.value)}
                placeholder="Número da ordem de produção (opcional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsCorteDialogOpen(false);
              setquantidade_totalCorte("");
              setOrdemProducao("");
              setSelectedRow(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleCorte} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registrando...
                </>
              ) : (
                "Registrar Corte"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Histórico */}
      <Dialog open={isHistoricoDialogOpen} onOpenChange={setIsHistoricoDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Histórico de Movimentações</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Bobina</label>
                <p className="text-sm text-muted-foreground">
                  {selectedRow?.tipo_tecido} - {selectedRow?.cor}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">quantidade_total Atual</label>
                <p className="text-sm text-muted-foreground">
                  {selectedRow?.quantidade_total} {selectedRow?.unidade}
                </p>
              </div>
            </div>
            <div className="border rounded-lg">
              <DataTable
                data={historico}
                columns={[
                  { 
                    accessor: "data" as keyof Movimentacao, 
                    header: "Data",
                    cell: (row: Movimentacao) => format(new Date(row.data), "dd/MM/yyyy HH:mm", { locale: ptBR })
                  },
                  { 
                    accessor: "tipo" as keyof Movimentacao, 
                    header: "Tipo",
                    cell: (row: Movimentacao) => {
                      let color = "bg-blue-100 text-blue-800";
                      if (row.tipo === "Corte") color = "bg-red-100 text-red-800";
                      if (row.tipo === "Ajuste") color = "bg-yellow-100 text-yellow-800";
                      
                      return (
                        <Badge variant="outline" className={`${color}`}>
                          {row.tipo}
                        </Badge>
                      );
                    }
                  },
                  { 
                    accessor: "quantidade_total" as keyof Movimentacao, 
                    header: "quantidade_total",
                    cell: (row: Movimentacao) => (
                      <span className={row.quantidade_total < 0 ? "text-red-500" : "text-green-500"}>
                        {row.quantidade_total > 0 ? "+" : ""}{row.quantidade_total} {selectedRow?.unidade}
                      </span>
                    )
                  },
                  { accessor: "ordemProducao" as keyof Movimentacao, header: "Ordem de Produção" },
                  { accessor: "responsavel" as keyof Movimentacao, header: "Responsável" }
                ]}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsHistoricoDialogOpen(false);
              setSelectedRow(null);
              setHistorico([]);
            }}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Nova Bobina */}
      <Dialog open={isNovaBobinaDialogOpen} onOpenChange={(open) => {
        setIsNovaBobinaDialogOpen(open);
        if (!open) {
          limparFormulario();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Bobina</DialogTitle>
          </DialogHeader>
          {novaBobina && (
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="tipo_tecido">Tipo de Tecido</label>
                  <Select
                    value={novaBobina.tipo_tecido}
                    onValueChange={(value) => {
                      setNovaBobina({ ...novaBobina, tipo_tecido: value, cor: "" });
                      if (value) {
                        carregarCoresPorTipoTecido(value);
                      } else {
                        setCoresPorTipoTecido([]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de tecido" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposTecido.map((tipo) => {
                        console.log('Renderizando tipo:', tipo); // DEBUG
                        return (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="cor">Cor</label>
                  <Select
                    value={novaBobina.cor}
                    onValueChange={(value) => setNovaBobina({ ...novaBobina, cor: value })}
                    disabled={!novaBobina.tipo_tecido}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={novaBobina.tipo_tecido ? "Selecione a cor" : "Primeiro selecione o tipo de tecido"} />
                    </SelectTrigger>
                    <SelectContent>
                      {coresPorTipoTecido.map((cor) => {
                        console.log('Renderizando cor:', cor); // DEBUG
                        return (
                          <SelectItem key={cor} value={cor}>
                            {cor}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="lote">Lote</label>
                  <Input
                    id="lote"
                    value={novaBobina.lote}
                    onChange={(e) => setNovaBobina({ ...novaBobina, lote: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="fornecedor">Fornecedor</label>
                  <Input
                    id="fornecedor"
                    value={novaBobina.fornecedor}
                    onChange={(e) => setNovaBobina({ ...novaBobina, fornecedor: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="quantidade_total">quantidade_total</label>
                  <Input
                    id="quantidade_total"
                    type="number"
                    value={novaBobina.quantidade_total}
                    onChange={(e) => setNovaBobina({ ...novaBobina, quantidade_total: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="unidade">Unidade</label>
                  <Select
                    value={novaBobina.unidade}
                    onValueChange={(value) => setNovaBobina({ ...novaBobina, unidade: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Bobina">Bobina</SelectItem> 
                      {/* <SelectItem value="m">Metros (m)</SelectItem>
                      <SelectItem value="kg">Quilogramas (kg)</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="localizacao">Localização</label>
                  <Input
                    id="localizacao"
                    value={novaBobina.localizacao}
                    onChange={(e) => setNovaBobina({ ...novaBobina, localizacao: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="data_entrada">Data de Entrada</label>
                  <Input
                    id="data_entrada"
                    type="date"
                    value={format(novaBobina.data_entrada, "yyyy-MM-dd")}
                    onChange={(e) => setNovaBobina({ ...novaBobina, data_entrada: new Date(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="codigo_barras">Código de Barras</label>
                <Input
                  id="codigo_barras"
                  value={novaBobina.codigo_barras}
                  onChange={(e) => setNovaBobina({ ...novaBobina, codigo_barras: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="observacoes">Observações</label>
                <Input
                  id="observacoes"
                  value={novaBobina.observacoes}
                  onChange={(e) => setNovaBobina({ ...novaBobina, observacoes: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsNovaBobinaDialogOpen(false);
              limparFormulario();
            }}>
              Cancelar
            </Button>
            <Button onClick={handleCreateBobina} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Bobina"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Bobina</DialogTitle>
          </DialogHeader>
          {bobinaEditando && (
            <div className="grid gap-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-tipo_tecido">Tipo de Tecido</label>
                  <Select
                    value={bobinaEditando.tipo_tecido}
                    onValueChange={(value) => {
                      setBobinaEditando({ ...bobinaEditando, tipo_tecido: value, cor: "" });
                      if (value) {
                        carregarCoresPorTipoTecido(value);
                      } else {
                        setCoresPorTipoTecido([]);
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de tecido" />
                    </SelectTrigger>
                    <SelectContent>
                      {tiposTecido.map((tipo) => {
                        console.log('Renderizando tipo (editar):', tipo); // DEBUG
                        return (
                          <SelectItem key={tipo} value={tipo}>
                            {tipo}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-cor">Cor</label>
                  <Select
                    value={bobinaEditando.cor}
                    onValueChange={(value) => setBobinaEditando({ ...bobinaEditando, cor: value })}
                    disabled={!bobinaEditando.tipo_tecido}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={bobinaEditando.tipo_tecido ? "Selecione a cor" : "Primeiro selecione o tipo de tecido"} />
                    </SelectTrigger>
                    <SelectContent>
                      {coresPorTipoTecido.map((cor) => {
                        console.log('Renderizando cor (editar):', cor); // DEBUG
                        return (
                          <SelectItem key={cor} value={cor}>
                            {cor}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-lote">Lote</label>
                  <Input
                    id="edit-lote"
                    value={bobinaEditando.lote}
                    onChange={(e) => setBobinaEditando({ ...bobinaEditando, lote: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-fornecedor">Fornecedor</label>
                  <Input
                    id="edit-fornecedor"
                    value={bobinaEditando.fornecedor}
                    onChange={(e) => setBobinaEditando({ ...bobinaEditando, fornecedor: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-quantidade_total">Quantidade Total</label>
                  <Input
                    id="edit-quantidade_total"
                    type="number"
                    value={bobinaEditando.quantidade_total}
                    onChange={(e) => setBobinaEditando({ ...bobinaEditando, quantidade_total: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-quantidade_disponivel">Quantidade Disponível</label>
                  <Input
                    id="edit-quantidade_disponivel"
                    type="number"
                    value={bobinaEditando.quantidade_disponivel}
                    onChange={(e) => setBobinaEditando({ ...bobinaEditando, quantidade_disponivel: parseFloat(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-unidade">Unidade</label>
                  <Select
                    value={bobinaEditando.unidade}
                    onValueChange={(value) => setBobinaEditando({ ...bobinaEditando, unidade: value })}
                  >
                    <SelectTrigger aria-readonly>
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                    <SelectItem value="Bobina" aria-selected>Bobina</SelectItem>
                      {/* <SelectItem value="m">Metros (m)</SelectItem>
                      <SelectItem value="kg">Quilogramas (kg)</SelectItem> */}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="edit-localizacao">Localização</label>
                  <Input
                    id="edit-localizacao"
                    value={bobinaEditando.localizacao}
                    onChange={(e) => setBobinaEditando({ ...bobinaEditando, localizacao: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-data_entrada">Data de Entrada</label>
                  <Input
                    id="edit-data_entrada"
                    type="date"
                    value={format(new Date(bobinaEditando.data_entrada), "yyyy-MM-dd")}
                    onChange={(e) => setBobinaEditando({ ...bobinaEditando, data_entrada: new Date(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-codigo_barras">Código de Barras</label>
                <Input
                  id="edit-codigo_barras"
                  value={bobinaEditando.codigo_barras}
                  onChange={(e) => setBobinaEditando({ ...bobinaEditando, codigo_barras: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-observacoes">Observações</label>
                <Input
                  id="edit-observacoes"
                  value={bobinaEditando.observacoes}
                  onChange={(e) => setBobinaEditando({ ...bobinaEditando, observacoes: e.target.value })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditDialogOpen(false);
              setBobinaEditando(null);
            }}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Alterações"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Exclusão */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setSelectedRow(null);
        }}
        onConfirm={handleDelete}
        title="Confirmar Exclusão"
        description={`Tem certeza que deseja excluir a bobina ${selectedRow?.tipo_tecido} - ${selectedRow?.cor}?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />

      {/* Dialog de Filtros */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filtrar Bobinas</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="space-y-2">
              <label htmlFor="filtro-status">Status</label>
              <Select
                value={filtros.status}
                onValueChange={(value) => setFiltros({ ...filtros, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos</SelectItem>
                  <SelectItem value="Em Estoque">Em Estoque</SelectItem>
                  <SelectItem value="Baixo Estoque">Baixo Estoque</SelectItem>
                  <SelectItem value="Sem Estoque">Sem Estoque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label htmlFor="filtro-fornecedor">Fornecedor</label>
              <Input
                id="filtro-fornecedor"
                value={filtros.fornecedor}
                onChange={(e) => setFiltros({ ...filtros, fornecedor: e.target.value })}
                placeholder="Nome do fornecedor"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="filtro-data-inicio">Data Inicial</label>
                <Input
                  id="filtro-data-inicio"
                  type="date"
                  value={filtros.dataInicio}
                  onChange={(e) => setFiltros({ ...filtros, dataInicio: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="filtro-data-fim">Data Final</label>
                <Input
                  id="filtro-data-fim"
                  type="date"
                  value={filtros.dataFim}
                  onChange={(e) => setFiltros({ ...filtros, dataFim: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleLimparFiltros}>
              Limpar Filtros
            </Button>
            <Button onClick={handleAplicarFiltros} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Aplicando...
                </>
              ) : (
                "Aplicar Filtros"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 