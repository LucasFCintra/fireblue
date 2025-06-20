import { useState, useEffect } from "react";
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
  const [search, setSearch] = useState("");
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
    pesquisar 
  } = useProdutos();

  // Carregar produtos
  const loadProdutos = async () => {
    try {
      const data = await listar();
      console.log(data)
      setProdutos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao carregar produtos:", err);
      setProdutos([]);
    }
  };

  // Buscar produtos
  const handleSearch = async () => {
    if (!search.trim()) {
      await loadProdutos();
      return;
    }
    try {
      const data = await pesquisar(search);
      setProdutos(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setProdutos([]);
    }
  };

  // Carregar produtos ao montar componente
  useEffect(() => {
    loadProdutos();
  }, []);

  // Calcular estatísticas
  const calcularEstatisticas = () => {
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
  };

  const estatisticas = calcularEstatisticas();

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
      loadProdutos();
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
        loadProdutos();
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
      // Simular upload para um servidor
      await new Promise(resolve => setTimeout(resolve, 1000));
      const fakeServerUrl = URL.createObjectURL(file);
      
      setFormData(prev => ({ ...prev, imagem: fakeServerUrl }));
      setImagePreview(fakeServerUrl);
      
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
      // Implementar lógica de ajuste de estoque
      toast.success("Estoque ajustado com sucesso!");
      setIsAjusteDialogOpen(false);
      loadProdutos();
    } catch (error) {
      console.error("Erro ao ajustar estoque:", error);
      toast.error("Erro ao ajustar estoque");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Função para determinar o status do produto
  const getProdutoStatus = (produto: any) => {
    if (produto.quantidade === 0) return "Sem Estoque";
    if (produto.quantidade <= produto.estoque_minimo) return "Baixo Estoque";
    return "Em Estoque";
  };

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
          <div className="flex gap-2">
            <Input
              placeholder="Buscar produto ou SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <ActionButton 
              onClick={handleSearch} 
              isLoading={isLoading} 
              loadingText="Buscando..." 
              size="sm"
              startIcon={<Search className="h-4 w-4" />}
            >
              Buscar
            </ActionButton>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => toast.info("Relatório de Produtos será implementado")}>
                <Package className="w-4 h-4 mr-2" />
                Relatório de Produtos
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Relatório de Estoque será implementado")}>
                <FileText className="w-4 h-4 mr-2" />
                Relatório de Estoque
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Relatório de Valorização será implementado")}>
                <DollarSign className="w-4 h-4 mr-2" />
                Valorização
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ActionButton
            variant="outline" 
            size="sm"
            startIcon={<Filter className="h-4 w-4" />}
            onClick={() => toast.info("Filtros serão implementados")}
          >
            Filtros
          </ActionButton>
          
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

      {/* Tabela de Produtos */}
      <Card className="border hover:shadow-md transition-all animate-in fade-in duration-1000">
        <CardHeader className="bg-muted border-b">
          <CardTitle className="text-foreground">Lista de Produtos</CardTitle>
          <p className="text-sm text-muted-foreground">
            Gerencie e visualize todos os produtos cadastrados no sistema
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>Produto</TableHead>
                      <TableHead>SKU</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-4 text-muted-foreground">
                          Nenhum produto encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      produtos.map((produto) => {
                        const status = getProdutoStatus(produto);
                        let statusColor = "";
                        let iconColor = "";
                        let bgHoverColor = "";
                        
                        if (status === "Em Estoque") {
                          statusColor = "bg-green-100 text-green-800";
                          iconColor = "text-green-600";
                          bgHoverColor = "hover:bg-green-50";
                        } else if (status === "Baixo Estoque") {
                          statusColor = "bg-yellow-100 text-yellow-800";
                          iconColor = "text-yellow-600";
                          bgHoverColor = "hover:bg-yellow-50";
                        } else if (status === "Sem Estoque") {
                          statusColor = "bg-red-100 text-red-800";
                          iconColor = "text-red-600";
                          bgHoverColor = "hover:bg-red-50";
                        }

                        return (
                          <TableRow key={produto.id} className="hover:bg-muted/50 transition-colors">
                            <TableCell>
                              <ImagemCell produto={produto} />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium text-gray-900">{produto.nome_produto}</span>
                                <span className="text-sm text-gray-500">{produto.codigo_barras || 'Sem código'}</span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{produto.sku || '-'}</TableCell>
                          <TableCell>{produto.categoria || '-'}</TableCell>
                            <TableCell>
                              <span className={`font-medium ${produto.quantidade <= produto.estoque_minimo ? "text-red-600" : "text-green-600"}`}>
                            {produto.quantidade} {produto.unidade_medida}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColor}>
                                {status}
                              </Badge>
                          </TableCell>
                            <TableCell className="font-medium">{formatCurrency(parseFloat(produto.valor_unitario))}</TableCell>
                          <TableCell>{produto.localizacao || '-'}</TableCell>
                          <TableCell className="text-right">
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
                          </TableCell>
                        </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
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
                      getProdutoStatus(currentProduto) === "Em Estoque" 
                        ? "bg-green-100 text-green-800 border-green-200" 
                        : getProdutoStatus(currentProduto) === "Baixo Estoque" 
                        ? "bg-yellow-100 text-yellow-800 border-yellow-200" 
                        : "bg-red-100 text-red-800 border-red-200"
                    }
                  >
                    {getProdutoStatus(currentProduto)}
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
