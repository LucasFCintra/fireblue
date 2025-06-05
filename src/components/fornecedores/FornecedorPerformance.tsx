
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface FornecedorPerformanceProps {
  fornecedor: any;
  isOpen: boolean;
  onClose: () => void;
}

export function FornecedorPerformance({ fornecedor, isOpen, onClose }: FornecedorPerformanceProps) {
  // Dados fictícios de desempenho do fornecedor
  const performanceData = [
    {
      name: 'Jan',
      pontualidade: 85,
      qualidade: 90,
      preço: 75
    },
    {
      name: 'Fev',
      pontualidade: 88,
      qualidade: 85,
      preço: 80
    },
    {
      name: 'Mar',
      pontualidade: 90,
      qualidade: 95,
      preço: 78
    },
    {
      name: 'Abr',
      pontualidade: 95,
      qualidade: 90,
      preço: 82
    },
    {
      name: 'Mai',
      pontualidade: fornecedor?.desempenho,
      qualidade: fornecedor?.desempenho - 5,
      preço: fornecedor?.desempenho - 10
    }
  ];

  // Dados fictícios de volume de entregas
  const volumeData = [
    {
      name: 'Jan',
      volume: 45
    },
    {
      name: 'Fev',
      volume: 55
    },
    {
      name: 'Mar',
      volume: 75
    },
    {
      name: 'Abr',
      volume: 65
    },
    {
      name: 'Mai',
      volume: 80
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Desempenho do Fornecedor</DialogTitle>
          <DialogDescription>
            Análise de desempenho de {fornecedor?.nome}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-8 my-4">
          <div>
            <h3 className="text-lg font-medium mb-4">Ranking de Desempenho</h3>
            <Card>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={performanceData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pontualidade" name="Pontualidade" fill="#8884d8" />
                    <Bar dataKey="qualidade" name="Qualidade" fill="#82ca9d" />
                    <Bar dataKey="preço" name="Preço" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">Volume de Entrega</h3>
            <Card>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={volumeData}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="volume" name="Volume de Entrega" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-lg font-medium mb-4">Informações Gerais</h3>
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Pontualidade:</span>
                      <span className="font-medium">{fornecedor?.desempenho}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tempo médio de entrega:</span>
                      <span className="font-medium">{fornecedor?.tempoMedioEntrega} dias</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Última entrega:</span>
                      <span className="font-medium">08/05/2025</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total de pedidos:</span>
                      <span className="font-medium">37</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Principais Produtos</h3>
              <Card>
                <CardContent className="pt-6">
                  <ul className="space-y-2">
                    <li className="flex justify-between">
                      <span>Produto 1</span>
                      <span className="text-muted-foreground">43 un</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Produto 2</span>
                      <span className="text-muted-foreground">29 un</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Produto 3</span>
                      <span className="text-muted-foreground">18 un</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Produto 4</span>
                      <span className="text-muted-foreground">15 un</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Produto 5</span>
                      <span className="text-muted-foreground">7 un</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
