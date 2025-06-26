import { useState, useEffect, useMemo } from "react";
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from "@/components/ui/select";
import { useProdutos } from "@/hooks/useProdutos";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Loader2, Plus, Pencil, Trash2, Search, BarcodeIcon, Download, FileText, Filter, Package, DollarSign, AlertTriangle, TrendingUp, Eye, Upload, X, Image, BarChart3, Edit } from "lucide-react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { ActionButton } from "@/components/ActionButton";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { AjusteEstoqueForm } from "@/components/forms/AjusteEstoqueForm";
import DataTable from "@/components/DataTable";
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Componente para a célula da imagem
const ImagemCell = ({ produto }: { produto: any }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="w-10 h-10 rounded-md overflow-hidden border border-input">
      {produto.imagem && !imageError ? (
        <img 
          src={produto.imagem} 
          alt={produto.nome_produto}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full bg-muted flex items-center justify-center">
          <Package className="h-5 w-5 text-muted-foreground" />
        </div>
      )}
    </div>
  );
};

export default function Produtos() {
  // Estados para produtos
  const [produtos, setProdutos] = useState<any[]>([]);
  const [filteredProdutos, setFilteredProdutos] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const pageSize = 10;
  
  // Estados para formulário
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false);
  const [isAjusteDialogOpen, setIsAjusteDialogOpen] = useState(false);
  const [currentProduto, setCurrentProduto] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    nome_produto: "",
    sku: "",
    categoria: "",
    valor_unitario: "0.00",
    quantidade: 0,
    estoque_minimo: 0,
    localizacao: "",
    unidade_medida: "un",
    imagem: null,
    codigo_barras: null,
    fornecedor: null,
    descricao: ""
  });
  
  // Hook CRUD
  const { 
    isLoading, 
    error, 
    listar, 
    criar, 
    atualizar, 
    excluir, 
    pesquisar,
    ajustarEstoque,
    uploadImagem 
  } = useProdutos();

  // Função para determinar o status do produto
  const getProdutoStatus = (produto: any) => {
    if (produto.quantidade === 0) return "Sem Estoque";
    if (produto.quantidade <= produto.estoque_minimo) return "Baixo Estoque";
    return "Em Estoque";
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Carregar produtos
  const loadProdutos = async () => {
    try {
      const data = await listar();
      console.log(data)
      const produtosComStatus = Array.isArray(data) ? data.map(produto => ({
        ...produto,
        status: getProdutoStatus(produto)
      })) : [];
      setProdutos(produtosComStatus);
      setFilteredProdutos(produtosComStatus);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      setProdutos([]);
      setFilteredProdutos([]);
    }
  };

  // Carregar produtos ao montar componente
  useEffect(() => {
    loadProdutos();
  }, []);

  // Calcular estatísticas
  const estatisticas = useMemo(() => {
    const totalProdutos = produtos.length;
    const produtosEmEstoque = produtos.filter(p => p.quantidade > p.estoque_minimo).length;
    const produtosBaixoEstoque = produtos.filter(p => p.quantidade <= p.estoque_minimo && p.quantidade > 0).length;
    const produtosSemEstoque = produtos.filter(p => p.quantidade === 0).length;
    const valorTotalEstoque = produtos.reduce((total, p) => total + (p.quantidade * parseFloat(p.valor_unitario || 0)), 0);

    return {
      totalProdutos,
      produtosEmEstoque,
      produtosBaixoEstoque,
      produtosSemEstoque,
      valorTotalEstoque
    };
  }, [produtos]);

  // Função para gerar relatório em Excel
  const gerarRelatorioExcel = () => {
    try {
      // Criar um novo workbook
      const workbook = XLSX.utils.book_new();
      
      // Preparar dados para a planilha principal
      const dadosPlanilha = filteredProdutos.map(produto => ({
        'Nome do Produto': produto.nome_produto,
        'SKU': produto.sku || '',
        'Categoria': produto.categoria || '',
        'Valor Unitário': parseFloat(produto.valor_unitario || 0),
        'Quantidade': produto.quantidade || 0,
        'Estoque Mínimo': produto.estoque_minimo || 0,
        'Status': produto.status,
        'Localização': produto.localizacao || '',
        'Unidade de Medida': produto.unidade_medida || 'un',
        'Código de Barras': produto.codigo_barras || '',
        'Fornecedor': produto.fornecedor || '',
        'Descrição': produto.descricao || '',
        'Valor Total em Estoque': (produto.quantidade || 0) * parseFloat(produto.valor_unitario || 0)
      }));
      
      // Criar planilha principal
      const worksheet = XLSX.utils.json_to_sheet(dadosPlanilha);
      
      // Configurar larguras das colunas
      const colWidths = [
        { wch: 25 }, // Nome do Produto
        { wch: 15 }, // SKU
        { wch: 20 }, // Categoria
        { wch: 15 }, // Valor Unitário
        { wch: 12 }, // Quantidade
        { wch: 15 }, // Estoque Mínimo
        { wch: 15 }, // Status
        { wch: 20 }, // Localização
        { wch: 15 }, // Unidade de Medida
        { wch: 20 }, // Código de Barras
        { wch: 20 }, // Fornecedor
        { wch: 30 }, // Descrição
        { wch: 20 }  // Valor Total em Estoque
      ];
      worksheet['!cols'] = colWidths;
      
      // Adicionar planilha ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Produtos');
      
      // Criar planilha de resumo
      const dadosResumo = [
        { 'Métrica': 'Total de Produtos', 'Valor': estatisticas.totalProdutos },
        { 'Métrica': 'Em Estoque', 'Valor': estatisticas.produtosEmEstoque },
        { 'Métrica': 'Baixo Estoque', 'Valor': estatisticas.produtosBaixoEstoque },
        { 'Métrica': 'Sem Estoque', 'Valor': estatisticas.produtosSemEstoque },
        { 'Métrica': 'Valor Total em Estoque', 'Valor': formatCurrency(estatisticas.valorTotalEstoque) },
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
        { 'Status': 'Em Estoque', 'Quantidade': estatisticas.produtosEmEstoque, 'Percentual': `${((estatisticas.produtosEmEstoque / estatisticas.totalProdutos) * 100).toFixed(1)}%` },
        { 'Status': 'Baixo Estoque', 'Quantidade': estatisticas.produtosBaixoEstoque, 'Percentual': `${((estatisticas.produtosBaixoEstoque / estatisticas.totalProdutos) * 100).toFixed(1)}%` },
        { 'Status': 'Sem Estoque', 'Quantidade': estatisticas.produtosSemEstoque, 'Percentual': `${((estatisticas.produtosSemEstoque / estatisticas.totalProdutos) * 100).toFixed(1)}%` }
      ];
      
      const worksheetEstoque = XLSX.utils.json_to_sheet(dadosEstoque);
      worksheetEstoque['!cols'] = [{ wch: 20 }, { wch: 15 }, { wch: 15 }];
      
      // Adicionar planilha de estoque ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheetEstoque, 'Análise de Estoque');
      
      // Configurar propriedades do workbook
      workbook.Props = {
        Title: 'Relatório de Produtos - Controle de Estoque',
        Subject: 'Relatório de Produtos e Estoque',
        Author: 'SGE FireBlue',
        CreatedDate: new Date(),
        Keywords: 'produtos, estoque, relatório',
        Category: 'Relatório de Produtos'
      };
      
      // Gerar o arquivo Excel
      const nomeArquivo = `relatorio_produtos_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xlsx`;
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
      doc.text('Relatório de Produtos - Controle de Estoque', 105, 20, { align: 'center' });
      
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
      doc.text(`Total de Produtos: ${estatisticas.totalProdutos}`, 20, 60);
      doc.text(`Em Estoque: ${estatisticas.produtosEmEstoque}`, 20, 67);
      doc.text(`Baixo Estoque: ${estatisticas.produtosBaixoEstoque}`, 20, 74);
      doc.text(`Sem Estoque: ${estatisticas.produtosSemEstoque}`, 20, 81);
      doc.text(`Valor Total: ${formatCurrency(estatisticas.valorTotalEstoque)}`, 20, 88);
      
      // Preparar dados para a tabela
      const dadosTabela = filteredProdutos.map(produto => [
        produto.nome_produto,
        produto.sku || '',
        produto.categoria || '',
        formatCurrency(parseFloat(produto.valor_unitario || 0)),
        `${produto.quantidade || 0} ${produto.unidade_medida || 'un'}`,
        produto.status,
        produto.localizacao || '',
        formatCurrency((produto.quantidade || 0) * parseFloat(produto.valor_unitario || 0))
      ]);
      
      // Cabeçalhos da tabela
      const headers = [
        'Produto',
        'SKU',
        'Categoria',
        'Valor Unit.',
        'Estoque',
        'Status',
        'Localização',
        'Valor Total'
      ];
      
      // Configurações da tabela
      const tableConfig = {
        head: [headers],
        body: dadosTabela,
        startY: 105,
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
          0: { cellWidth: 35 }, // Produto
          1: { cellWidth: 20 }, // SKU
          2: { cellWidth: 25 }, // Categoria
          3: { cellWidth: 20 }, // Valor Unit.
          4: { cellWidth: 20 }, // Estoque
          5: { cellWidth: 20 }, // Status
          6: { cellWidth: 25 }, // Localização
          7: { cellWidth: 20 }  // Valor Total
        },
        didParseCell: function(data: any) {
          // Colorir células de status
          if (data.column.index === 5) { // Coluna Status
            const status = data.cell.text[0];
            if (status === 'Em Estoque') {
              data.cell.styles.textColor = [0, 128, 0]; // Verde
            } else if (status === 'Baixo Estoque') {
              data.cell.styles.textColor = [255, 140, 0]; // Laranja
            } else if (status === 'Sem Estoque') {
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
      const nomeArquivo = `relatorio_produtos_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.pdf`;
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
      toast.error('Formato não suportado');
    }
  };

  // Abrir modal para novo produto
  const handleNewProduto = () => {
    setCurrentProduto(null);
    setFormData({
      nome_produto: "",
      sku: "",
      categoria: "",
      valor_unitario: "0.00",
      quantidade: 0,
      estoque_minimo: 0,
      localizacao: "",
      unidade_medida: "un",
      imagem: null,
      codigo_barras: null,
      fornecedor: null,
      descricao: ""
    });
    setImagePreview(null);
    setIsModalOpen(true);
  };

  // Abrir modal para editar produto
  const handleEditProduto = (produto: any) => {
    setCurrentProduto(produto);
    setFormData({
      nome_produto: produto.nome_produto,
      sku: produto.sku || "",
      categoria: produto.categoria || "",
      valor_unitario: produto.valor_unitario || "0.00",
      quantidade: produto.quantidade || 0,
      estoque_minimo: produto.estoque_minimo || 0,
      localizacao: produto.localizacao || "",
      unidade_medida: produto.unidade_medida || "un",
      imagem: produto.imagem,
      codigo_barras: produto.codigo_barras,
      fornecedor: produto.fornecedor,
      descricao: produto.descricao || ""
    });
    setImagePreview(produto.imagem);
    setIsModalOpen(true);
  };

  // Abrir diálogo de confirmação para exclusão
  const handleDeleteClick = (produto: any) => {
    setCurrentProduto(produto);
    setIsDeleteDialogOpen(true);
  };

  // Salvar produto (criar ou editar)
  const handleSaveProduto = async () => {
    // Validações
    if (!formData.nome_produto) {
      toast.error("Nome do produto é obrigatório");
      return;
    }

    try {
      if (currentProduto) {
        // Atualizar produto existente
        await atualizar(currentProduto.id, formData);
      } else {
        // Criar novo produto
        await criar(formData);
      }
      
      // Fechar modal e atualizar lista
      setIsModalOpen(false);
      await loadProdutos();
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
    }
  };

  // Excluir produto
  const handleDeleteProduto = async () => {
    if (currentProduto) {
      try {
        await excluir(currentProduto.id);
        setIsDeleteDialogOpen(false);
        await loadProdutos();
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
      }
    }
  };

  // Lidar com leitura de código de barras
  const handleBarcodeDetected = (barcode: string) => {
    setFormData(prev => ({ ...prev, codigo_barras: barcode }));
    setIsScannerOpen(false);
  };

  // Função para lidar com upload de imagem
  const handleImageUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Fazer upload real para o servidor
      const imageUrl = await uploadImagem(file);
      
      setFormData(prev => ({ ...prev, imagem: imageUrl }));
      setImagePreview(imageUrl);
      
      setIsUploading(false);
      toast.success("Imagem carregada com sucesso!");
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      toast.error("Erro ao fazer upload da imagem");
      setIsUploading(false);
    }
  };

  // Função para remover imagem
  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setFormData(prev => ({ ...prev, imagem: null }));
  };

  // Lidar com ajuste de estoque
  const handleAjusteEstoque = async (data: any) => {
    try {
      console.log("Recebendo dados do ajuste:", data);
      console.log("ID do produto:", currentProduto?.id);
      
      // Chamar a função de ajuste de estoque do hook
      await ajustarEstoque(currentProduto?.id, {
        tipoAjuste: data.tipoAjuste,
        quantidade: data.quantidade,
        observacao: data.observacao
      });
      
      console.log("Ajuste de estoque realizado com sucesso!");
      
      // Fechar o modal
      setIsAjusteDialogOpen(false);
      
      // Recarregar os produtos para atualizar a lista
      await loadProdutos();
    } catch (error) {
      console.error("Erro ao ajustar estoque:", error);
      // O erro já é tratado no hook useProdutos
    }
  };

  // Configuração das colunas para o DataTable
  const columns = [
    {
      accessor: 'imagem' as keyof any,
      header: '',
      cell: (produto: any) => <ImagemCell produto={produto} />,
      filterable: false
    },
    {
      accessor: 'nome_produto' as keyof any,
      header: 'Produto',
      cell: (produto: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-gray-900">{produto.nome_produto}</span>
          <span className="text-sm text-gray-500">{produto.codigo_barras || 'Sem código'}</span>
        </div>
      )
    },
    {
      accessor: 'sku' as keyof any,
      header: 'SKU'
    },
    {
      accessor: 'categoria' as keyof any,
      header: 'Categoria'
    },
    {
      accessor: 'quantidade' as keyof any,
      header: 'Estoque',
      cell: (produto: any) => (
        <span className={`font-medium ${produto.quantidade <= produto.estoque_minimo ? "text-red-600" : "text-green-600"}`}>
          {produto.quantidade} {produto.unidade_medida}
        </span>
      )
    },
    {
      accessor: 'status' as keyof any,
      header: 'Status',
      cell: (produto: any) => {
        const status = produto.status;
        let statusColor = "";
        
        if (status === "Em Estoque") {
          statusColor = "bg-green-100 text-green-800";
        } else if (status === "Baixo Estoque") {
          statusColor = "bg-yellow-100 text-yellow-800";
        } else if (status === "Sem Estoque") {
          statusColor = "bg-red-100 text-red-800";
        }

        return (
          <Badge variant="outline" className={statusColor}>
            {status}
          </Badge>
        );
      }
    },
    {
      accessor: 'valor_unitario' as keyof any,
      header: 'Valor',
      cell: (produto: any) => formatCurrency(parseFloat(produto.valor_unitario))
    },
    {
      accessor: 'localizacao' as keyof any,
      header: 'Localização'
    },
    {
      accessor: 'acoes' as keyof any,
      header: 'Ações',
      cell: (produto: any) => (
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setCurrentProduto(produto);
              setIsDetalhesOpen(true);
            }}
            title="Visualizar Detalhes"
          >
            <Search className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleEditProduto(produto)}
            title="Editar Produto"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              setCurrentProduto(produto);
              setIsAjusteDialogOpen(true);
            }}
            title="Ajustar Estoque"
          >
            <Package className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleDeleteClick(produto)}
            title="Excluir Produto"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      filterable: false
    }
  ];

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Controle de Produtos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie produtos, controle estoque e acompanhe valores
          </p>
        </div>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport('excel')}>
                <Download className="w-4 h-4 mr-2" />
                Exportar Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('pdf')}>
                <FileText className="w-4 h-4 mr-2" />
                Exportar PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ActionButton
            onClick={handleNewProduto}
            size="sm"
            startIcon={<Plus className="h-4 w-4" />}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Novo Produto
          </ActionButton>
        </div>
      </div>

      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 animate-in fade-in duration-700">
        <Card className="border-blue-200 bg-blue-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-blue-800 dark:bg-blue-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Total de Produtos</CardTitle>
            <Package className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{estatisticas.totalProdutos}</div>
            <p className="text-xs text-blue-600 dark:text-blue-400">
              Produtos cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-green-800 dark:bg-green-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Em Estoque</CardTitle>
            <Package className="h-5 w-5 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">
              {estatisticas.produtosEmEstoque}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400">
              Produtos com estoque adequado
            </p>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-yellow-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-yellow-800 dark:bg-yellow-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Baixo Estoque</CardTitle>
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {estatisticas.produtosBaixoEstoque}
            </div>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">
              Produtos com estoque baixo
            </p>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-red-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-red-800 dark:bg-red-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800 dark:text-red-200">Sem Estoque</CardTitle>
            <Package className="h-5 w-5 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {estatisticas.produtosSemEstoque}
            </div>
            <p className="text-xs text-red-600 dark:text-red-400">
              Produtos que precisam de reposição
            </p>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-purple-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-purple-800 dark:bg-purple-950">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Valor Total</CardTitle>
            <DollarSign className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">
              {formatCurrency(estatisticas.valorTotalEstoque)}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400">
              Valor total em estoque
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Produtos com DataTable */}
      <Card className="border hover:shadow-md transition-all animate-in fade-in duration-1000">
        <CardHeader className="bg-muted border-b">
          <CardTitle className="text-foreground">Lista de Produtos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gerencie e visualize todos os produtos cadastrados no sistema
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <DataTable
            data={produtos}
            columns={columns}
            searchable={true}
            pagination={true}
            isLoading={isLoading}
            onFilterChange={setFilteredProdutos}
          />
        </CardContent>
      </Card>

      {/* Modal de Produto */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {currentProduto ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-6">
            {/* Seção de Imagem */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Imagem do Produto</label>
                <div className="mt-2 flex flex-col items-center">
                  {imagePreview ? (
                    <div className="relative w-full">
                      <img 
                        src={imagePreview} 
                        alt="Prévia da imagem" 
                        className="w-full h-auto object-contain rounded-md border border-input aspect-square" 
                      />
                      <button 
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                        aria-label="Remover imagem"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <div 
                      className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-4 hover:bg-gray-50 cursor-pointer" 
                      onClick={() => document.getElementById('product-image')?.click()}
                    >
                      <Image className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500 text-center">Clique para adicionar uma imagem</p>
                      <p className="text-xs text-gray-400 mt-1 text-center">PNG, JPG ou JPEG (máx. 5MB)</p>
                    </div>
                  )}
                  
                  <input
                    id="product-image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleImageUpload(file);
                      }
                    }}
                    className="hidden"
                    disabled={isUploading}
                  />
                  
                  {!imagePreview && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      className="mt-4 w-full" 
                      onClick={() => document.getElementById('product-image')?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Selecionar Imagem
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Seção de Informações Básicas */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">SKU *</label>
                <Input
                  placeholder="Código SKU"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Código de Barras</label>
                <div className="flex space-x-2">
                  <Input
                    placeholder="Código de Barras"
                    value={formData.codigo_barras || ''}
                    onChange={(e) => setFormData({ ...formData, codigo_barras: e.target.value })}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => setIsScannerOpen(true)}
                  >
                    <BarcodeIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Nome do Produto *</label>
                <Input
                  placeholder="Nome do Produto"
                  value={formData.nome_produto}
                  onChange={(e) => setFormData({ ...formData, nome_produto: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Categoria</label>
                <Input
                  placeholder="Categoria do Produto"
                  value={formData.categoria}
                  onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Descrição</label>
                <Input
                  placeholder="Descrição do Produto"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>
            </div>

            {/* Seção de Estoque e Valores */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Valor Unitário *</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.valor_unitario}
                  onChange={(e) => setFormData({ ...formData, valor_unitario: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Quantidade *</label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={formData.quantidade}
                  onChange={(e) => setFormData({ ...formData, quantidade: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Estoque Mínimo *</label>
                <Input
                  type="number"
                  step="1"
                  min="0"
                  placeholder="0"
                  value={formData.estoque_minimo}
                  onChange={(e) => setFormData({ ...formData, estoque_minimo: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Localização</label>
                <Input
                  placeholder="Localização no Estoque"
                  value={formData.localizacao}
                  onChange={(e) => setFormData({ ...formData, localizacao: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Unidade de Medida</label>
                <Select
                  value={formData.unidade_medida}
                  onValueChange={(value) => setFormData({ ...formData, unidade_medida: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="un">Unidade (un)</SelectItem>
                    <SelectItem value="kg">Quilograma (kg)</SelectItem>
                    <SelectItem value="g">Grama (g)</SelectItem>
                    <SelectItem value="l">Litro (l)</SelectItem>
                    <SelectItem value="ml">Mililitro (ml)</SelectItem>
                    <SelectItem value="m">Metro (m)</SelectItem>
                    <SelectItem value="cm">Centímetro (cm)</SelectItem>
                    <SelectItem value="pct">Pacote (pct)</SelectItem>
                    <SelectItem value="cx">Caixa (cx)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Fornecedor</label>
                <Input
                  placeholder="Nome do Fornecedor"
                  value={formData.fornecedor || ''}
                  onChange={(e) => setFormData({ ...formData, fornecedor: e.target.value })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveProduto} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                'Salvar'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de Confirmação de Exclusão */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteProduto}
        title="Excluir Produto"
        description="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
        confirmText="Excluir"
        cancelText="Cancelar"
      />

      {/* Scanner de Código de Barras */}
      <Dialog open={isScannerOpen} onOpenChange={setIsScannerOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Scanner de Código de Barras</DialogTitle>
          </DialogHeader>
          <BarcodeScanner onDetected={handleBarcodeDetected} />
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização Detalhada */}
      <Dialog open={isDetalhesOpen} onOpenChange={setIsDetalhesOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Produto</DialogTitle>
          </DialogHeader>
          
          {currentProduto && (
            <div className="grid grid-cols-3 gap-6">
              {/* Seção de Imagem */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Imagem do Produto</label>
                  <div className="mt-2 flex flex-col items-center">
                    {currentProduto.imagem ? (
                      <div className="relative w-full">
                        <img 
                          src={currentProduto.imagem} 
                          alt={currentProduto.nome_produto} 
                          className="w-full h-auto object-contain rounded-md border border-input aspect-square" 
                        />
                      </div>
                    ) : (
                      <div className="w-full aspect-square border-2 border-dashed border-gray-300 rounded-md flex flex-col items-center justify-center p-4 bg-gray-50">
                        <Image className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 text-center">Sem imagem</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Status do Produto */}
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <Badge 
                    variant="outline" 
                    className={
                      currentProduto.status === "Em Estoque" 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : currentProduto.status === "Baixo Estoque" 
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
                        : "bg-red-100 text-red-800 border-red-200"
                    }
                  >
                    {currentProduto.status}
                  </Badge>
                </div>
              </div>

              {/* Seção de Informações Básicas */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">SKU</label>
                  <div className="p-2 bg-gray-50 rounded-md border">
                    <p className="text-sm">{currentProduto.sku || 'Não informado'}</p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Código de Barras</label>
                  <div className="p-2 bg-gray-50 rounded-md border">
                    <p className="text-sm">{currentProduto.codigo_barras || 'Não informado'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Nome do Produto</label>
                  <div className="p-2 bg-gray-50 rounded-md border">
                    <p className="text-sm font-medium">{currentProduto.nome_produto}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Categoria</label>
                  <div className="p-2 bg-gray-50 rounded-md border">
                    <p className="text-sm">{currentProduto.categoria || 'Não informado'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Descrição</label>
                  <div className="p-2 bg-gray-50 rounded-md border">
                    <p className="text-sm">{currentProduto.descricao || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              {/* Seção de Estoque e Valores */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Valor Unitário</label>
                  <div className="p-2 bg-gray-50 rounded-md border">
                    <p className="text-sm font-medium">{formatCurrency(parseFloat(currentProduto.valor_unitario || 0))}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Quantidade em Estoque</label>
                  <div className="p-2 bg-gray-50 rounded-md border">
                    <p className="text-sm font-medium">{currentProduto.quantidade || 0} {currentProduto.unidade_medida || 'un'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Estoque Mínimo</label>
                  <div className="p-2 bg-gray-50 rounded-md border">
                    <p className="text-sm">{currentProduto.estoque_minimo || 0} {currentProduto.unidade_medida || 'un'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Localização</label>
                  <div className="p-2 bg-gray-50 rounded-md border">
                    <p className="text-sm">{currentProduto.localizacao || 'Não informado'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Unidade de Medida</label>
                  <div className="p-2 bg-gray-50 rounded-md border">
                    <p className="text-sm">{currentProduto.unidade_medida || 'Unidade (un)'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Fornecedor</label>
                  <div className="p-2 bg-gray-50 rounded-md border">
                    <p className="text-sm">{currentProduto.fornecedor || 'Não informado'}</p>
                  </div>
                </div>
                
                {/* Valor Total em Estoque */}
                <div>
                  <label className="block text-sm font-medium mb-1">Valor Total em Estoque</label>
                  <div className="p-2 bg-blue-50 rounded-md border border-blue-200">
                    <p className="text-sm font-bold text-blue-800">
                      {formatCurrency((currentProduto.quantidade || 0) * parseFloat(currentProduto.valor_unitario || 0))}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetalhesOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Formulário de Ajuste de Estoque */}
      {isAjusteDialogOpen && currentProduto && (
        <AjusteEstoqueForm 
          isOpen={isAjusteDialogOpen}
          onClose={() => setIsAjusteDialogOpen(false)}
          onSubmit={handleAjusteEstoque}
          item={currentProduto}
        />
      )}
    </div>
  );
}
