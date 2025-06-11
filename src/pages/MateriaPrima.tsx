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
  
  // Estado para o formulário de nova bobina
  const [novaBobina, setNovaBobina] = useState<Omit<Bobina, 'id'>>({
    tipo_tecido: "",
    cor: "",
    lote: "",
    fornecedor: "",
    quantidade_total: 0,
    quantidade_disponivel: 0,
    unidade: "m",
    localizacao: "",
    data_entrada: new Date(),
    status: "Em Estoque",
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
      unidade: "m",
      localizacao: "",
      data_entrada: new Date(),
      status: "Em Estoque",
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
  
  // Carregar dados iniciais
  useEffect(() => {
    void carregarBobinas();
    void carregarEstoque();
  }, []);
  
  // Atualizar o estoque quando houver mudanças nas bobinas
  useEffect(() => {
    void carregarEstoque();
  }, [filteredData]);
  
  // Atualizado para usar a busca integrada do DataTable
  // O componente DataTable agora gerencia a pesquisa e chama onFilterChange
  
  // Função para lidar com a adição de uma nova bobina
  const handleAddBobina = () => {
    setIsNovaBobinaDialogOpen(true);
  };
  
  // Função para lidar com a exportação
  const handleExport = async (format: string) => {
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
  const handleOpenEditDialog = (bobina: Bobina) => {
    setBobinaEditando(bobina);
    setIsEditDialogOpen(true);
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
  const retornaEstoque = async () => {
    const estoque = await materiaPrimaService.retornaEstoque();
    

    console.log(estoque);
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
        
        if (row.status === "Em Estoque") {
          textColor = "text-green-700";
          bgColor = "bg-green-50";
          borderColor = "border-green-200";
        } else if (row.status === "Baixo Estoque") {
          textColor = "text-yellow-700";
          bgColor = "bg-yellow-50";
          borderColor = "border-yellow-200";
        } else if (row.status === "Sem Estoque") {
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
        
        if (row.status === "Em Estoque") {
          textColor = "text-green-700";
          bgColor = "bg-green-50";
        } else if (row.status === "Baixo Estoque") {
          textColor = "text-yellow-700";
          bgColor = "bg-yellow-50";
        } else if (row.status === "Sem Estoque") {
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
        if (row.status === "Baixo Estoque") color = "bg-yellow-100 text-yellow-800";
        if (row.status === "Sem Estoque") color = "bg-red-100 text-red-800";
        
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
        
        if (row.status === "Em Estoque") {
          iconColor = "text-green-600";
          borderColor = "border-green-200";
          bgHoverColor = "hover:bg-green-50";
        } else if (row.status === "Baixo Estoque") {
          iconColor = "text-yellow-600";
          borderColor = "border-yellow-200";
          bgHoverColor = "hover:bg-yellow-50";
        } else if (row.status === "Sem Estoque") {
          iconColor = "text-red-600";
          borderColor = "border-red-200";
          bgHoverColor = "hover:bg-red-50";
        }
        
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className={`${borderColor} ${bgHoverColor}`}
              onClick={() => handleOpenHistoricoDialog(row)}
            >
              <History className={`h-4 w-4 ${iconColor}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`${borderColor} ${bgHoverColor}`}
              onClick={() => handleOpenCorteDialog(row)}
            >
              <Scissors className={`h-4 w-4 ${iconColor}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`${borderColor} ${bgHoverColor}`}
              onClick={() => handleOpenEditDialog(row)}
            >
              <Pencil className={`h-4 w-4 ${iconColor}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className={`${borderColor} ${bgHoverColor}`}
              onClick={() => handleOpenDeleteDialog(row)}
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Controle de Bobinas</h1>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={handleOpenFilterDialog}>
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
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
            onClick={handleAddBobina}
          >
            Nova Bobina
          </ActionButton>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total de Bobinas</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{filteredData.length}</div>
            <p className="text-xs text-blue-600">
              Bobinas cadastradas no sistema
            </p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Bobinas com Estoque</CardTitle>
            <Package className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">
              {estoque.emEstoque.length}
            </div>
            <p className="text-xs text-green-600">
              Bobinas disponíveis para uso
            </p>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-yellow-800">Baixo Estoque</CardTitle>
            <Package className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-700">
              {estoque.baixoEstoque.length}
            </div>
            <p className="text-xs text-yellow-600">
              Bobinas com estoque baixo
            </p>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-800">Bobinas sem Estoque</CardTitle>
            <Package className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700">
              {estoque.semEstoque.length}
            </div>
            <p className="text-xs text-red-600">
              Bobinas que precisam de reposição
            </p>
          </CardContent>
        </Card>
      </div>

      <DataTable
        data={bobinasOriginais}
        columns={columns}
        searchable={true}
        pagination={true}
        isLoading={isLoading}
        onFilterChange={(filtered) => setFilteredData(filtered)}
      />

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
                  <Input
                    id="tipo_tecido"
                    value={novaBobina.tipo_tecido}
                    onChange={(e) => setNovaBobina({ ...novaBobina, tipo_tecido: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="cor">Cor</label>
                  <Input
                    id="cor"
                    value={novaBobina.cor}
                    onChange={(e) => setNovaBobina({ ...novaBobina, cor: e.target.value })}
                  />
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
                      <SelectItem value="m">Metros (m)</SelectItem>
                      <SelectItem value="kg">Quilogramas (kg)</SelectItem>
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
                  <Input
                    id="edit-tipo_tecido"
                    value={bobinaEditando.tipo_tecido}
                    onChange={(e) => setBobinaEditando({ ...bobinaEditando, tipo_tecido: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="edit-cor">Cor</label>
                  <Input
                    id="edit-cor"
                    value={bobinaEditando.cor}
                    onChange={(e) => setBobinaEditando({ ...bobinaEditando, cor: e.target.value })}
                  />
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
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a unidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="m">Metros (m)</SelectItem>
                      <SelectItem value="kg">Quilogramas (kg)</SelectItem>
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