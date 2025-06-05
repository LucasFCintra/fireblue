import React, { useMemo } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FechamentoBanca, FichaFechamento } from '@/types/fechamento';
import { Download, FileBarChart, FilesIcon, Printer, PieChart } from 'lucide-react';
import { GraficoProdutosBanca } from './GraficoProdutosBanca';

interface DetalheFechamentoBancaProps {
  fechamento: FechamentoBanca | null;
  isOpen: boolean;
  onClose: () => void;
}

// Interface para o resumo de produtos
interface ResumoProduto {
  descricao: string;
  quantidade: number;
  valorUnitario: number;
  valorTotal: number;
  fichas: FichaFechamento[];
}

export const DetalheFechamentoBanca: React.FC<DetalheFechamentoBancaProps> = ({
  fechamento,
  isOpen,
  onClose
}) => {
  if (!fechamento) return null;

  // Função para formatar valor em reais
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Gera o resumo por produto, agrupando fichas com a mesma descrição
  const resumoProdutos = useMemo(() => {
    if (!fechamento) return [];

    const produtos: Record<string, ResumoProduto> = {};

    fechamento.fichasEntregues.forEach(ficha => {
      // Usa a descrição como chave para agrupar
      if (!produtos[ficha.descricao]) {
        produtos[ficha.descricao] = {
          descricao: ficha.descricao,
          quantidade: 0,
          valorUnitario: ficha.valorUnitario,
          valorTotal: 0,
          fichas: []
        };
      }

      // Atualiza os valores
      produtos[ficha.descricao].quantidade += ficha.quantidade;
      produtos[ficha.descricao].valorTotal += ficha.valorTotal;
      produtos[ficha.descricao].fichas.push(ficha);
    });

    // Converte o objeto em array e ordena por valor total
    return Object.values(produtos).sort((a, b) => b.valorTotal - a.valorTotal);
  }, [fechamento]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Detalhes do Fechamento - {fechamento.nomeBanca}</DialogTitle>
          <DialogDescription>
            Período: {fechamento.dataInicio} a {fechamento.dataFim}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-500">Total de Peças</div>
            <div className="text-xl font-bold">{fechamento.totalPecas.toLocaleString()}</div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-500">Valor a Pagar</div>
            <div className="text-xl font-bold text-primary">{formatarMoeda(fechamento.valorTotal)}</div>
          </div>
          
          <div className="p-4 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-500">Status</div>
            <div className="text-xl font-bold">
              {fechamento.status === 'pendente' ? 'Pendente' : 
               fechamento.status === 'pago' ? 'Pago' : 'Cancelado'}
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="resumo">
          <TabsList className="grid grid-cols-3 w-full mb-4">
            <TabsTrigger value="resumo">
              <FileBarChart className="h-4 w-4 mr-2" />
              Resumo por Produto
            </TabsTrigger>
            <TabsTrigger value="fichas">
              <FilesIcon className="h-4 w-4 mr-2" />
              Todas as Fichas
            </TabsTrigger>
            <TabsTrigger value="grafico">
              <PieChart className="h-4 w-4 mr-2" />
              Gráficos
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="resumo" className="mt-0">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%]">Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Valor Unit.</TableHead>
                    <TableHead>Valor Total</TableHead>
                    <TableHead>Fichas</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resumoProdutos.map((produto, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{produto.descricao}</TableCell>
                      <TableCell>{produto.quantidade}</TableCell>
                      <TableCell>{formatarMoeda(produto.valorUnitario)}</TableCell>
                      <TableCell>{formatarMoeda(produto.valorTotal)}</TableCell>
                      <TableCell>{produto.fichas.length}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="fichas" className="mt-0">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="w-[30%]">Descrição</TableHead>
                    <TableHead>Qtd</TableHead>
                    <TableHead>Valor Unit.</TableHead>
                    <TableHead>Valor Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fechamento.fichasEntregues.map((ficha) => (
                    <TableRow key={ficha.id}>
                      <TableCell className="font-medium">{ficha.codigo}</TableCell>
                      <TableCell>{ficha.dataEntrada}</TableCell>
                      <TableCell>{ficha.descricao}</TableCell>
                      <TableCell>{ficha.quantidade}</TableCell>
                      <TableCell>{formatarMoeda(ficha.valorUnitario)}</TableCell>
                      <TableCell>{formatarMoeda(ficha.valorTotal)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="grafico" className="mt-0">
            <div className="h-[400px] overflow-y-auto py-2">
              <GraficoProdutosBanca fechamento={fechamento} />
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="flex justify-between">
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
          
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 