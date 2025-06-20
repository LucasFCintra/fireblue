import { useState } from "react";
import { 
  Download, FileSpreadsheet, FileText, BarChart3, TrendingUp,
  PackageSearch, LineChart, ShoppingCart, Scissors, AlertTriangle,
  Wrench, Package
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
  const [activeTab, setActiveTab] = useState("pecas-cortadas");
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

      <Tabs defaultValue="pecas-cortadas" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full">
          <TabsTrigger value="pecas-cortadas">
            <Scissors className="w-4 h-4 mr-2" />
            Peças Cortadas
          </TabsTrigger>
          <TabsTrigger value="pecas-perdidas">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Peças Perdidas
          </TabsTrigger>
          <TabsTrigger value="consertos">
            <Wrench className="w-4 h-4 mr-2" />
            Consertos
          </TabsTrigger>
          <TabsTrigger value="pecas-recebidas">
            <Package className="w-4 h-4 mr-2" />
            Peças Recebidas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pecas-cortadas" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Relatório de Peças Cortadas</CardTitle>
                <CardDescription>
                  Análise de peças cortadas por período e tipo
                </CardDescription>
              </div>
              <ActionButton 
                startIcon={<Download />} 
                onClick={() => handleExportReport("peças cortadas")}
              >
                Exportar
              </ActionButton>
            </CardHeader>
            <CardContent>
              <ReportChart 
                type="pecas-cortadas" 
                dateRange={dateRange} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pecas-perdidas" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Relatório de Peças Perdidas</CardTitle>
                <CardDescription>
                  Análise de peças perdidas por período e motivo
                </CardDescription>
              </div>
              <ActionButton 
                startIcon={<Download />} 
                onClick={() => handleExportReport("peças perdidas")}
              >
                Exportar
              </ActionButton>
            </CardHeader>
            <CardContent>
              <ReportChart 
                type="pecas-perdidas" 
                dateRange={dateRange} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consertos" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Relatório de Consertos</CardTitle>
                <CardDescription>
                  Análise de peças recuperadas por período e tipo de conserto
                </CardDescription>
              </div>
              <ActionButton 
                startIcon={<Download />} 
                onClick={() => handleExportReport("consertos")}
              >
                Exportar
              </ActionButton>
            </CardHeader>
            {/* <CardContent>
              <ReportChart 
                type="consertos" 
                dateRange={dateRange} 
              />
            </CardContent> */}
          </Card>
        </TabsContent>

        <TabsContent value="pecas-recebidas" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>Relatório de Peças Recebidas</CardTitle>
                <CardDescription>
                  Análise de peças recebidas pelas bancas por período
                </CardDescription>
              </div>
              <ActionButton 
                startIcon={<Download />} 
                onClick={() => handleExportReport("peças recebidas")}
              >
                Exportar
              </ActionButton>
            </CardHeader>
            <CardContent>
              <ReportChart 
                type="pecas-recebidas" 
                dateRange={dateRange} 
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
