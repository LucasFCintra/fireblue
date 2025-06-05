
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card, CardContent, CardDescription, 
  CardHeader, CardTitle 
} from "@/components/ui/card";
import DataTable from "@/components/DataTable";
import { useToast } from "@/hooks/use-toast";
import { 
  ShoppingCart, 
  PlusCircle, 
  Download,
  Filter,
  Calendar
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dados fictícios para vendas
const vendasData = [
  {
    id: "V001",
    cliente: "João Silva",
    data: "2023-05-10",
    valor: 9499.80,
    itens: 3,
    status: "Concluído",
    pagamento: "Cartão de Crédito"
  },
  {
    id: "V002",
    cliente: "Maria Oliveira",
    data: "2023-05-08",
    valor: 1299.90,
    itens: 1,
    status: "Concluído",
    pagamento: "Boleto"
  },
  {
    id: "V003",
    cliente: "Pedro Santos",
    data: "2023-05-07",
    valor: 649.80,
    itens: 2,
    status: "Concluído",
    pagamento: "PIX"
  },
  {
    id: "V004",
    cliente: "Ana Costa",
    data: "2023-05-06",
    valor: 4999.90,
    itens: 5,
    status: "Processando",
    pagamento: "Cartão de Crédito"
  },
  {
    id: "V005",
    cliente: "Carlos Mendes",
    data: "2023-05-05",
    valor: 899.90,
    itens: 1,
    status: "Cancelado",
    pagamento: "Boleto"
  },
];

export default function Vendas() {
  const { toast } = useToast();
  
  // Formatador de data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };
  
  // Colunas para a tabela de vendas
  const columns = [
    { accessor: "id", header: "Pedido #" },
    { accessor: "cliente", header: "Cliente" },
    { 
      accessor: "data", 
      header: "Data",
      cell: (row: any) => formatDate(row.data)
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
    { accessor: "itens", header: "Itens" },
    { accessor: "pagamento", header: "Pagamento" },
    { 
      accessor: "status", 
      header: "Status",
      cell: (row: any) => {
        let color = "bg-green-100 text-green-800";
        if (row.status === "Processando") color = "bg-blue-100 text-blue-800";
        if (row.status === "Cancelado") color = "bg-red-100 text-red-800";
        
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
      label: "Ver Detalhes",
      onClick: (row: any) => {
        toast({
          title: "Detalhes do pedido",
          description: `Visualizando pedido: ${row.id}`,
        });
      },
    },
    {
      label: "Imprimir",
      onClick: (row: any) => {
        toast({
          title: "Imprimindo",
          description: `Gerando impressão do pedido: ${row.id}`,
        });
      },
    },
    {
      label: "Enviar por Email",
      onClick: (row: any) => {
        toast({
          title: "Enviando email",
          description: `Enviando detalhes do pedido: ${row.id}`,
        });
      },
    },
  ];
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Vendas</h1>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-1" />
            Filtrar
          </Button>
          <Button variant="outline" size="sm">
            <Calendar className="w-4 h-4 mr-1" />
            Período
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Exportar
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                Exportar PDF
              </DropdownMenuItem>
              <DropdownMenuItem>
                Exportar Excel
              </DropdownMenuItem>
              <DropdownMenuItem>
                Exportar CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm">
            <PlusCircle className="w-4 h-4 mr-1" />
            Nova Venda
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">R$ 17.349,30</div>
            <p className="text-sm text-muted-foreground">
              Total do Período
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">12</div>
            <p className="text-sm text-muted-foreground">
              Pedidos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">10</div>
            <p className="text-sm text-muted-foreground">
              Concluídos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">2</div>
            <p className="text-sm text-muted-foreground">
              Processando
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Pedidos Recentes</CardTitle>
          <CardDescription>
            Visualize e gerencie suas vendas recentes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DataTable
            data={vendasData}
            columns={columns}
            actions={actions}
          />
        </CardContent>
      </Card>
    </div>
  );
}
