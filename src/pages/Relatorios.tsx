
import { useState } from "react";
import { 
  Download, FileSpreadsheet, FileText, BarChart3, TrendingUp,
  PackageSearch, LineChart, ShoppingCart
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/components/DateRangePicker";
import { ActionButton } from "@/components/ActionButton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ReportChart } from "@/components/relatorios/ReportChart";

// Definindo o tipo para Date Range
interface DateRange {
  from: Date;
  to?: Date;
}

export default function Relatorios() {
  const [activeTab, setActiveTab] = useState("vendas");
  const [dateRange, setDateRange] = useState<DateRange>({ from: new Date(), to: new Date() });
  const [exportFormat, setExportFormat] = useState<"pdf" | "excel">("pdf");
  const { toast } = useToast();

  const handleDateChange = (range: DateRange) => {
    setDateRange(range);
  };

  const handleExportReport = (reportType: string) => {
    toast({
      title: `Exportando relatório de ${reportType}`,
      description: `O relatório será exportado em formato ${exportFormat === "pdf" ? "PDF" : "Excel"}.`,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <h1 className="text-3xl font-bold">Relatórios</h1>
        <div className="flex flex-col sm:flex-row gap-2">
          <DateRangePicker
            date={dateRange}
            onChange={handleDateChange}
          />
          <div className="flex gap-2">
            <ActionButton 
              variant={exportFormat === "pdf" ? "default" : "outline"}
              startIcon={<FileText />}
              onClick={() => setExportFormat("pdf")}
            >
              PDF
            </ActionButton>
            <ActionButton 
              variant={exportFormat === "excel" ? "default" : "outline"}
              startIcon={<FileSpreadsheet />}
              onClick={() => setExportFormat("excel")}
            >
              Excel
            </ActionButton>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-5 w-full">
          <TabsTrigger value="vendas">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Vendas
          </TabsTrigger>
          <TabsTrigger value="lucro">
            <TrendingUp className="w-4 h-4 mr-2" />
            Lucros
          </TabsTrigger>
          <TabsTrigger value="estoque">
            <BarChart3 className="w-4 h-4 mr-2" />
            Estoque
          </TabsTrigger>
          <TabsTrigger value="produtos">
            <PackageSearch className="w-4 h-4 mr-2" />
            Produtos
          </TabsTrigger>
          <TabsTrigger value="compras">
            <LineChart className="w-4 h-4 mr-2" />
            Compras
          </TabsTrigger>
        </TabsList>

        <TabsContent value="vendas" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Relatório de Vendas</CardTitle>
                <CardDescription>
                  Análise de vendas por período, produtos e clientes
                </CardDescription>
              </div>
              <ActionButton 
                startIcon={<Download />} 
                onClick={() => handleExportReport("vendas")}
              >
                Exportar
              </ActionButton>
            </CardHeader>
            <CardContent>
              <ReportChart 
                type="vendas" 
                dateRange={dateRange} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lucro" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Relatório de Lucros</CardTitle>
                <CardDescription>
                  Análise de lucro por produto, categoria e período
                </CardDescription>
              </div>
              <ActionButton 
                startIcon={<Download />} 
                onClick={() => handleExportReport("lucros")}
              >
                Exportar
              </ActionButton>
            </CardHeader>
            <CardContent>
              <ReportChart 
                type="lucro" 
                dateRange={dateRange} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estoque" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Relatório de Movimentação de Estoque</CardTitle>
                <CardDescription>
                  Análise de entradas, saídas e ajustes no estoque
                </CardDescription>
              </div>
              <ActionButton 
                startIcon={<Download />} 
                onClick={() => handleExportReport("estoque")}
              >
                Exportar
              </ActionButton>
            </CardHeader>
            <CardContent>
              <ReportChart 
                type="estoque" 
                dateRange={dateRange} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="produtos" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Relatório de Produtos</CardTitle>
                <CardDescription>
                  Análise de produtos em baixa, parados e mais vendidos
                </CardDescription>
              </div>
              <ActionButton 
                startIcon={<Download />} 
                onClick={() => handleExportReport("produtos")}
              >
                Exportar
              </ActionButton>
            </CardHeader>
            <CardContent>
              <ReportChart 
                type="produtos" 
                dateRange={dateRange} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compras" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Relatório de Compras</CardTitle>
                <CardDescription>
                  Análise de compras por fornecedor, produto e período
                </CardDescription>
              </div>
              <ActionButton 
                startIcon={<Download />} 
                onClick={() => handleExportReport("compras")}
              >
                Exportar
              </ActionButton>
            </CardHeader>
            <CardContent>
              <ReportChart 
                type="compras" 
                dateRange={dateRange} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
