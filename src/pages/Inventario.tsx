import { useState, useEffect } from "react";
import React from "react";
import { Package, FileText, Download, Upload, Filter, Edit, Trash2, Plus, Search, Loader2, MoreHorizontal, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import DataTable from "@/components/DataTable";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { ActionButton } from "@/components/ActionButton";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "@/components/ui/sonner";
import StatusCard from "@/components/StatusCard";
import { InventarioForm } from "@/components/forms/InventarioForm";
import { AjusteEstoqueForm } from "@/components/forms/AjusteEstoqueForm";
import { InventarioFiltros } from "@/components/InventarioFiltros";
import { InventarioDetalhes } from "@/components/InventarioDetalhes";
import { estoqueService, ItemEstoque } from "@/services/inventarioService";
import { useForm } from "react-hook-form"
import { Form } from "@/components/ui/form"

// Componente para a célula da imagem
const ImagemCell = ({ row }: { row: ItemEstoque }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="w-10 h-10 rounded-md overflow-hidden border border-input">
      {row.imagem_url && !imageError ? (
        <img 
          src={row.imagem_url} 
          alt={row.nome_produto}
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

export default function Estoque() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<ItemEstoque | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAjusteDialogOpen, setIsAjusteDialogOpen] = useState(false);
  const [isFiltrosOpen, setIsFiltrosOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false);
  const [estoqueItems, setEstoqueItems] = useState<ItemEstoque[]>([]);
  const [filteredData, setFilteredData] = useState<ItemEstoque[]>([]);
  const [activeFilters, setActiveFilters] = useState<any>(null);
  
  const form = useForm({
    // suas configurações do formulário aqui
  })
  
  // Carregar dados do estoque
  useEffect(() => {
    const carregarEstoque = async () => {
      setIsLoading(true);
      try {
        const items = await estoqueService.listarItens();
        setEstoqueItems(items);
        setFilteredData(items);
      } catch (error) {
        console.error("Erro ao carregar estoque:", error);
        toast.error("Erro ao carregar estoque");
      } finally {
        setIsLoading(false);
      }
    };

    carregarEstoque();
  }, []);
  
  // Calcular estatísticas de estoque
  const emEstoque = filteredData.filter(item => item.status === "ativo").length;
  const baixoEstoque = filteredData.filter(item => item.status === "baixo").length;
  const semEstoque = filteredData.filter(item => item.status === "inativo").length;
  
  // Atualizar os dados filtrados quando o estoque mudar
  useEffect(() => {
    if (activeFilters) {
      applyFilters(activeFilters);
    } else {
      setFilteredData(estoqueItems);
    }
  }, [estoqueItems, activeFilters]);
  
  // Função para lidar com a pesquisa
  const handleSearch = () => {
    setIsLoading(true);
    
    // Simulação de um atraso de carregamento
    setTimeout(() => {
      let filtered = estoqueItems;
      
      if (searchQuery.trim() !== "") {
        filtered = estoqueItems.filter(item =>
          item.nome_produto.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.fornecedor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.codigo_barras?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setFilteredData(filtered);
      setIsLoading(false);
      
      toast.success(`${filtered.length} item(s) encontrado(s)`);
    }, 500);
  };
  
  // Função para lidar com a adição de um novo item
  const handleAddItem = async (data: any) => {
    try {
      const novoItem = await estoqueService.criarItem(data);
      setEstoqueItems(prev => [...prev, novoItem]);
      toast.success("Item adicionado com sucesso!");
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error("Erro ao adicionar item:", error);
      toast.error("Erro ao adicionar item");
    }
  };
  
  // Função para lidar com a exportação
  const handleExport = (format: string) => {
    setIsLoading(true);
    
    // Simulação de um atraso de carregamento
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Dados exportados com sucesso em formato ${format}`);
    }, 1000);
  };
  
  // Função para lidar com a exclusão de um item
  const handleDeleteItem = async () => {
    if (!selectedRow?.id) return;
    
    try {
      await estoqueService.excluirItem(selectedRow.id);
      setEstoqueItems(prev => prev.filter(item => item.id !== selectedRow.id));
      toast.success("Item excluído com sucesso!");
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Erro ao excluir item:", error);
      toast.error("Erro ao excluir item");
    }
  };
  
  // Função para lidar com a edição de um item
  const handleEditItem = async (data: any) => {
    if (!selectedRow?.id) return;
    
    try {
      const itemAtualizado = await estoqueService.atualizarItem({
        ...data,
        id: selectedRow.id
      });
      
      setEstoqueItems(prev => 
        prev.map(item => item.id === selectedRow.id ? itemAtualizado : item)
      );
      
      toast.success("Item atualizado com sucesso!");
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast.error("Erro ao atualizar item");
    }
  };
  
  // Função para lidar com o ajuste de estoque
  const handleAjusteEstoque = async (data: any) => {
    setIsLoading(true);
    
    // Simulação de um atraso de carregamento
    setTimeout(() => {
      // Em uma implementação real, aqui faríamos uma chamada para a API
      setEstoqueItems(prev => 
        prev.map(item => 
          item.id === data.id 
            ? { ...item, quantidade: data.novaQuantidade, status: data.novoStatus } 
            : item
        )
      );
      
      setIsLoading(false);
      setIsAjusteDialogOpen(false);
      
      // Escolher uma mensagem com base no tipo de ajuste
      let mensagem = "";
      switch (data.tipoAjuste) {
        case "entrada":
          mensagem = `Entrada de ${data.quantidade} unidades registrada para ${selectedRow.nome_produto}`;
          break;
        case "saida":
          mensagem = `Saída de ${data.quantidade} unidades registrada para ${selectedRow.nome_produto}`;
          break;
        case "ajuste":
        case "estoque":
          mensagem = `Estoque ajustado para ${data.novaQuantidade} unidades para ${selectedRow.nome_produto}`;
          break;
      }
      
      toast.success(mensagem);
    }, 1000);
  };
  
  // Função para aplicar filtros avançados
  const applyFilters = (filters: any) => {
    setIsLoading(true);
    
    // Salvar os filtros ativos
    setActiveFilters(filters);
    
    setTimeout(() => {
      let filtered = [...estoqueItems];
      
      // Filtrar por categorias
      if (filters.categorias && filters.categorias.length > 0) {
        filtered = filtered.filter(item => filters.categorias.includes(item.categoria));
      }
      
      // Filtrar por status
      if (filters.status && filters.status.length > 0) {
        filtered = filtered.filter(item => filters.status.includes(item.status));
      }
      
      // Filtrar por valor
      if (filters.valorMinimo !== undefined && filters.valorMaximo !== undefined) {
        filtered = filtered.filter(item => 
          (item.preco_unitario || 0) >= filters.valorMinimo && 
          (item.preco_unitario || 0) <= filters.valorMaximo
        );
      }
      
      // Filtrar por estoque
      if (filters.estoqueMinimo !== undefined && filters.estoqueMaximo !== undefined) {
        filtered = filtered.filter(item => 
          item.quantidade >= filters.estoqueMinimo && 
          item.quantidade <= filters.estoqueMaximo
        );
      }
      
      // Filtrar por localização
      if (filters.localizacoes && filters.localizacoes.length > 0) {
        filtered = filtered.filter(item => filters.localizacoes.includes(item.localizacao));
      }
      
      // Filtrar por fornecedor
      if (filters.fornecedores && filters.fornecedores.length > 0) {
        filtered = filtered.filter(item => filters.fornecedores.includes(item.fornecedor));
      }
      
      // Exibir sem estoque
      if (filters.exibirSemEstoque === false) {
        filtered = filtered.filter(item => item.quantidade > 0);
      }
      
      // Ordenação
      if (filters.ordenacao) {
        switch (filters.ordenacao) {
          case "produto_asc":
            filtered.sort((a, b) => a.nome_produto.localeCompare(b.nome_produto));
            break;
          case "produto_desc":
            filtered.sort((a, b) => b.nome_produto.localeCompare(a.nome_produto));
            break;
          case "valor_asc":
            filtered.sort((a, b) => a.preco_unitario - b.preco_unitario);
            break;
          case "valor_desc":
            filtered.sort((a, b) => b.preco_unitario - a.preco_unitario);
            break;
          case "estoque_asc":
            filtered.sort((a, b) => a.quantidade - b.quantidade);
            break;
          case "estoque_desc":
            filtered.sort((a, b) => b.quantidade - a.quantidade);
            break;
          case "categoria":
            filtered.sort((a, b) => a.categoria.localeCompare(b.categoria));
            break;
          case "status":
            filtered.sort((a, b) => a.status.localeCompare(b.status));
            break;
        }
      }
      
      setFilteredData(filtered);
      setIsLoading(false);
      
      toast.success(`${filtered.length} item(s) encontrado(s) com os filtros aplicados`);
    }, 300);
  };
  
  // Colunas para a tabela de estoque
  const columns = [
    { 
      accessor: "imagem_url",
      header: "",
      cell: (row: ItemEstoque) => <ImagemCell row={row} />
    },
    { 
      accessor: "nome",
      header: "Produto",
      cell: (row: ItemEstoque) => {
        return (
          <div className="flex items-center gap-3">
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{row.nome_produto}</span>
              <span className="text-sm text-gray-500">{row.codigo_barras}</span>
            </div>
          </div>
        );
      }
    },
    { accessor: "sku", header: "SKU" },
    { accessor: "categoria", header: "Categoria" },
    { 
      accessor: "quantidade", 
      header: "Quantidade",
      cell: (row: ItemEstoque) => {
        return (
          <div className="flex flex-col">
            <span className="font-medium">{row.quantidade}</span>
            <span className="text-sm text-gray-500">{row.unidade}</span>
          </div>
        );
      }
    },
    { 
      accessor: "preco_unitario", 
      header: "Valor Unitário",
      cell: (row: ItemEstoque) => {
        const valor = Number(row.preco_unitario) || 0;
        return (
          <span className="font-medium">
            R$ {valor.toFixed(2)}
          </span>
        );
      }
    },
    { accessor: "localizacao", header: "Localização" },
    { 
      accessor: "status", 
      header: "Status",
      cell: (row: ItemEstoque) => {
        let color = "bg-green-100 text-green-800";
        if (row.status === "baixo") color = "bg-yellow-100 text-yellow-800";
        if (row.status === "inativo") color = "bg-red-100 text-red-800";
        
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${color}`}>
            {row.status === "ativo" ? "Em Estoque" : 
             row.status === "baixo" ? "Baixo Estoque" : 
             "Sem Estoque"}
          </span>
        );
      }
    },
    { accessor: "fornecedor", header: "Fornecedor" },
    { 
      accessor: "data_entrada", 
      header: "Data de Entrada",
      cell: (row: ItemEstoque) => {
        return row.data_entrada ? new Date(row.data_entrada).toLocaleDateString() : "Não informado";
      }
    },
    {
      accessor: (row) => "ações",
      header: "Ações",
      cell: (row: any) => {
        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedRow(row);
                setIsDetalhesOpen(true);
              }}
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedRow(row);
                setIsEditDialogOpen(true);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedRow(row);
                setIsAjusteDialogOpen(true);
              }}
            >
              <Package className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setSelectedRow(row);
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      }
    }
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Estoque</h1>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <FileText className="w-4 h-4 mr-2" />
                Exportar
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
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <Download className="w-4 h-4 mr-2" />
                CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                Relatórios
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => toast.info("Relatório de Estoque será implementado")}>
                <Package className="w-4 h-4 mr-2" />
                Relatório de Estoque
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Relatório de Movimentações será implementado")}>
                <Upload className="w-4 h-4 mr-2" />
                Movimentações
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toast.info("Relatório de Valorizações será implementado")}>
                <FileText className="w-4 h-4 mr-2" />
                Valorização
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ActionButton
            size="sm"
            startIcon={<Plus className="h-4 w-4" />}
            onClick={() => setIsAddDialogOpen(true)}
          >
            Novo Item
          </ActionButton>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatusCard
          title="Total de Itens"
          value={filteredData.length}
          description="Itens cadastrados no sistema"
          icon={<Package className="h-4 w-4" />}
          className="border-blue-200 bg-blue-50"
          animated={true}
        />
        <StatusCard
          title="Em Estoque"
          value={emEstoque}
          description="Itens disponíveis para uso"
          icon={<Package className="h-4 w-4" />}
          className="border-green-200 bg-green-50"
          animated={true}
        />
        <StatusCard
          title="Baixo Estoque"
          value={baixoEstoque}
          description="Itens com estoque baixo"
          icon={<Package className="h-4 w-4" />}
          className="border-yellow-200 bg-yellow-50"
          animated={true}
        />
        <StatusCard
          title="Sem Estoque"
          value={semEstoque}
          description="Itens que precisam de reposição"
          icon={<Package className="h-4 w-4" />}
          className="border-red-200 bg-red-50"
          animated={true}
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por produto, SKU, código de barras ou fornecedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
        </div>
        <Button variant="outline" onClick={handleSearch} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Buscando...
            </>
          ) : (
            "Buscar"
          )}
        </Button>
        <Button 
          variant="outline" 
          onClick={() => setIsFiltrosOpen(true)}
        >
          <Filter className="mr-2 h-4 w-4" />
          Filtros
          {activeFilters && (
            <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full h-5 w-5 flex items-center justify-center">
              {Object.keys(activeFilters).filter(key => 
                Array.isArray(activeFilters[key]) 
                  ? activeFilters[key].length > 0 
                  : activeFilters[key] !== undefined
              ).length}
            </span>
          )}
        </Button>
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        searchable={false}
        pagination={true}
        isLoading={isLoading}
      />
      
      {/* Diálogo de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteItem}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir o produto "${selectedRow?.nome_produto}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
      
      {/* Formulário de adição de item */}
      {isAddDialogOpen && (
        <Form {...form}>
          <InventarioForm 
            isOpen={isAddDialogOpen}
            onClose={() => setIsAddDialogOpen(false)}
            onSubmit={handleAddItem}
            title="Cadastrar Novo Item"
            mode="create"
          />
        </Form>
      )}
      
      {/* Formulário de edição de item */}
      {isEditDialogOpen && selectedRow && (
        <Form {...form}>
          <InventarioForm 
            isOpen={isEditDialogOpen}
            onClose={() => setIsEditDialogOpen(false)}
            onSubmit={handleEditItem}
            itemData={selectedRow}
            title="Editar Item"
            mode="edit"
          />
        </Form>
      )}
      
      {/* Formulário de ajuste de estoque */}
      {isAjusteDialogOpen && selectedRow && (
        <AjusteEstoqueForm 
          isOpen={isAjusteDialogOpen}
          onClose={() => setIsAjusteDialogOpen(false)}
          onSubmit={handleAjusteEstoque}
          item={selectedRow}
        />
      )}
      
      {/* Visualização detalhada do produto */}
      {isDetalhesOpen && selectedRow && (
        <InventarioDetalhes
          isOpen={isDetalhesOpen}
          onClose={() => setIsDetalhesOpen(false)}
          item={selectedRow}
          onEdit={() => {
            setIsDetalhesOpen(false);
            setIsEditDialogOpen(true);
          }}
          onDelete={() => {
            setIsDetalhesOpen(false);
            setIsDeleteDialogOpen(true);
          }}
          onAjusteEstoque={() => {
            setIsDetalhesOpen(false);
            setIsAjusteDialogOpen(true);
          }}
        />
      )}
      
      {/* Painel de filtros */}
      <InventarioFiltros 
        isOpen={isFiltrosOpen}
        onClose={() => setIsFiltrosOpen(false)}
        onApplyFilters={applyFilters}
        initialFilters={activeFilters}
        itemsCount={filteredData.length}
      />
    </div>
  );
}
