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
import { Loader2, Plus, Pencil, Trash2, Search, BarcodeIcon, Download, FileText, Filter } from "lucide-react";
import { BarcodeScanner } from "@/components/BarcodeScanner";
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { DropdownMenuContent } from "@/components/ui/dropdown-menu";
import { ActionButton } from "@/components/ActionButton";
import { toast } from "sonner";

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
  const [currentProduto, setCurrentProduto] = useState<any>(null);
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Produtos</h1>
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
          >
            Novo Produto
          </ActionButton>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
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
                      <TableHead>SKU</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Estoque</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Localização</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {produtos.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                          Nenhum produto encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      produtos.map((produto) => (
                        <TableRow key={produto.id}>
                          <TableCell>{produto.sku || '-'}</TableCell>
                          <TableCell>{produto.nome_produto}</TableCell>
                          <TableCell>{produto.categoria || '-'}</TableCell>
                          <TableCell className={produto.quantidade <= produto.estoque_minimo ? "text-red-600 font-medium" : ""}>
                            {produto.quantidade} {produto.unidade_medida}
                          </TableCell>
                          <TableCell>{formatCurrency(parseFloat(produto.valor_unitario))}</TableCell>
                          <TableCell>{produto.localizacao || '-'}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Pencil className="h-4 w-4" />
                                  <span className="sr-only">Ações</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditProduto(produto)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteClick(produto)}>
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {currentProduto ? 'Editar Produto' : 'Novo Produto'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
}
