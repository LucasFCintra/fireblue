import { useState, useEffect } from "react";
import { 
  Package, FileText, Download, Filter, Edit, Trash2, Plus, 
  Search, Loader2, Scissors, History, CheckCircle, Clock, CircleDot, Truck, MoveRight 
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
import { fichasService, Ficha } from "@/services/fichasService";
import { ReactNode } from "react";
import { StatusTrackingCard } from "@/components/StatusTrackingCard";
import { MovimentacaoModal } from "@/components/fichas/MovimentacaoModal";
import { todasFichas, fichasEmProducao, fichasAguardandoRetirada, fichasConcluidas } from "@/data/fichasDataMock";

export default function Fichas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<Ficha | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMovimentacaoDialogOpen, setIsMovimentacaoDialogOpen] = useState(false);
  const [isConcluirFichaDialogOpen, setIsConcluirFichaDialogOpen] = useState(false);
  const [isNovaFichaDialogOpen, setIsNovaFichaDialogOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<Ficha[]>(todasFichas);
  
  // Estado para nova ficha
  const [novaFicha, setNovaFicha] = useState<Omit<Ficha, 'id'>>({
    codigo: "",
    banca: "",
    dataEntrada: new Date(),
    dataPrevisao: new Date(),
    quantidade: 0,
    status: "aguardando-retirada",
    produto: "",
    cor: "",
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
  
  // Estatísticas
  const totalPecasCortadas = filteredData.reduce((total, ficha) => total + ficha.quantidade, 0);
  const totalFichasCriadas = filteredData.length;
  const totalFichasConcluidas = filteredData.filter(ficha => ficha.status === "concluido").length;
  
  // Função para carregar as fichas
  const carregarFichas = async () => {
    try {
      setIsLoading(true);
      // Em um ambiente real, você faria a chamada ao serviço
      // const fichas = await fichasService.listarFichas();
      // setFilteredData(fichas);
      
      // Usando dados mockados
      setFilteredData(todasFichas);
    } catch (error) {
      toast.error("Erro ao carregar fichas");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Carregar dados iniciais
  useEffect(() => {
    void carregarFichas();
  }, []);
  
  // Função para lidar com a pesquisa
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredData(todasFichas);
      return;
    }
    
    const filtrado = todasFichas.filter(ficha => 
      ficha.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ficha.banca.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ficha.produto.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ficha.cor.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredData(filtrado);
    toast.success(`${filtrado.length} ficha(s) encontrada(s)`);
  };
  
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
      // Em um ambiente real, você faria a chamada ao serviço
      // await fichasService.excluirFicha(selectedFicha.id);
      
      // Usando dados mockados
      const novaLista = filteredData.filter(ficha => ficha.id !== selectedFicha.id);
      setFilteredData(novaLista);
      
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
    setFichaEditando({...ficha});
    setIsEditDialogOpen(true);
  };
  
  // Função para lidar com a edição
  const handleEdit = async () => {
    if (!fichaEditando) return;
    
    try {
      setIsLoading(true);
      // Em um ambiente real, você faria a chamada ao serviço
      // await fichasService.atualizarFicha(fichaEditando);
      
      // Usando dados mockados
      const novaLista = filteredData.map(ficha => 
        ficha.id === fichaEditando.id ? fichaEditando : ficha
      );
      setFilteredData(novaLista);
      
      setIsEditDialogOpen(false);
      setFichaEditando(null);
      toast.success(`Ficha ${fichaEditando.codigo} atualizada com sucesso`);
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
    
    try {
      setIsLoading(true);
      // Em um ambiente real, você faria a chamada ao serviço
      // await fichasService.concluirFicha(selectedFicha.id);
      
      // Usando dados mockados
      const novaLista = filteredData.map(ficha => 
        ficha.id === selectedFicha.id ? {...ficha, status: "concluido" as any} : ficha
      );
      setFilteredData(novaLista);
      
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
    setIsNovaFichaDialogOpen(true);
  };
  
  // Função para lidar com a criação de uma nova ficha
  const handleCreateFicha = async () => {
    try {
      setIsLoading(true);
      // Em um ambiente real, você faria a chamada ao serviço
      // const novaFichaCriada = await fichasService.criarFicha(novaFicha);
      
      // Usando dados mockados
      const novaFichaCriada: Ficha = {
        ...novaFicha,
        id: `NOVA-${Date.now()}`
      };
      
      setFilteredData([novaFichaCriada, ...filteredData]);
      
      setIsNovaFichaDialogOpen(false);
      setNovaFicha({
        codigo: "",
        banca: "",
        dataEntrada: new Date(),
        dataPrevisao: new Date(),
        quantidade: 0,
        status: "aguardando-retirada",
        produto: "",
        cor: "",
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
      
      // Em um ambiente real, você faria a chamada ao serviço
      // const response = await fetch(`${API_URL}/fichas/exportar/${format}`...
      
      // Simulando a exportação
      setTimeout(() => {
        toast.success(`Dados exportados com sucesso em formato ${format}`);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      toast.error("Erro ao exportar dados");
      console.error(error);
      setIsLoading(false);
    }
  };
  
  // Função para lidar com a movimentação registrada
  const handleMovimentacaoRegistrada = () => {
    carregarFichas();
  };
  
  // Abrir modal por status
  const handleAbrirPorStatus = (status: string) => {
    const fichasFiltradas = todasFichas.filter(ficha => {
      if (status === "aguardando-retirada") return ficha.status === "aguardando-retirada";
      if (status === "em-producao") return ficha.status === "em-producao";
      if (status === "concluido") return ficha.status === "concluido";
      return false;
    });
    
    setFilteredData(fichasFiltradas);
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
      accessor: "dataEntrada" as keyof Ficha,
      header: "Data de Entrada",
      cell: (row: Ficha) => {
        return format(new Date(row.dataEntrada), 'dd/MM/yyyy', { locale: ptBR });
      },
    },
    {
      accessor: "dataPrevisao" as keyof Ficha,
      header: "Previsão de retorno",
      cell: (row: Ficha) => {
        return format(new Date(row.dataPrevisao), 'dd/MM/yyyy', { locale: ptBR });
      },
    },
    {
      accessor: "quantidade" as keyof Ficha,
      header: "Quantidade",
      cell: (row: Ficha) => (
        <span>{row.quantidade} unid.</span>
      ),
    },
    {
      accessor: "status" as keyof Ficha,
      header: "Status",
      cell: (row: Ficha) => {
        let variant = "default";
        if (row.status === "aguardando-retirada") variant = "outline";
        if (row.status === "em-producao") variant = "default";
        if (row.status === "concluido") variant = "success";
        
        return (
          <Badge variant={variant as any}
            className={row.status === "aguardando-retirada" ? "bg-amber-50 text-amber-500 border-amber-200 hover:bg-amber-50" : ""}
          >
            {row.status === "aguardando-retirada" ? "Aguardando Retirada" : 
             row.status === "em-producao" ? "Em Produção" : 
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
      accessor: (row: Ficha) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenMovimentacaoDialog(row);
            }}
          >
            <History className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditDialog(row);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {row.status !== "concluido" && (
            <Button
              variant="outline"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenConcluirDialog(row);
              }}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDeleteDialog(row);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      header: "Ações",
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Controle de Fichas</h1>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            <Input
              placeholder="Buscar por código, banca, produto..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
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
                <FileText className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleExport("excel")}> <Download className="w-4 h-4 mr-2" /> Excel </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}> <Download className="w-4 h-4 mr-2" /> PDF </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("csv")}> <Download className="w-4 h-4 mr-2" /> CSV </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ActionButton
            size="sm"
            startIcon={<Plus className="h-4 w-4" />}
            onClick={handleAddFicha}
          >
            Nova Ficha
          </ActionButton>
        </div>
      </div>
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Peças Cortadas</CardTitle>
            <Scissors className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPecasCortadas}</div>
            <p className="text-xs text-muted-foreground">
              Unidades cortadas para produção
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Fichas Criadas</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFichasCriadas}</div>
            <p className="text-xs text-muted-foreground">
              Fichas registradas no sistema
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Fichas Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalFichasConcluidas}</div>
            <p className="text-xs text-muted-foreground">
              Fichas já finalizadas
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Card de Rastreamento */}
      <Card>
        <CardHeader>
          <CardTitle>Rastreamento Geral</CardTitle>
          <p className="text-sm text-muted-foreground">
            Fluxo de trabalho e situação atual das fichas. Clique em um status para filtrar.
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row items-center justify-between py-4">
            <StatusTrackingCard 
              icon={<Clock className="h-10 w-10 text-amber-500" />}
              count={fichasAguardandoRetirada.length}
              label="Aguardando Retirada"
              className="bg-amber-50 border-amber-200 mb-4 md:mb-0 w-full md:w-1/4"
              onClick={() => handleAbrirPorStatus("aguardando-retirada")}
            />
            
            <div className="hidden md:flex items-center justify-center w-1/6">
              <MoveRight className="h-10 w-10 text-gray-800 font-bold stroke-2" />
            </div>
            
            <StatusTrackingCard 
              icon={<CircleDot className="h-10 w-10 text-blue-500" />}
              count={fichasEmProducao.length}
              label="Em Produção"
              className="bg-blue-50 border-blue-200 mb-4 md:mb-0 w-full md:w-1/4"
              onClick={() => handleAbrirPorStatus("em-producao")}
            />
            
            <div className="hidden md:flex items-center justify-center w-1/6">
              <MoveRight className="h-10 w-10 text-gray-800 font-bold stroke-2" />
            </div>
            
            <StatusTrackingCard 
              icon={<CheckCircle className="h-10 w-10 text-green-500" />}
              count={fichasConcluidas.length}
              label="Concluídas"
              className="bg-green-50 border-green-200 w-full md:w-1/4"
              onClick={() => handleAbrirPorStatus("concluido")}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Tabela de Fichas */}
      <DataTable 
        data={filteredData}
        columns={columns}
        isLoading={isLoading}
      />
      
      {/* Diálogo para confirmar exclusão */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Excluir Ficha"
        description={`Tem certeza que deseja excluir a ficha ${selectedFicha?.codigo}?`}
      />
      
      {/* Diálogo para confirmar conclusão */}
      <ConfirmDialog
        isOpen={isConcluirFichaDialogOpen}
        onClose={() => setIsConcluirFichaDialogOpen(false)}
        onConfirm={handleConcluirFicha}
        title="Concluir Ficha"
        description={`Tem certeza que deseja marcar a ficha ${selectedFicha?.codigo} como concluída?`}
      />
      
      {/* Modal de Movimentações */}
      <MovimentacaoModal
        isOpen={isMovimentacaoDialogOpen}
        onClose={() => setIsMovimentacaoDialogOpen(false)}
        ficha={selectedFicha}
        onMovimentacaoRegistrada={handleMovimentacaoRegistrada}
      />
      
      {/* Diálogo para editar ficha */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Ficha</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {fichaEditando && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="codigo" className="text-right">
                    Código
                  </label>
                  <Input
                    id="codigo"
                    value={fichaEditando.codigo}
                    onChange={(e) => setFichaEditando({...fichaEditando, codigo: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="banca" className="text-right">
                    Banca
                  </label>
                  <Input
                    id="banca"
                    value={fichaEditando.banca}
                    onChange={(e) => setFichaEditando({...fichaEditando, banca: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="produto" className="text-right">
                    Produto
                  </label>
                  <Input
                    id="produto"
                    value={fichaEditando.produto}
                    onChange={(e) => setFichaEditando({...fichaEditando, produto: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="cor" className="text-right">
                    Cor
                  </label>
                  <Input
                    id="cor"
                    value={fichaEditando.cor}
                    onChange={(e) => setFichaEditando({...fichaEditando, cor: e.target.value})}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="quantidade" className="text-right">
                    Quantidade
                  </label>
                  <Input
                    id="quantidade"
                    type="number"
                    value={fichaEditando.quantidade}
                    onChange={(e) => setFichaEditando({...fichaEditando, quantidade: parseInt(e.target.value) || 0})}
                    className="col-span-3"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <ActionButton 
              onClick={handleEdit} 
              isLoading={isLoading}
              loadingText="Salvando..."
            >
              Salvar
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Diálogo para nova ficha */}
      <Dialog open={isNovaFichaDialogOpen} onOpenChange={setIsNovaFichaDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Ficha</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="codigo" className="text-right">
                Código
              </label>
              <Input
                id="codigo"
                value={novaFicha.codigo}
                onChange={(e) => setNovaFicha({...novaFicha, codigo: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="banca" className="text-right">
                Banca
              </label>
              <Input
                id="banca"
                value={novaFicha.banca}
                onChange={(e) => setNovaFicha({...novaFicha, banca: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="produto" className="text-right">
                Produto
              </label>
              <Input
                id="produto"
                value={novaFicha.produto}
                onChange={(e) => setNovaFicha({...novaFicha, produto: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="cor" className="text-right">
                Cor
              </label>
              <Input
                id="cor"
                value={novaFicha.cor}
                onChange={(e) => setNovaFicha({...novaFicha, cor: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <label htmlFor="quantidade" className="text-right">
                Quantidade
              </label>
              <Input
                id="quantidade"
                type="number"
                value={novaFicha.quantidade || ""}
                onChange={(e) => setNovaFicha({...novaFicha, quantidade: parseInt(e.target.value) || 0})}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNovaFichaDialogOpen(false)}>
              Cancelar
            </Button>
            <ActionButton 
              onClick={handleCreateFicha} 
              isLoading={isLoading}
              loadingText="Criando..."
            >
              Criar
            </ActionButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 