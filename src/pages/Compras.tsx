
import { useState } from "react";
import { 
  Package, FileText, Download, Filter, Plus, ShoppingBag, 
  Clock, CheckCircle, XCircle, Calendar, Search 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Dados fictícios para pedidos de compra
const comprasData = [
  {
    id: "PC001",
    fornecedor: "Eletrônicos Tech LTDA",
    cnpj: "12.345.678/0001-90",
    data: "2023-05-10",
    dataPrevista: "2023-05-20",
    valor: 25600.00,
    itens: 5,
    status: "Em Andamento",
  },
  {
    id: "PC002",
    fornecedor: "Periféricos e Acessórios S.A.",
    cnpj: "98.765.432/0001-10",
    data: "2023-05-08",
    dataPrevista: "2023-05-15",
    valor: 8750.50,
    itens: 12,
    status: "Em Andamento",
  },
  {
    id: "PC003",
    fornecedor: "Distribuidora de Áudio LTDA",
    cnpj: "45.678.901/0001-23",
    data: "2023-05-05",
    dataPrevista: "2023-05-12",
    valor: 6320.75,
    itens: 8,
    status: "Recebido",
  },
  {
    id: "PC004",
    fornecedor: "Importadora de Tecnologia Avançada",
    cnpj: "34.567.890/0001-45",
    data: "2023-05-03",
    dataPrevista: "2023-05-18",
    valor: 18945.30,
    itens: 15,
    status: "Recebido",
  },
  {
    id: "PC005",
    fornecedor: "Componentes Eletrônicos do Brasil",
    cnpj: "56.789.012/0001-56",
    data: "2023-05-01",
    dataPrevista: "2023-05-10",
    valor: 4230.60,
    itens: 7,
    status: "Cancelado",
  },
];

// Dados para os itens de um pedido específico
const itensPedidoData = [
  {
    id: 1,
    produto: "Laptop Dell XPS 13",
    sku: "DELL-XPS13",
    quantidade: 5,
    valorUnitario: 4500.00,
    valorTotal: 22500.00
  },
  {
    id: 2,
    produto: "Adaptador HDMI",
    sku: "HDMI-ADPT",
    quantidade: 10,
    valorUnitario: 79.90,
    valorTotal: 799.00
  },
  {
    id: 3,
    produto: "Mouse Sem Fio Dell",
    sku: "DELL-MS-W",
    quantidade: 10,
    valorUnitario: 149.90,
    valorTotal: 1499.00
  },
  {
    id: 4,
    produto: "Capa Protetora Laptop 13\"",
    sku: "CASE-13",
    quantidade: 8,
    valorUnitario: 99.90,
    valorTotal: 799.20
  }
];

export default function Compras() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<any>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isReceiveDialogOpen, setIsReceiveDialogOpen] = useState(false);
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("todos");
  
  // Filtragem por status
  const filteredByStatus = activeTab === "todos" 
    ? comprasData 
    : comprasData.filter(pedido => {
      switch(activeTab) {
        case "andamento":
          return pedido.status === "Em Andamento";
        case "recebidos":
          return pedido.status === "Recebido";
        case "cancelados":
          return pedido.status === "Cancelado";
        default:
          return true;
      }
    });
  
  // Formatador de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };
  
  // Função para lidar com a pesquisa
  const handleSearch = () => {
    setIsLoading(true);
    
    // Simulação de um atraso de carregamento
    setTimeout(() => {
      const filtered = comprasData.filter(item =>
        item.fornecedor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setIsLoading(false);
      toast.success(`${filtered.length} pedido(s) encontrado(s)`);
      // Aqui você atualizaria o estado com os resultados filtrados
    }, 500);
  };
  
  // Função para lidar com a criação de um novo pedido
  const handleNovoPedido = () => {
    toast.info("Funcionalidade de novo pedido será implementada");
  };
  
  // Função para lidar com o recebimento de um pedido
  const handleReceivePedido = () => {
    setIsLoading(true);
    
    // Simulação de um atraso de carregamento
    setTimeout(() => {
      setIsLoading(false);
      setIsReceiveDialogOpen(false);
      toast.success(`Pedido ${selectedPedido.id} marcado como recebido com sucesso`);
    }, 1000);
  };
  
  // Função para lidar com o cancelamento de um pedido
  const handleCancelPedido = () => {
    setIsLoading(true);
    
    // Simulação de um atraso de carregamento
    setTimeout(() => {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
      toast.success(`Pedido ${selectedPedido.id} cancelado com sucesso`);
    }, 1000);
  };
  
  // Colunas para a tabela de pedidos
  const columns = [
    { accessor: "id", header: "Pedido #" },
    { accessor: "fornecedor", header: "Fornecedor" },
    { 
      accessor: "data", 
      header: "Data Emissão",
      cell: (row: any) => formatDate(row.data)
    },
    { 
      accessor: "dataPrevista", 
      header: "Previsão",
      cell: (row: any) => formatDate(row.dataPrevista)
    },
    { 
      accessor: "valor", 
      header: "Valor Total",
      cell: (row: any) => (
        <span className="font-medium">
          R$ {row.valor.toFixed(2)}
        </span>
      )
    },
    { accessor: "itens", header: "Qtd. Itens" },
    { 
      accessor: "status", 
      header: "Status",
      cell: (row: any) => {
        let color = "bg-blue-100 text-blue-800";
        let icon = <Clock className="w-4 h-4 mr-1" />;
        
        if (row.status === "Recebido") {
          color = "bg-green-100 text-green-800";
          icon = <CheckCircle className="w-4 h-4 mr-1" />;
        } else if (row.status === "Cancelado") {
          color = "bg-red-100 text-red-800";
          icon = <XCircle className="w-4 h-4 mr-1" />;
        }
        
        return (
          <Badge variant="outline" className={`${color} flex items-center`}>
            {icon} {row.status}
          </Badge>
        );
      }
    }
  ];
  
  // Colunas para a tabela de itens do pedido
  const itemColumns = [
    { accessor: "produto", header: "Produto" },
    { accessor: "sku", header: "SKU" },
    { 
      accessor: "quantidade", 
      header: "Quantidade",
      cell: (row: any) => (
        <span className="font-medium">{row.quantidade}</span>
      )
    },
    { 
      accessor: "valorUnitario", 
      header: "Valor Unitário",
      cell: (row: any) => (
        <span>R$ {row.valorUnitario.toFixed(2)}</span>
      )
    },
    { 
      accessor: "valorTotal", 
      header: "Valor Total",
      cell: (row: any) => (
        <span className="font-medium">R$ {row.valorTotal.toFixed(2)}</span>
      )
    }
  ];
  
  // Ações para a tabela de pedidos
  const actions = [
    {
      label: "Ver Detalhes",
      onClick: (row: any) => {
        setSelectedPedido(row);
        setIsViewingDetails(true);
        toast.info(`Visualizando detalhes do pedido: ${row.id}`);
      },
    },
    {
      label: "Marcar como Recebido",
      onClick: (row: any) => {
        if (row.status !== "Cancelado" && row.status !== "Recebido") {
          setSelectedPedido(row);
          setIsReceiveDialogOpen(true);
        } else {
          toast.error("Não é possível receber um pedido cancelado ou já recebido");
        }
      },
    },
    {
      label: "Cancelar Pedido",
      onClick: (row: any) => {
        if (row.status !== "Cancelado" && row.status !== "Recebido") {
          setSelectedPedido(row);
          setIsDeleteDialogOpen(true);
        } else {
          toast.error("Não é possível cancelar um pedido já finalizado");
        }
      },
    },
  ];
  
  return (
    <div className="space-y-6">
      {!isViewingDetails ? (
        <>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold tracking-tight">Compras</h1>
            
            <div className="flex items-center gap-2">
              <div className="flex gap-2">
                <Input
                  placeholder="Buscar pedido ou fornecedor..."
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
              
              <ActionButton 
                variant="outline" 
                size="sm"
                startIcon={<Filter className="h-4 w-4" />}
                onClick={() => toast.info("Filtros serão implementados")}
              >
                Filtrar
              </ActionButton>
              
              <ActionButton 
                variant="outline" 
                size="sm"
                startIcon={<Calendar className="h-4 w-4" />}
                onClick={() => toast.info("Filtro por período será implementado")}
              >
                Período
              </ActionButton>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => toast.success("Exportado em PDF")}>
                    Exportar PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("Exportado em Excel")}>
                    Exportar Excel
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => toast.success("Exportado em CSV")}>
                    Exportar CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <ActionButton
                size="sm"
                startIcon={<Plus className="h-4 w-4" />}
                onClick={handleNovoPedido}
              >
                Novo Pedido
              </ActionButton>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">12</div>
                <p className="text-sm text-muted-foreground">
                  Total de Pedidos
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-blue-600">5</div>
                <p className="text-sm text-muted-foreground">
                  Em Andamento
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-green-600">7</div>
                <p className="text-sm text-muted-foreground">
                  Recebidos
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Tabs defaultValue="todos" className="w-full" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="todos">Todos os Pedidos</TabsTrigger>
              <TabsTrigger value="andamento">Em Andamento</TabsTrigger>
              <TabsTrigger value="recebidos">Recebidos</TabsTrigger>
              <TabsTrigger value="cancelados">Cancelados</TabsTrigger>
            </TabsList>
            
            <TabsContent value={activeTab}>
              <Card>
                <CardHeader>
                  <CardTitle>Pedidos de Compra</CardTitle>
                  <CardDescription>
                    Gerencie seus pedidos de compra por fornecedor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={filteredByStatus}
                    columns={columns}
                    actions={actions}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          
          {/* Dialog de confirmação de cancelamento */}
          <ConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleCancelPedido}
            title="Confirmar cancelamento"
            description={`Tem certeza que deseja cancelar o pedido ${selectedPedido?.id} do fornecedor ${selectedPedido?.fornecedor}? Esta ação não pode ser desfeita.`}
            confirmText="Cancelar Pedido"
            cancelText="Voltar"
            variant="destructive"
          />
          
          {/* Dialog de confirmação de recebimento */}
          <ConfirmDialog
            isOpen={isReceiveDialogOpen}
            onClose={() => setIsReceiveDialogOpen(false)}
            onConfirm={handleReceivePedido}
            title="Confirmar recebimento"
            description={`Confirma o recebimento do pedido ${selectedPedido?.id} do fornecedor ${selectedPedido?.fornecedor}?`}
            confirmText="Confirmar Recebimento"
            cancelText="Voltar"
          />
        </>
      ) : (
        // Detalhes do pedido
        <>
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                onClick={() => setIsViewingDetails(false)} 
                className="mr-2"
              >
                ← Voltar
              </Button>
              <h1 className="text-3xl font-bold tracking-tight">
                Detalhes do Pedido {selectedPedido?.id}
              </h1>
            </div>
            
            <div className="flex gap-2">
              <ActionButton 
                variant="outline"
                startIcon={<Download className="h-4 w-4" />}
                onClick={() => toast.success("Pedido exportado em PDF")}
              >
                Exportar PDF
              </ActionButton>
              
              {selectedPedido?.status === "Em Andamento" && (
                <>
                  <ActionButton
                    variant="outline"
                    onClick={() => setIsReceiveDialogOpen(true)}
                  >
                    Marcar como Recebido
                  </ActionButton>
                  
                  <ActionButton
                    variant="destructive"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    Cancelar Pedido
                  </ActionButton>
                </>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Número do Pedido:</dt>
                    <dd className="text-sm font-bold col-span-2">{selectedPedido?.id}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Fornecedor:</dt>
                    <dd className="text-sm col-span-2">{selectedPedido?.fornecedor}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">CNPJ:</dt>
                    <dd className="text-sm col-span-2">{selectedPedido?.cnpj}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Data de Emissão:</dt>
                    <dd className="text-sm col-span-2">{formatDate(selectedPedido?.data)}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Previsão de Entrega:</dt>
                    <dd className="text-sm col-span-2">{formatDate(selectedPedido?.dataPrevista)}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Status:</dt>
                    <dd className="text-sm col-span-2">
                      <Badge variant="outline" className={
                        selectedPedido?.status === "Em Andamento" ? "bg-blue-100 text-blue-800" :
                        selectedPedido?.status === "Recebido" ? "bg-green-100 text-green-800" :
                        "bg-red-100 text-red-800"
                      }>
                        {selectedPedido?.status}
                      </Badge>
                    </dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Resumo Financeiro</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="divide-y divide-gray-200">
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Total de Itens:</dt>
                    <dd className="text-sm font-bold col-span-2">{selectedPedido?.itens}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Valor Total:</dt>
                    <dd className="text-sm font-bold col-span-2">R$ {selectedPedido?.valor.toFixed(2)}</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Condição de Pagamento:</dt>
                    <dd className="text-sm col-span-2">30 dias</dd>
                  </div>
                  <div className="py-3 grid grid-cols-3 gap-4">
                    <dt className="text-sm font-medium text-gray-500">Forma de Pagamento:</dt>
                    <dd className="text-sm col-span-2">Boleto Bancário</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Itens do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={itensPedidoData}
                columns={itemColumns}
              />
            </CardContent>
          </Card>
          
          {/* Dialog de confirmação de cancelamento */}
          <ConfirmDialog
            isOpen={isDeleteDialogOpen}
            onClose={() => setIsDeleteDialogOpen(false)}
            onConfirm={handleCancelPedido}
            title="Confirmar cancelamento"
            description={`Tem certeza que deseja cancelar o pedido ${selectedPedido?.id} do fornecedor ${selectedPedido?.fornecedor}? Esta ação não pode ser desfeita.`}
            confirmText="Cancelar Pedido"
            cancelText="Voltar"
            variant="destructive"
          />
          
          {/* Dialog de confirmação de recebimento */}
          <ConfirmDialog
            isOpen={isReceiveDialogOpen}
            onClose={() => setIsReceiveDialogOpen(false)}
            onConfirm={handleReceivePedido}
            title="Confirmar recebimento"
            description={`Confirma o recebimento do pedido ${selectedPedido?.id} do fornecedor ${selectedPedido?.fornecedor}?`}
            confirmText="Confirmar Recebimento"
            cancelText="Voltar"
          />
        </>
      )}
    </div>
  );
}
