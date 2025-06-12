import React, { useMemo, useState } from 'react';
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
import { Badge } from "@/components/ui/badge";
import { FechamentoBanca, FichaFechamento } from '@/types/fechamento';
import { FileBarChart, FilesIcon, Printer, PieChart, FileCheck, Receipt, CheckCircle } from 'lucide-react';
import { GraficoProdutosBanca } from './GraficoProdutosBanca';
import { gerarComprovantePDF } from '@/services/fechamentoService';
import { useToast } from '@/hooks/use-toast';

interface DetalheFechamentoBancaProps {
  fechamento: FechamentoBanca | null;
  isOpen: boolean;
  onClose: () => void;
  onFinalizarBanca: (idBanca: string) => void;
  onImprimirComprovante: (fechamento: FechamentoBanca) => void;
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
  onClose,
  onFinalizarBanca,
  onImprimirComprovante
}) => {
  const [activeTab, setActiveTab] = useState<string>('resumo');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPrintingReport, setIsPrintingReport] = useState(false);
  const { toast } = useToast();
  
  // Adicionar logs para depuração
  console.log("DetalheFechamentoBanca renderizado:", { isOpen, fechamento: fechamento?.id });
  
  // Se não houver fechamento, não renderizar nada
  if (!fechamento) {
    console.log("Fechamento é nulo, não renderizando o diálogo");
    return null;
  }

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

  const handleFinalizarBanca = async () => {
    setIsProcessing(true);
    try {
      await onFinalizarBanca(fechamento.idBanca);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImprimirComprovante = async () => {
    setIsProcessing(true);
    try {
      await onImprimirComprovante(fechamento);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImprimirRelatorio = async () => {
    setIsPrintingReport(true);
    try {
      // Importar bibliotecas dinamicamente
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      // Definir nome do arquivo
      const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const horaAtual = new Date().toLocaleTimeString('pt-BR').replace(/:/g, '-').substring(0, 5);
      const nomeArquivo = `Relatorio_Fechamento_${fechamento.nomeBanca.replace(/\s+/g, '_')}_${dataAtual}`;
      
      // Criar um novo documento PDF
      const doc = new jsPDF();
      
      // Adicionar título
      doc.setFontSize(16);
      doc.text('RELATÓRIO DE FECHAMENTO DE BANCA', 105, 15, { align: 'center' });
      
      // Informações da banca
      doc.setFontSize(12);
      doc.text(`Banca: ${fechamento.nomeBanca}`, 14, 30);
      doc.text(`Período: ${fechamento.dataInicio} a ${fechamento.dataFim}`, 14, 38);
      doc.text(`Status: ${fechamento.status === 'pago' ? 'Pago' : fechamento.status === 'pendente' ? 'Pendente' : 'Cancelado'}`, 14, 46);
      if (fechamento.status === 'pago' && fechamento.dataPagamento) {
        doc.text(`Data de pagamento: ${fechamento.dataPagamento}`, 14, 54);
      }
      
      // Resumo geral
      doc.setFillColor(240, 240, 240);
      doc.rect(14, 60, 182, 20, 'F');
      doc.setFontSize(11);
      doc.text('Resumo Geral', 14, 66);
      doc.text(`Total de Peças: ${fechamento.totalPecas}`, 14, 74);
      doc.text(`Valor Total: ${formatarMoeda(fechamento.valorTotal)}`, 120, 74);
      
      // Seção 1: Resumo por Produto
      doc.addPage();
      doc.setFontSize(14);
      doc.text('RESUMO POR PRODUTO', 105, 15, { align: 'center' });
      
      autoTable(doc, {
        startY: 25,
        head: [['Produto', 'Quantidade', 'Valor Unit.', 'Valor Total', 'Fichas']],
        body: resumoProdutos.map(produto => [
          produto.descricao,
          produto.quantidade.toString(),
          formatarMoeda(produto.valorUnitario),
          formatarMoeda(produto.valorTotal),
          produto.fichas.length.toString()
        ]),
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      // Seção 2: Todas as Fichas
      doc.addPage();
      doc.setFontSize(14);
      doc.text('DETALHAMENTO DE TODAS AS FICHAS', 105, 15, { align: 'center' });
      
      autoTable(doc, {
        startY: 25,
        head: [['Código', 'Data', 'Descrição', 'Qtd', 'Valor Unit.', 'Valor Total']],
        body: fechamento.fichasEntregues.map(ficha => [
          ficha.codigo,
          ficha.dataEntrada,
          ficha.descricao,
          ficha.quantidade.toString(),
          formatarMoeda(ficha.valorUnitario),
          formatarMoeda(ficha.valorTotal)
        ]),
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] },
        styles: { overflow: 'linebreak' },
        columnStyles: {
          2: { cellWidth: 60 } // Largura maior para coluna de descrição
        }
      });
      
      // Seção 3: Análise Estatística dos Produtos
      doc.addPage();
      doc.setFontSize(14);
      doc.text('ANÁLISE ESTATÍSTICA DE PRODUTOS', 105, 15, { align: 'center' });
      
      // Dados para gráficos estáticos (tabelas)
      // Agrupa as fichas por descrição de produto (similar ao GraficoProdutosBanca)
      const produtosMap = new Map<string, { quantidade: number; valor: number }>();
      
      fechamento.fichasEntregues.forEach(ficha => {
        const chave = ficha.descricao.split('-')[0].trim(); // Usa a primeira parte da descrição como chave
        
        if (produtosMap.has(chave)) {
          const produto = produtosMap.get(chave)!;
          produto.quantidade += ficha.quantidade;
          produto.valor += ficha.valorTotal;
        } else {
          produtosMap.set(chave, {
            quantidade: ficha.quantidade,
            valor: ficha.valorTotal
          });
        }
      });
      
      // Converte o Map para um array de objetos e ordena por quantidade
      const dadosGrafico = Array.from(produtosMap.entries())
        .map(([nome, dados]) => ({
          nome,
          quantidade: dados.quantidade,
          valor: dados.valor,
          percentual: (dados.valor / fechamento.valorTotal * 100).toFixed(2)
        }))
        .sort((a, b) => b.quantidade - a.quantidade);
      
      // Tabela de Quantidade por Produto
      doc.setFontSize(12);
      doc.text('Quantidade por Produto', 14, 30);
      
      autoTable(doc, {
        startY: 35,
        head: [['Produto', 'Quantidade', '% do Total']],
        body: dadosGrafico.map(item => [
          item.nome,
          item.quantidade.toString(),
          `${((item.quantidade / fechamento.totalPecas) * 100).toFixed(2)}%`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      // Tabela de Distribuição de Valor
      const finalY1 = (doc as any).lastAutoTable.finalY + 15;
      doc.text('Distribuição de Valor', 14, finalY1);
      
      autoTable(doc, {
        startY: finalY1 + 5,
        head: [['Produto', 'Valor Total', '% do Valor Total']],
        body: dadosGrafico.map(item => [
          item.nome,
          formatarMoeda(item.valor),
          `${item.percentual}%`
        ]),
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      // Adicionar estatísticas adicionais
      const finalY2 = (doc as any).lastAutoTable.finalY + 15;
      doc.text('Estatísticas Adicionais', 14, finalY2);
      
      // Encontrar o produto mais valioso e com maior quantidade
      const produtoMaiorValor = dadosGrafico.sort((a, b) => b.valor - a.valor)[0];
      const produtoMaiorQuantidade = dadosGrafico.sort((a, b) => b.quantidade - a.quantidade)[0];
      
      const estatisticas = [
        ['Produto com maior valor total', produtoMaiorValor.nome, formatarMoeda(produtoMaiorValor.valor)],
        ['Produto com maior quantidade', produtoMaiorQuantidade.nome, `${produtoMaiorQuantidade.quantidade} unidades`],
        ['Valor médio por ficha', '-', formatarMoeda(fechamento.valorTotal / fechamento.fichasEntregues.length)],
        ['Quantidade média por ficha', '-', (fechamento.totalPecas / fechamento.fichasEntregues.length).toFixed(2)]
      ];
      
      autoTable(doc, {
        startY: finalY2 + 5,
        head: [['Métrica', 'Produto', 'Valor']],
        body: estatisticas,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      // Adicionar rodapé em todas as páginas
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text('Fire Blue - Sistema de Gestão', 105, 285, { align: 'center' });
        doc.text(`Página ${i} de ${pageCount}`, 195, 285, { align: 'right' });
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 14, 285);
      }
      
      // Ao invés de apenas abrir o PDF, vamos salvar com o nome definido
      doc.save(`${nomeArquivo}.pdf`);
      
      toast({
        title: "Relatório gerado",
        description: `O relatório "${nomeArquivo}.pdf" para ${fechamento.nomeBanca} foi gerado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao gerar o relatório de fechamento.",
        variant: "destructive",
      });
    } finally {
      setIsPrintingReport(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(value) => {
      console.log("Dialog onOpenChange:", value);
      if (!value) onClose();
    }}>
      <DialogContent 
        className="sm:max-w-5xl max-h-[90vh] p-6 w-[95vw] overflow-hidden z-50"
        onInteractOutside={(e) => {
          // Previne que o diálogo feche ao clicar fora dele
          e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // Permite fechar com a tecla ESC
          onClose();
        }}
      >
        <DialogHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <div>
              <DialogTitle className="text-xl font-semibold text-indigo-800">Detalhes do Fechamento - {fechamento.nomeBanca}</DialogTitle>
              <DialogDescription>
                Período: {fechamento.dataInicio} a {fechamento.dataFim}
              </DialogDescription>
            </div>
            <Badge 
              className={
                fechamento.status === 'pendente' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : fechamento.status === 'pago'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
              }
            >
              {fechamento.status === 'pendente' ? 'Pendente' : 
               fechamento.status === 'pago' ? 'Pago' : 'Cancelado'}
            </Badge>
          </div>
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
            <div className="text-xl font-bold flex items-center">
              {fechamento.status === 'pendente' ? (
                <span className="flex items-center text-yellow-700">
                  Pendente
                </span>
              ) : fechamento.status === 'pago' ? (
                <span className="flex items-center text-green-700">
                  <CheckCircle className="h-5 w-5 mr-1" /> Pago
                </span>
              ) : (
                <span className="text-red-700">Cancelado</span>
              )}
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
        
        <DialogFooter className="flex justify-between border-t pt-4 mt-4">
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleImprimirComprovante}
              disabled={fechamento.status === 'pago' || isProcessing}
            >
              <Receipt className="h-4 w-4 mr-2" />
              {isProcessing ? 'Gerando...' : 'Imprimir Comprovante'}
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleImprimirRelatorio}
              disabled={isPrintingReport}
            >
              <Printer className="h-4 w-4 mr-2" />
              {isPrintingReport ? 'Gerando...' : 'Imprimir Relatório'}
            </Button>
          </div>
          
          <div className="flex space-x-2">
            <Button onClick={onClose} variant="secondary">Fechar</Button>
            {fechamento.status === 'pendente' && (
              <Button 
                onClick={handleFinalizarBanca}
                disabled={isProcessing}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <FileCheck className="h-4 w-4 mr-2" />
                {isProcessing ? 'Finalizando...' : 'Finalizar Fechamento'}
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 