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

export default function Fichas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFicha, setSelectedFicha] = useState<Ficha | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isMovimentacaoDialogOpen, setIsMovimentacaoDialogOpen] = useState(false);
  const [isConcluirFichaDialogOpen, setIsConcluirFichaDialogOpen] = useState(false);
  const [isNovaFichaDialogOpen, setIsNovaFichaDialogOpen] = useState(false);
  const [filteredData, setFilteredData] = useState<Ficha[]>([]);
  const [statusSummary, setStatusSummary] = useState({
    'aguardando_retirada': 0,
    'em_producao': 0,
    'concluido': 0
  });
  
  // Estado para nova ficha
  const [novaFicha, setNovaFicha] = useState<Omit<Ficha, 'id'>>({
    codigo: "",
    banca: "",
    data_entrada: new Date(),
    data_previsao: new Date(),
    quantidade: 0,
    status: "aguardando_retirada",
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
  
  // Estado para bancas
  const [bancas, setBancas] = useState<Banca[]>([]);
  
  // Estatísticas
  const totalPecasCortadas = filteredData.reduce((total, ficha) => total + ficha.quantidade, 0);
  const totalFichasCriadas = filteredData.length;
  const totalFichasConcluidas = filteredData.filter(ficha => ficha.status === "concluido").length;
  
  // Estado para filtrar bancas
  const [bancaSearchQuery, setBancaSearchQuery] = useState("");
  
  // Função para carregar as fichas
  const carregarFichas = async () => {
    try {
      setIsLoading(true);
      const fichas = await fichasService.listarFichas();
      setFilteredData(fichas);
      
      // Carregar resumo de status
      const response = await fetch('http://26.203.75.236:8687/api/fichas/summary/status');
      const summary = await response.json();
      setStatusSummary(summary);
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
  
  // Carregar dados iniciais
  useEffect(() => {
    void carregarFichas();
    void carregarBancas();
  }, []);
  
  // Função para lidar com a pesquisa
  const handleSearch = () => {
    if (!searchQuery.trim()) {
      carregarFichas();
      return;
    }
    
    const filtrado = filteredData.filter(ficha => 
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
      await fichasService.excluirFicha(selectedFicha.id);
      
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
    setBancaSearchQuery("");
    setFichaEditando({...ficha});
    setIsEditDialogOpen(true);
  };
  
  // Função para lidar com a edição
  const handleEdit = async () => {
    if (!fichaEditando) return;
    
    try {
      setIsLoading(true);
      const fichaAtualizada = await fichasService.atualizarFicha(fichaEditando);
      
      const novaLista = filteredData.map(ficha => 
        ficha.id === fichaAtualizada.id ? fichaAtualizada : ficha
      );
      setFilteredData(novaLista);
      
      setIsEditDialogOpen(false);
      setFichaEditando(null);
      toast.success(`Ficha ${fichaAtualizada.codigo} atualizada com sucesso`);
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
      await fichasService.registrarMovimentacao(
        selectedFicha.id,
        "Conclusão",
        selectedFicha.quantidade,
        "Conclusão da produção",
        "Sistema"
      );
      
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
    setIsNovaFichaDialogOpen(true);
  };
  
  // Função para lidar com a criação de uma nova ficha
  const handleCreateFicha = async () => {
    try {
      setIsLoading(true);
      const fichaParaCriar = {
        ...novaFicha,
        data_entrada: novaFicha.data_entrada instanceof Date ? novaFicha.data_entrada.toISOString() : novaFicha.data_entrada,
        data_previsao: novaFicha.data_previsao instanceof Date ? novaFicha.data_previsao.toISOString() : novaFicha.data_previsao
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
        status: "aguardando_retirada",
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
  
  // Função para abrir por status
  const handleAbrirPorStatus = async (status: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`http://26.203.75.236:8687/api/fichas/list/${status}`);
      const fichas = await response.json();
      setFilteredData(fichas);
      toast.success(`${fichas.length} ficha(s) encontrada(s) no status ${status}`);
    } catch (error) {
      toast.error("Erro ao carregar fichas por status");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para limpar filtros
  const handleLimparFiltros = () => {
    carregarFichas();
    toast.success("Filtros limpos");
  };
  
  // Função para filtrar bancas
  const filteredBancas = bancas.filter(banca => 
    banca.nome.toLowerCase().includes(bancaSearchQuery.toLowerCase())
  );
  
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
        <span>{row.quantidade} unid.</span>
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
        
        return (
          <Badge variant={variant as any}
            className={row.status === "aguardando_retirada" ? "bg-amber-50 text-amber-500 border-amber-200 hover:bg-amber-50" : ""}
          >
            {row.status === "aguardando_retirada" ? "Aguardando Retirada" : 
             row.status === "em_producao" ? "Em Produção" : 
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
  
  // Função para fechar o modal de edição
  const handleCloseEditDialog = () => {
    setBancaSearchQuery("");
    setIsEditDialogOpen(false);
  };

  // Função para fechar o modal de nova ficha
  const handleCloseNovaFichaDialog = () => {
    setBancaSearchQuery("");
    setIsNovaFichaDialogOpen(false);
  };
  
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLimparFiltros}
            >
              Limpar Filtros
            </Button>
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
              count={statusSummary.aguardando_retirada}
              label="Aguardando Retirada"
              className="bg-amber-50 border-amber-200 mb-4 md:mb-0 w-full md:w-1/4 cursor-pointer hover:bg-amber-100 transition-colors"
              onClick={() => handleAbrirPorStatus("aguardando_retirada")}
            />
            
            <div className="hidden md:flex items-center justify-center w-1/6">
              <MoveRight className="h-10 w-10 text-gray-800 font-bold stroke-2" />
            </div>
            
            <StatusTrackingCard 
              icon={<CircleDot className="h-10 w-10 text-blue-500" />}
              count={statusSummary.em_producao}
              label="Em Produção"
              className="bg-blue-50 border-blue-200 mb-4 md:mb-0 w-full md:w-1/4 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => handleAbrirPorStatus("em_producao")}
            />
            
            <div className="hidden md:flex items-center justify-center w-1/6">
              <MoveRight className="h-10 w-10 text-gray-800 font-bold stroke-2" />
            </div>
            
            <StatusTrackingCard 
              icon={<CheckCircle className="h-10 w-10 text-green-500" />}
              count={statusSummary.concluido}
              label="Concluídas"
              className="bg-green-50 border-green-200 w-full md:w-1/4 cursor-pointer hover:bg-green-100 transition-colors"
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
        description={selectedFicha ? `Tem certeza que deseja excluir a ficha ${selectedFicha.codigo}?` : "Tem certeza que deseja excluir esta ficha?"}
      />
      
      {/* Diálogo para confirmar conclusão */}
      <ConfirmDialog
        isOpen={isConcluirFichaDialogOpen}
        onClose={() => setIsConcluirFichaDialogOpen(false)}
        onConfirm={handleConcluirFicha}
        title="Concluir Ficha"
        description={selectedFicha ? `Tem certeza que deseja marcar a ficha ${selectedFicha.codigo} como concluída?` : "Tem certeza que deseja marcar esta ficha como concluída?"}
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
      
      {/* Modal de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={handleCloseEditDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Ficha</DialogTitle>
            <DialogDescription>
              Atualize os dados da ficha
            </DialogDescription>
          </DialogHeader>
          {fichaEditando && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-codigo" className="text-right">
                  Código
                </Label>
                <Input
                  id="edit-codigo"
                  value={fichaEditando.codigo}
                  onChange={(e) => setFichaEditando({ ...fichaEditando, codigo: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-banca" className="text-right">
                  Banca
                </Label>
                <Select
                  value={fichaEditando.banca}
                  onValueChange={(value) => setFichaEditando({ ...fichaEditando, banca: value })}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Selecione uma banca" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 pb-2">
                      <Input
                        placeholder="Buscar banca..."
                        value={bancaSearchQuery}
                        onChange={(e) => setBancaSearchQuery(e.target.value)}
                        className="h-8"
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
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-dataEntrada" className="text-right">
                  Data Entrada
                </Label>
                <Input
                  id="edit-dataEntrada"
                  type="date"
                  value={fichaEditando.data_entrada instanceof Date ? fichaEditando.data_entrada.toISOString().split('T')[0] : fichaEditando.data_entrada}
                  onChange={(e) => setFichaEditando({ ...fichaEditando, data_entrada: new Date(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-dataPrevisao" className="text-right">
                  Previsão
                </Label>
                <Input
                  id="edit-dataPrevisao"
                  type="date"
                  value={fichaEditando.data_previsao instanceof Date ? fichaEditando.data_previsao.toISOString().split('T')[0] : fichaEditando.data_previsao}
                  onChange={(e) => setFichaEditando({ ...fichaEditando, data_previsao: new Date(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-quantidade" className="text-right">
                  Quantidade
                </Label>
                <Input
                  id="edit-quantidade"
                  type="number"
                  value={fichaEditando.quantidade}
                  onChange={(e) => setFichaEditando({ ...fichaEditando, quantidade: parseInt(e.target.value) })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-produto" className="text-right">
                  Produto
                </Label>
                <Input
                  id="edit-produto"
                  value={fichaEditando.produto}
                  onChange={(e) => setFichaEditando({ ...fichaEditando, produto: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-cor" className="text-right">
                  Cor
                </Label>
                <Input
                  id="edit-cor"
                  value={fichaEditando.cor}
                  onChange={(e) => setFichaEditando({ ...fichaEditando, cor: e.target.value })}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-observacoes" className="text-right">
                  Observações
                </Label>
                <Textarea
                  id="edit-observacoes"
                  value={fichaEditando.observacoes}
                  onChange={(e) => setFichaEditando({ ...fichaEditando, observacoes: e.target.value })}
                  className="col-span-3"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditDialog}>
              Cancelar
            </Button>
            <Button onClick={handleEdit}>Salvar Alterações</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Modal de Nova Ficha */}
      <Dialog open={isNovaFichaDialogOpen} onOpenChange={handleCloseNovaFichaDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Ficha</DialogTitle>
            <DialogDescription>
              Preencha os dados da nova ficha
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codigo" className="text-right">
                Código
              </Label>
              <Input
                id="codigo"
                value={novaFicha.codigo}
                onChange={(e) => setNovaFicha({ ...novaFicha, codigo: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="banca" className="text-right">
                Banca
              </Label>
              <Select
                value={novaFicha.banca}
                onValueChange={(value) => setNovaFicha({ ...novaFicha, banca: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione uma banca" />
                </SelectTrigger>
                <SelectContent>
                  <div className="px-2 pb-2">
                    <Input
                      placeholder="Buscar banca..."
                      value={bancaSearchQuery}
                      onChange={(e) => setBancaSearchQuery(e.target.value)}
                      className="h-8"
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
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dataEntrada" className="text-right">
                Data Entrada
              </Label>
              <Input
                id="dataEntrada"
                type="date"
                value={novaFicha.data_entrada instanceof Date ? novaFicha.data_entrada.toISOString().split('T')[0] : novaFicha.data_entrada}
                onChange={(e) => setNovaFicha({ ...novaFicha, data_entrada: new Date(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dataPrevisao" className="text-right">
                Previsão
              </Label>
              <Input
                id="dataPrevisao"
                type="date"
                value={novaFicha.data_previsao instanceof Date ? novaFicha.data_previsao.toISOString().split('T')[0] : novaFicha.data_previsao}
                onChange={(e) => setNovaFicha({ ...novaFicha, data_previsao: new Date(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="quantidade" className="text-right">
                Quantidade
              </Label>
              <Input
                id="quantidade"
                type="number"
                value={novaFicha.quantidade}
                onChange={(e) => setNovaFicha({ ...novaFicha, quantidade: parseInt(e.target.value) })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="produto" className="text-right">
                Produto
              </Label>
              <Input
                id="produto"
                value={novaFicha.produto}
                onChange={(e) => setNovaFicha({ ...novaFicha, produto: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cor" className="text-right">
                Cor
              </Label>
              <Input
                id="cor"
                value={novaFicha.cor}
                onChange={(e) => setNovaFicha({ ...novaFicha, cor: e.target.value })}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="observacoes" className="text-right">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={novaFicha.observacoes}
                onChange={(e) => setNovaFicha({ ...novaFicha, observacoes: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseNovaFichaDialog}>
              Cancelar
            </Button>
            <Button onClick={handleCreateFicha}>Criar Ficha</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 