
import { useState } from "react";
import { ClipboardList, PlusCircle, Search, FileDown, ShoppingCart, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ActionButton } from "@/components/ActionButton";
import DataTable from "@/components/DataTable";
import { OrdemForm } from "@/components/ordens/OrdemForm";
import { useToast } from "@/hooks/use-toast";
import { useOrdens } from "@/hooks/use-ordens";

type OrdemTab = "vendas" | "compras";

export default function Ordens() {
  const [activeTab, setActiveTab] = useState<OrdemTab>("vendas");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrdem, setSelectedOrdem] = useState<any>(null);
  const { toast } = useToast();
  const { ordensVenda, ordensCompra, isLoading, error } = useOrdens();

  const handleOpenForm = (ordem = null, tipo: OrdemTab = activeTab) => {
    setSelectedOrdem(ordem);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedOrdem(null);
    setIsFormOpen(false);
  };

  const handleExportData = () => {
    toast({
      title: "Exportação iniciada",
      description: "Os dados estão sendo preparados para exportação.",
    });
    // Implementação real de exportação seria adicionada aqui
  };

  const statusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "em aberto":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "pago":
        return "bg-green-100 text-green-800 border-green-200";
      case "entregue":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const ordensVendaColumns = [
    { accessor: "codigo", header: "Código" },
    { accessor: "data", header: "Data" },
    { accessor: "cliente", header: "Cliente" },
    { 
      accessor: "status", 
      header: "Status",
      cell: (ordem) => (
        <Badge className={`font-medium ${statusColor(ordem.status)}`}>
          {ordem.status}
        </Badge>
      )
    },
    { 
      accessor: "valor", 
      header: "Valor",
      cell: (ordem) => (
        <span>
          {new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
          }).format(ordem.valor)}
        </span>
      )
    },
    { accessor: "items", header: "Itens" },
  ];

  const ordensCompraColumns = [
    { accessor: "codigo", header: "Código" },
    { accessor: "data", header: "Data" },
    { accessor: "fornecedor", header: "Fornecedor" },
    { 
      accessor: "status", 
      header: "Status",
      cell: (ordem) => (
        <Badge className={`font-medium ${statusColor(ordem.status)}`}>
          {ordem.status}
        </Badge>
      )
    },
    { 
      accessor: "valor", 
      header: "Valor",
      cell: (ordem) => (
        <span>
          {new Intl.NumberFormat('pt-BR', { 
            style: 'currency', 
            currency: 'BRL' 
          }).format(ordem.valor)}
        </span>
      )
    },
    { accessor: "previsaoEntrega", header: "Previsão de Entrega" },
  ];

  const ordensVendaActions = [
    {
      label: "Editar",
      onClick: (ordem) => handleOpenForm(ordem, "vendas"),
    },
    {
      label: "Marcar como Pago",
      onClick: (ordem) => {
        toast({
          title: "Status atualizado",
          description: `Ordem ${ordem.codigo} atualizada para Pago`,
        });
      },
    },
    {
      label: "Marcar como Entregue",
      onClick: (ordem) => {
        toast({
          title: "Status atualizado",
          description: `Ordem ${ordem.codigo} atualizada para Entregue`,
        });
      },
    },
    {
      label: "Cancelar",
      onClick: (ordem) => {
        toast({
          variant: "destructive",
          title: "Confirme o cancelamento",
          description: `Deseja cancelar a ordem ${ordem.codigo}?`,
        });
      },
    },
  ];

  const ordensCompraActions = [
    {
      label: "Editar",
      onClick: (ordem) => handleOpenForm(ordem, "compras"),
    },
    {
      label: "Receber",
      onClick: (ordem) => {
        toast({
          title: "Status atualizado",
          description: `Ordem ${ordem.codigo} atualizada para Recebido`,
        });
      },
    },
    {
      label: "Cancelar",
      onClick: (ordem) => {
        toast({
          variant: "destructive",
          title: "Confirme o cancelamento",
          description: `Deseja cancelar a ordem ${ordem.codigo}?`,
        });
      },
    },
  ];

  if (error) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-red-500">Erro ao carregar dados: {error}</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filtra as ordens de acordo com o termo de busca
  const filteredOrdensVenda = ordensVenda?.filter(
    (ordem) =>
      ordem.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.status?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const filteredOrdensCompra = ordensCompra?.filter(
    (ordem) =>
      ordem.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.fornecedor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.status?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-3xl font-bold">Ordens</h1>
        <div className="flex flex-wrap gap-2">
          <ActionButton 
            startIcon={<PlusCircle />} 
            onClick={() => handleOpenForm(null, activeTab)}
          >
            Nova Ordem
          </ActionButton>
          <ActionButton 
            variant="outline" 
            startIcon={<FileDown />} 
            onClick={handleExportData}
          >
            Exportar
          </ActionButton>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value: OrdemTab) => setActiveTab(value)}>
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="vendas">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Ordens de Venda
          </TabsTrigger>
          <TabsTrigger value="compras">
            <Truck className="w-4 h-4 mr-2" />
            Ordens de Compra
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendas" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ordens de Venda</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código, cliente ou status..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <DataTable
                data={filteredOrdensVenda}
                columns={ordensVendaColumns}
                actions={ordensVendaActions}
                isLoading={isLoading}
                onRowClick={(ordem) => handleOpenForm(ordem, "vendas")}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compras" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Ordens de Compra</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código, fornecedor ou status..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <DataTable
                data={filteredOrdensCompra}
                columns={ordensCompraColumns}
                actions={ordensCompraActions}
                isLoading={isLoading}
                onRowClick={(ordem) => handleOpenForm(ordem, "compras")}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isFormOpen && (
        <OrdemForm
          ordem={selectedOrdem}
          tipo={activeTab}
          isOpen={isFormOpen}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
}
