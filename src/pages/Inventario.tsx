import { useState } from "react";
import { Package, FileText, Download, Upload, Filter, Edit, Trash2, Plus, Search, Loader2 } from "lucide-react";
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
  },
];

export default function Inventario() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAjusteDialogOpen, setIsAjusteDialogOpen] = useState(false);
  const [filteredData, setFilteredData] = useState(inventarioData);
  
  // Função para lidar com a pesquisa
  const handleSearch = () => {
    setIsLoading(true);
    
    // Simulação de um atraso de carregamento
    setTimeout(() => {
      const filtered = inventarioData.filter(item =>
        item.produto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredData(filtered);
      setIsLoading(false);
      
      toast.success(`${filtered.length} item(s) encontrado(s)`);
    }, 500);
  };
  
  // Função para lidar com a adição de um novo item
  const handleAddItem = () => {
    toast.info("Funcionalidade de adicionar item será implementada");
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
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      toast.success(`Item ${selectedRow.produto} removido com sucesso`);
    }, 1000);
  };
  
  // Função para lidar com a edição de um item
  const handleEdit = () => {
    setIsLoading(true);
    
    // Simulação de um atraso de carregamento
    setTimeout(() => {
      setIsLoading(false);
      setIsEditDialogOpen(false);
      toast.success(`Item ${selectedRow.produto} atualizado com sucesso`);
    }, 1000);
  };
  
  // Função para lidar com o ajuste de estoque
  const handleAjusteEstoque = () => {
    setIsLoading(true);
    
    // Simulação de um atraso de carregamento
    setTimeout(() => {
      setIsLoading(false);
      setIsAjusteDialogOpen(false);
      toast.success(`Estoque do item ${selectedRow.produto} ajustado com sucesso`);
    }, 1000);
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
      cell: (row: any) => (
        <span className={row.quantidade === 0 ? "text-red-500 font-medium" : ""}>
          {row.quantidade}
        </span>
      )
    },
    { 
      accessor: "valorUnitario", 
      header: "Valor Unitário",
      cell: (row: any) => (
        <span>R$ {row.valorUnitario.toFixed(2)}</span>
      )
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
    }
  ];
  
  // Ações para a tabela
  const actions = [
    {
      label: "Visualizar Detalhes",
      onClick: (row: any) => {
        setSelectedRow(row);
        toast.info(`Visualizando detalhes do produto: ${row.produto}`);
      },
    },
    {
      label: "Editar",
      onClick: (row: any) => {
        setSelectedRow(row);
        setIsEditDialogOpen(true);
      },
    },
    {
      label: "Ajustar Estoque",
      onClick: (row: any) => {
        setSelectedRow(row);
        setIsAjusteDialogOpen(true);
      },
    },
    {
      label: "Excluir",
      onClick: (row: any) => {
        setSelectedRow(row);
        setIsDeleteDialogOpen(true);
      },
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Inventário</h1>
                
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">136</div>
            <p className="text-sm text-muted-foreground">
              Total de Items
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">23</div>
            <p className="text-sm text-muted-foreground">
              Baixo Estoque
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">8</div>
            <p className="text-sm text-muted-foreground">
              Sem Estoque
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle>Itens em Estoque</CardTitle>
            <div className="flex items-center space-x-2">
              
              
              <ActionButton
                variant="outline" 
                size="sm"
                startIcon={<Filter className="h-4 w-4" />}
                onClick={() => toast.info("Filtros serão implementados")}
              >
                Filtros
              </ActionButton>
              
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
              
              <ActionButton
                size="sm"
                startIcon={<Plus className="h-4 w-4" />}
                onClick={handleAddItem}
              >
                Novo Item
              </ActionButton>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <DataTable
              data={filteredData}
              columns={columns}
              actions={actions}
              onRowClick={(row) => {
                setSelectedRow(row);
                toast.info(`Selecionado: ${row.produto}`);
              }}
            />
          )}        </CardContent>
      </Card>
      
      {/* Dialog de confirmação de exclusão */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        title="Confirmar exclusão"
        description={`Tem c
erteza que deseja excluir o produto "${selectedRow?.produto}"? Esta ação não pode ser desfeita.`}
        confirmText="Excluir"
        cancelText="Cancelar"
        variant="destructive"
      />
      
      {/* Dialog de edição (simplificado) */}
      <ConfirmDialog
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onConfirm={handleEdit}
        title="Salvar alterações"
        description={`Confirma a edição do produto "${selectedRow?.produto}"?`}
        confirmText="Salvar"
        cancelText="Cancelar"
      />
      
      {/* Dialog de ajuste de estoque (simplificado) */}
      <ConfirmDialog
        isOpen={isAjusteDialogOpen}
        onClose={() => setIsAjusteDialogOpen(false)}
        onConfirm={handleAjusteEstoque}
        title="Ajustar estoque"
        description={`Confirma o ajuste de estoque para o produto "${selectedRow?.produto}"?`}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </div>
  );
}
