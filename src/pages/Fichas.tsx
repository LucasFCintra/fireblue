import { useState, useEffect } from "react";
import { 
  Package, FileText, Download, Filter, Edit, Trash2, Plus, 
  Search, Loader2, Scissors, History, CheckCircle, Clock, CircleDot, Truck, MoveRight, Copy, AlertTriangle, MoreVertical 
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
import { RecebimentoParcialModal } from "@/components/fichas/RecebimentoParcialModal";
import { produtosService, Produto } from "@/services/produtosService";
import { RegistroPerdaModal } from "@/components/fichas/RegistroPerdaModal";

export default function Fichas() {
  const [searchQuery, setSearchQuery] = useState("");
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
        const response = await fetch(`http://26.203.75.236:8687/api/movimentacoes-fichas/${ficha.id}`);
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
      const response = await fetch('http://26.203.75.236:8687/api/fichas/summary/status');
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
    setProdutoSearchQuery("");
    setFichaEditando({...ficha});
    setIsEditDialogOpen(true);
  };
  
  // Função para lidar com a edição
  const handleEdit = async () => {
    if (!fichaEditando) return;
    
    try {
      setIsLoading(true);
      const fichaParaAtualizar = {
        ...fichaEditando,
        data_entrada: fichaEditando.data_entrada instanceof Date ? fichaEditando.data_entrada.toISOString() : fichaEditando.data_entrada,
        data_previsao: fichaEditando.data_previsao instanceof Date ? fichaEditando.data_previsao.toISOString() : fichaEditando.data_previsao,
        quantidade: Number(fichaEditando.quantidade)
      };
      const fichaAtualizada = await fichasService.atualizarFicha(fichaParaAtualizar);
      
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
    
    // Calcular a quantidade em produção (quantidade total menos quantidade já recebida)
    const quantidadeEmProducao = selectedFicha.quantidade - (selectedFicha.quantidade_recebida || 0);
    
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
      let fichas;
      
      if (status === "em_producao") {
        const response = await fetch('http://26.203.75.236:8687/api/fichas');
        const todasFichas = await response.json();
        fichas = todasFichas.filter(f => f.status === "em_producao");
      } else if (status === "recebido_parcialmente") {
        const response = await fetch('http://26.203.75.236:8687/api/fichas');
        const todasFichas = await response.json();
        fichas = todasFichas.filter(f => f.status === "em_producao" && f.quantidade_recebida > 0);
      } else {
        const response = await fetch(`http://26.203.75.236:8687/api/fichas/list/${status}`);
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
  const handleLimparFiltros = () => {
    carregarFichas();
    toast.success("Filtros limpos");
  };
  
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
      const response = await fetch('http://26.203.75.236:8687/api/fichas/summary/status');
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
        .reduce((total, f) => total + (f.quantidade - (f.quantidade_recebida || 0)), 0);
    }
    // Se estiver filtrado por em_producao, mostrar apenas os itens filtrados
    if (filtros.status === "em_producao") {
      return fichas
        .filter(f => f.status === "em_producao")
        .reduce((total, f) => total + (f.quantidade - (f.quantidade_recebida || 0)), 0);
    }
    // Para outros casos, mostrar o total de todos os itens em produção
    return todasFichas
      .filter(f => f.status === "em_producao")
      .reduce((total, f) => total + (f.quantidade - (f.quantidade_recebida || 0)), 0);
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
                  Em produção: {row.quantidade - (row.quantidade_recebida || 0)} unid.
                </div>
              )}
              {(row.quantidade_recebida > 0) && (
                <div>
                  Recebido: {row.quantidade_recebida} unid.
                </div>
              )}
            </div>
          )}
          {row.status === "concluido" && (
            <div className="text-sm text-gray-500 space-y-1">
              <div>
                Recebido: {row.quantidade_recebida} unid.
              </div>
              {perdasPorFicha[row.id] > 0 && (
                <div>
                  Perdas: {perdasPorFicha[row.id]} unid.
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
              className="hover:bg-purple-50 text-purple-600"
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
            className="hover:bg-blue-50 text-blue-600"
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
            className="hover:bg-indigo-50 text-indigo-600"
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
              className="hover:bg-yellow-50 text-yellow-600"
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
              className={row.status === "aguardando_retirada" ? "hover:bg-blue-50 text-blue-600" : "hover:bg-green-50 text-green-600"}
              title={row.status === "aguardando_retirada" ? "Iniciar Produção" : "Concluir Ficha"}
            >
              {row.status === "aguardando_retirada" ? <CircleDot className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hover:bg-red-50 text-red-500"
                title="Mais Ações"
              >
                <MoreVertical className="h-4 w-4" />
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
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Controle de Fichas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie fichas de produção e acompanhe o fluxo de trabalho
          </p>
        </div>
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
              className="bg-blue-600 hover:bg-blue-700"
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            Nova Ficha
          </ActionButton>
        </div>
      </div>
      
      {/* Cards de estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in duration-700">
        <Card className="border-blue-200 bg-blue-50 hover:shadow-md transition-all hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Total de Peças Cortadas</CardTitle>
            <Scissors className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{totalPecasCortadas}</div>
            <p className="text-xs text-blue-600">
              Unidades cortadas para produção
            </p>
          </CardContent>
        </Card>
        <Card className="border-purple-200 bg-purple-50 hover:shadow-md transition-all hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-800">Total de Fichas Criadas</CardTitle>
            <FileText className="h-5 w-5 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700">{totalFichasCriadas}</div>
            <p className="text-xs text-purple-600">
              Fichas registradas no sistema
            </p>
          </CardContent>
        </Card>
        <Card className="border-green-200 bg-green-50 hover:shadow-md transition-all hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-800">Total de Fichas Concluídas</CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700">{totalFichasConcluidas}</div>
            <p className="text-xs text-green-600">
              Fichas já finalizadas
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Card de Rastreamento */}
      <Card className="border hover:shadow-md transition-all animate-in fade-in duration-1000">
        <CardHeader className="bg-gray-50 border-b">
          <CardTitle className="text-gray-800">Rastreamento Geral</CardTitle>
          <p className="text-sm text-muted-foreground">
            Fluxo de trabalho e situação atual das fichas. Clique em um status para filtrar.
          </p>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between py-4">
            <StatusTrackingCard 
              icon={<Clock className="h-10 w-10 text-amber-500" />}
              count={String(statusSummary.aguardando_retirada)}
              label="Aguardando Retirada"
              sublabel={`${calcularQuantidadeAguardandoRetirada(filteredData)} itens`}
              className="bg-amber-50 border-amber-200 mb-4 md:mb-0 w-full md:w-1/4 cursor-pointer hover:bg-amber-100 transition-colors"
              onClick={() => handleAbrirPorStatus("aguardando_retirada")}
            />
            
            <div className="hidden md:flex items-center justify-center w-1/6">
              <MoveRight className="h-10 w-10 text-gray-800 font-bold stroke-2" />
            </div>
            
            <StatusTrackingCard 
              icon={<CircleDot className="h-10 w-10 text-blue-500" />}
              count={String(statusSummary.em_producao)}
              label="Em Produção"
              sublabel={`${calcularQuantidadeEmProducao(filteredData)} itens com bancas`}
              className="bg-blue-50 border-blue-200 mb-4 md:mb-0 w-full md:w-1/4 cursor-pointer hover:bg-blue-100 transition-colors"
              onClick={() => handleAbrirPorStatus("em_producao")}
            />
            
            <div className="hidden md:flex items-center justify-center w-1/6">
              <MoveRight className="h-10 w-10 text-gray-800 font-bold stroke-2" />
            </div>
            
            <StatusTrackingCard 
              icon={<Package className="h-10 w-10 text-yellow-500" />}
              count={String(todasFichas.filter(f => f.status === "em_producao" && f.quantidade_recebida > 0).length)}
              label="Recebido Parcialmente"
              sublabel={`${calcularQuantidadeRecebidaParcialmente(todasFichas)} itens recebidos`}
              className="bg-yellow-50 border-yellow-200 mb-4 md:mb-0 w-full md:w-1/4 cursor-pointer hover:bg-yellow-100 transition-colors"
              onClick={() => handleAbrirPorStatus("recebido_parcialmente")}
            />
            
            <div className="hidden md:flex items-center justify-center w-1/6">
              <MoveRight className="h-10 w-10 text-gray-800 font-bold stroke-2" />
            </div>
            
            <StatusTrackingCard 
              icon={<CheckCircle className="h-10 w-10 text-green-500" />}
              count={String(statusSummary.concluido)}
              label="Concluídas"
              sublabel={`${calcularQuantidadeConcluida(filteredData)} itens concluídos`}
              className="bg-green-50 border-green-200 w-full md:w-1/4 cursor-pointer hover:bg-green-100 transition-colors"
              onClick={() => handleAbrirPorStatus("concluido")}
            />
          </div>
        </CardContent>
      </Card>
      
      {/* Tabela de Fichas */}
      <div className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-all animate-in fade-in duration-1000">
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
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Ficha</DialogTitle>
            <DialogDescription>
              Edite os dados da ficha de produção.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {fichaEditando && (
              <>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="banca" className="text-right">
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
                  <Label htmlFor="produto_id" className="text-right">
                    Produto (ID)
                  </Label>
                  <Select
                    value={fichaEditando?.produto_id || ''}
                    onValueChange={(value) => setFichaEditando({ ...fichaEditando, produto_id: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione o produto pelo ID" />
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
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="cor" className="text-right">
                    Cor
                  </Label>
                  <Input
                    id="cor"
                    value={fichaEditando.cor}
                    onChange={(e) => setFichaEditando({ ...fichaEditando, cor: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="tamanho" className="text-right">
                    Tamanho
                  </Label>
                  <Select
                    value={fichaEditando.tamanho}
                    onValueChange={(value) => setFichaEditando({ ...fichaEditando, tamanho: value as "P" | "M" | "G" | "GG" })}
                  >
                    <SelectTrigger className="col-span-3">
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
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantidade" className="text-right">
                    Quantidade
                  </Label>
                  <Input
                    id="quantidade"
                    type="number"
                    value={fichaEditando.quantidade}
                    onChange={(e) => setFichaEditando({ ...fichaEditando, quantidade: parseInt(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="dataEntrada" className="text-right">
                    Data Entrada
                  </Label>
                  <Input
                    id="dataEntrada"
                    type="date"
                    value={fichaEditando.data_entrada instanceof Date ? fichaEditando.data_entrada.toISOString().split('T')[0] : fichaEditando.data_entrada}
                    onChange={(e) => setFichaEditando({ ...fichaEditando, data_entrada: new Date(e.target.value) })}
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
                    value={fichaEditando.data_previsao instanceof Date ? fichaEditando.data_previsao.toISOString().split('T')[0] : fichaEditando.data_previsao}
                    onChange={(e) => setFichaEditando({ ...fichaEditando, data_previsao: new Date(e.target.value) })}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="observacoes" className="text-right">
                    Observações
                  </Label>
                  <Textarea
                    id="observacoes"
                    value={fichaEditando.observacoes}
                    onChange={(e) => setFichaEditando({ ...fichaEditando, observacoes: e.target.value })}
                    className="col-span-3"
                  />
                </div>
              </>
            )}
          </div>
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={handleCloseEditDialog}>
              Cancelar
            </Button>
            <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
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
      
      {/* Modal de Nova Ficha */}
      <Dialog open={isNovaFichaDialogOpen} onOpenChange={handleCloseNovaFichaDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Nova Ficha</DialogTitle>
            <DialogDescription>
              Preencha os dados da nova ficha de produção.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
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
              <Label htmlFor="produto_id" className="text-right">
                Produto (ID)
              </Label>
              <Select
                value={novaFicha.produto_id || ''}
                onValueChange={(value) => setNovaFicha({ ...novaFicha, produto_id: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Selecione o produto pelo ID" />
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
              <Label htmlFor="tamanho" className="text-right">
                Tamanho
              </Label>
              <Select
                value={novaFicha.tamanho}
                onValueChange={(value) => setNovaFicha({ ...novaFicha, tamanho: value as "P" | "M" | "G" | "GG" })}
              >
                <SelectTrigger className="col-span-3">
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
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={handleCloseNovaFichaDialog}>
              Cancelar
            </Button>
            <Button onClick={handleCreateFicha} className="bg-blue-600 hover:bg-blue-700">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                "Criar Ficha"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 