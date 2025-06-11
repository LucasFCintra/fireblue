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

// Dados fictícios para a tabela de inventário
const inventarioData = [
  {
    id: "INV001",
    produto: "Laptop Dell XPS 13",
    sku: "DELL-XPS13",
    categoria: "Eletrônicos",
    quantidade: 25,
    valorUnitario: 8999.90,
    localizacao: "Prateleira A1",
    status: "Em Estoque",
    fornecedor: "Dell",
    codigoBarras: "7891234567890",
    unidadeMedida: "Unidade",
    estoqueMinimo: 5,
    descricao: "Laptop de alta performance para uso profissional",
    dataCadastro: "2023-05-10",
    dataUltimaAtualizacao: "2023-08-15",
    imagemUrl: "https://placehold.co/500x500/e2e8f0/1e293b?text=Laptop+Dell",
  },
  {
    id: "INV002",
    produto: "Monitor Samsung 24\"",
    sku: "SAM-M24",
    categoria: "Eletrônicos",
    quantidade: 42,
    valorUnitario: 1299.90,
    localizacao: "Prateleira B3",
    status: "Em Estoque",
    fornecedor: "Samsung",
    codigoBarras: "7897654321234",
    unidadeMedida: "Unidade",
    estoqueMinimo: 10,
    descricao: "Monitor LED Full HD de 24 polegadas",
    dataCadastro: "2023-04-15",
    dataUltimaAtualizacao: "2023-07-20",
    imagemUrl: "https://placehold.co/500x500/e2e8f0/1e293b?text=Monitor+Samsung",
  },
  {
    id: "INV003",
    produto: "Teclado Mecânico Logitech",
    sku: "LOG-TEC1",
    categoria: "Periféricos",
    quantidade: 15,
    valorUnitario: 499.90,
    localizacao: "Prateleira C2",
    status: "Baixo Estoque",
    fornecedor: "Logitech",
    codigoBarras: "7891234567891",
    unidadeMedida: "Unidade",
    estoqueMinimo: 15,
    descricao: "Teclado mecânico RGB com switches Cherry MX",
    dataCadastro: "2023-03-25",
    dataUltimaAtualizacao: "2023-08-05",
    imagemUrl: "https://placehold.co/500x500/e2e8f0/1e293b?text=Teclado+Logitech",
  },
  {
    id: "INV004",
    produto: "Mouse Sem Fio Microsoft",
    sku: "MS-M100",
    categoria: "Periféricos",
    quantidade: 52,
    valorUnitario: 149.90,
    localizacao: "Prateleira C4",
    status: "Em Estoque",
    fornecedor: "Microsoft",
    codigoBarras: "7897654321235",
    unidadeMedida: "Unidade",
    estoqueMinimo: 20,
    descricao: "Mouse sem fio ergonômico",
    dataCadastro: "2023-02-18",
    dataUltimaAtualizacao: "2023-06-10",
    imagemUrl: "https://placehold.co/500x500/e2e8f0/1e293b?text=Mouse+Microsoft",
  },
  {
    id: "INV005",
    produto: "Fone de Ouvido Sony",
    sku: "SONY-FO200",
    categoria: "Áudio",
    quantidade: 0,
    valorUnitario: 599.90,
    localizacao: "Prateleira D1",
    status: "Sem Estoque",
    fornecedor: "Sony",
    codigoBarras: "7891234567892",
    unidadeMedida: "Unidade",
    estoqueMinimo: 10,
    descricao: "Fone de ouvido com cancelamento de ruído",
    dataCadastro: "2023-01-30",
    dataUltimaAtualizacao: "2023-07-15",
    imagemUrl: "https://placehold.co/500x500/e2e8f0/1e293b?text=Fone+Sony",
  },
  {
    id: "INV006",
    produto: "Carregador USB-C",
    sku: "CHRG-USBC",
    categoria: "Acessórios",
    quantidade: 8,
    valorUnitario: 89.90,
    localizacao: "Prateleira E2",
    status: "Baixo Estoque",
    fornecedor: "Outros",
    codigoBarras: "7897654321236",
    unidadeMedida: "Unidade",
    estoqueMinimo: 15,
    descricao: "Carregador rápido USB-C 20W",
    dataCadastro: "2023-03-05",
    dataUltimaAtualizacao: "2023-08-01",
    imagemUrl: "https://placehold.co/500x500/e2e8f0/1e293b?text=Carregador+USB-C",
  },
  {
    id: "INV007",
    produto: "Câmera Canon EOS",
    sku: "CANON-EOS",
    categoria: "Fotografia",
    quantidade: 12,
    valorUnitario: 3999.90,
    localizacao: "Prateleira F1",
    status: "Em Estoque",
    fornecedor: "Canon",
    codigoBarras: "7891234567893",
    unidadeMedida: "Unidade",
    estoqueMinimo: 5,
    descricao: "Câmera digital profissional DSLR",
    dataCadastro: "2023-04-20",
    dataUltimaAtualizacao: "2023-08-10",
    imagemUrl: "https://placehold.co/500x500/e2e8f0/1e293b?text=Camera+Canon",
  },
];

export default function Inventario() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAjusteDialogOpen, setIsAjusteDialogOpen] = useState(false);
  const [isFiltrosOpen, setIsFiltrosOpen] = useState(false);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isDetalhesOpen, setIsDetalhesOpen] = useState(false);
  const [inventarioItems, setInventarioItems] = useState(inventarioData);
  const [filteredData, setFilteredData] = useState(inventarioItems);
  const [activeFilters, setActiveFilters] = useState<any>(null);
  
  // Calcular estatísticas de estoque
  const emEstoque = filteredData.filter(item => item.status === "Em Estoque").length;
  const baixoEstoque = filteredData.filter(item => item.status === "Baixo Estoque").length;
  const semEstoque = filteredData.filter(item => item.status === "Sem Estoque").length;
  
  // Atualizar os dados filtrados quando o inventário mudar
  useEffect(() => {
    if (activeFilters) {
      applyFilters(activeFilters);
    } else {
      setFilteredData(inventarioItems);
    }
  }, [inventarioItems, activeFilters]);
  
  // Função para lidar com a pesquisa
  const handleSearch = () => {
    setIsLoading(true);
    
    // Simulação de um atraso de carregamento
    setTimeout(() => {
      let filtered = inventarioItems;
      
      if (searchQuery.trim() !== "") {
        filtered = inventarioItems.filter(item =>
          item.produto.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.fornecedor?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.codigoBarras?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      setFilteredData(filtered);
      setIsLoading(false);
      
      toast.success(`${filtered.length} item(s) encontrado(s)`);
    }, 500);
  };
  
  // Função para lidar com a adição de um novo item
  const handleAddItem = () => {
    setIsAddDialogOpen(true);
  };
  
  // Função para salvar um novo item
  const handleSaveItem = async (data: any) => {
    setIsLoading(true);
    
    // Simulação de um atraso de carregamento
    setTimeout(() => {
      // Em uma implementação real, aqui faríamos uma chamada para a API
      const newItem = {
        ...data,
      };
      
      // Adicionar o novo item ao array de dados
      setInventarioItems(prev => [newItem, ...prev]);
      
      setIsLoading(false);
      toast.success(`Item ${data.produto} adicionado com sucesso`);
    }, 1000);
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
  const handleDelete = () => {
    setIsLoading(true);
    
    // Simulação de um atraso de carregamento
    setTimeout(() => {
      // Em uma implementação real, aqui faríamos uma chamada para a API
      setInventarioItems(prev => prev.filter(item => item.id !== selectedRow.id));
      
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      toast.success(`Item ${selectedRow.produto} removido com sucesso`);
    }, 1000);
  };
  
  // Função para lidar com a edição de um item
  const handleEdit = async (data: any) => {
    setIsLoading(true);
    
    // Simulação de um atraso de carregamento
    setTimeout(() => {
      // Em uma implementação real, aqui faríamos uma chamada para a API
      setInventarioItems(prev => 
        prev.map(item => item.id === data.id ? { ...data } : item)
      );
      
      setIsLoading(false);
      setIsEditDialogOpen(false);
      toast.success(`Item ${data.produto} atualizado com sucesso`);
    }, 1000);
  };
  
  // Função para lidar com o ajuste de estoque
  const handleAjusteEstoque = async (data: any) => {
    setIsLoading(true);
    
    // Simulação de um atraso de carregamento
    setTimeout(() => {
      // Em uma implementação real, aqui faríamos uma chamada para a API
      setInventarioItems(prev => 
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
          mensagem = `Entrada de ${data.quantidade} unidades registrada para ${selectedRow.produto}`;
          break;
        case "saida":
          mensagem = `Saída de ${data.quantidade} unidades registrada para ${selectedRow.produto}`;
          break;
        case "ajuste":
        case "inventario":
          mensagem = `Estoque ajustado para ${data.novaQuantidade} unidades para ${selectedRow.produto}`;
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
      let filtered = [...inventarioItems];
      
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
          item.valorUnitario >= filters.valorMinimo && 
          item.valorUnitario <= filters.valorMaximo
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
            filtered.sort((a, b) => a.produto.localeCompare(b.produto));
            break;
          case "produto_desc":
            filtered.sort((a, b) => b.produto.localeCompare(a.produto));
            break;
          case "valor_asc":
            filtered.sort((a, b) => a.valorUnitario - b.valorUnitario);
            break;
          case "valor_desc":
            filtered.sort((a, b) => b.valorUnitario - a.valorUnitario);
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
    }, 800);
  };
  
  // Colunas para a tabela de inventário
  const columns = [
    { accessor: "id", header: "ID" },
    { accessor: "produto", header: "Produto" },
    { accessor: "sku", header: "SKU" },
    { accessor: "categoria", header: "Categoria" },
    { 
      accessor: "quantidade", 
      header: "Quantidade",
      cell: (row: any) => {
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
            {row.quantidade}
          </span>
        );
      }
    },
    { 
      accessor: "valorUnitario", 
      header: "Valor Unitário",
      cell: (row: any) => {
        return (
          <span className="font-medium">
            R$ {row.valorUnitario.toFixed(2)}
          </span>
        );
      }
    },
    { accessor: "localizacao", header: "Localização" },
    { 
      accessor: "status", 
      header: "Status",
      cell: (row: any) => {
        let color = "bg-green-100 text-green-800";
        if (row.status === "Baixo Estoque") color = "bg-yellow-100 text-yellow-800";
        if (row.status === "Sem Estoque") color = "bg-red-100 text-red-800";
        
        return (
          <Badge variant="outline" className={`${color}`}>
            {row.status}
          </Badge>
        );
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
        <h1 className="text-3xl font-bold tracking-tight">Inventário</h1>
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
              <DropdownMenuItem onClick={() => toast.info("Relatório de Inventário será implementado")}>
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
            onClick={handleAddItem}
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
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        description={`Tem certeza que deseja excluir o produto "${selectedRow?.produto}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
      
      {/* Formulário de adição de item */}
      {isAddDialogOpen && (
        <InventarioForm 
          isOpen={isAddDialogOpen}
          onClose={() => setIsAddDialogOpen(false)}
          onSubmit={handleSaveItem}
          title="Cadastrar Novo Item"
          mode="create"
        />
      )}
      
      {/* Formulário de edição de item */}
      {isEditDialogOpen && selectedRow && (
        <InventarioForm 
          isOpen={isEditDialogOpen}
          onClose={() => setIsEditDialogOpen(false)}
          onSubmit={handleEdit}
          itemData={selectedRow}
          title="Editar Item"
          mode="edit"
        />
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
