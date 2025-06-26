import React, { useState, useMemo } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Printer, FileCheck, Receipt } from "lucide-react";
import { FechamentoBanca, RelatorioSemanal } from '@/types/fechamento';
import { useToast } from '@/hooks/use-toast';

interface RelatorioFechamentoProps {
  relatorio: RelatorioSemanal;
  onFinalizar: () => void;
  onVerDetalhesBanca: (fechamento: FechamentoBanca) => void;
  onFinalizarBanca: (idBanca: string) => void;
  onImprimirComprovante: (fechamento: FechamentoBanca) => void;
  isLoading: boolean;
}

export const RelatorioFechamento: React.FC<RelatorioFechamentoProps> = ({
  relatorio,
  onFinalizar,
  onVerDetalhesBanca,
  onFinalizarBanca,
  onImprimirComprovante,
  isLoading
}) => {
  const [isImprimindo, setIsImprimindo] = useState(false);
  const { toast } = useToast();

  // Verifica se todas as bancas estão com status "pago"
  const todasBancasPagas = useMemo(() => {
    return relatorio.fechamentos.length > 0 && 
           relatorio.fechamentos.every(fechamento => fechamento.status === 'pago');
  }, [relatorio.fechamentos]);

  // Verifica se há alguma banca pendente
  const existemBancasPendentes = useMemo(() => {
    return relatorio.fechamentos.some(fechamento => fechamento.status === 'pendente');
  }, [relatorio.fechamentos]);

  // Contadores para status das bancas
  const contadorStatus = useMemo(() => {
    const total = relatorio.fechamentos.length;
    const pagas = relatorio.fechamentos.filter(f => f.status === 'pago').length;
    const pendentes = relatorio.fechamentos.filter(f => f.status === 'pendente').length;
    
    return {
      total,
      pagas,
      pendentes,
      percentualConcluido: total > 0 ? Math.round((pagas / total) * 100) : 0
    };
  }, [relatorio.fechamentos]);

  // Função para formatar valor em reais
  const formatarMoeda = (valor: number) => {
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    });
  };

  // Função para imprimir o relatório geral
  const handleImprimirRelatorioGeral = async () => {
    setIsImprimindo(true);
    try {
      // Importar bibliotecas dinamicamente
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      // Definir nome do arquivo
      const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const nomeArquivo = `Relatorio_Geral_Fechamento_Semanal_${relatorio.semana}_${dataAtual}`;
      
      // Criar um novo documento PDF
      const doc = new jsPDF();
      
      // Adicionar título
      doc.setFontSize(16);
      doc.text('RELATÓRIO GERAL DE FECHAMENTO SEMANAL', 105, 15, { align: 'center' });
      
      // Informações do relatório
      doc.setFontSize(12);
      doc.text(`Período: ${relatorio.dataInicio} a ${relatorio.dataFim} (Semana ${relatorio.semana})`, 14, 30);
      doc.text(`Status: ${relatorio.status === 'aberto' ? 'Em aberto' : 'Fechado'}`, 14, 38);
      doc.text(`Data de criação: ${relatorio.dataCriacao}`, 14, 46);
      
      // Resumo geral
      doc.setFillColor(240, 240, 240);
      doc.rect(14, 55, 182, 25, 'F');
      doc.setFontSize(12);
      doc.text('Resumo Geral', 14, 61);
      doc.text(`Total de Bancas: ${relatorio.fechamentos.length}`, 14, 69);
      doc.text(`Total de Peças: ${relatorio.totalPecas}`, 95, 69);
      doc.text(`Valor Total: ${formatarMoeda(relatorio.valorTotal)}`, 14, 77);
      
      // Tabela de bancas
      doc.addPage();
      doc.setFontSize(14);
      doc.text('FECHAMENTO POR BANCA', 105, 15, { align: 'center' });
      
      // Prepara dados para a tabela
      const dadosBancas = relatorio.fechamentos.map(fechamento => [
        fechamento.nomeBanca,
        fechamento.totalPecas.toString(),
        formatarMoeda(fechamento.valorTotal),
        fechamento.status === 'pendente' ? 'Pendente' : 
        fechamento.status === 'pago' ? 'Pago' : 'Cancelado'
      ]);
      
      // Adiciona a tabela de bancas
      autoTable(doc, {
        startY: 25,
        head: [['Banca', 'Peças Entregues', 'Valor a Pagar', 'Status']],
        body: dadosBancas,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      // Adiciona página com estatísticas
      doc.addPage();
      doc.setFontSize(14);
      doc.text('ANÁLISE ESTATÍSTICA DO FECHAMENTO', 105, 15, { align: 'center' });
      
      // Calcula estatísticas
      const bancoOrdenadosPorValor = [...relatorio.fechamentos].sort((a, b) => b.valorTotal - a.valorTotal);
      const bancasMaioresValores = bancoOrdenadosPorValor.slice(0, 5);
      
      const bancasOrdenadasPorPecas = [...relatorio.fechamentos].sort((a, b) => b.totalPecas - a.totalPecas);
      const bancasMaioresPecas = bancasOrdenadasPorPecas.slice(0, 5);
      
      // Status de pagamento
      const totalBancas = relatorio.fechamentos.length;
      const bancasPagas = relatorio.fechamentos.filter(f => f.status === 'pago').length;
      const bancasPendentes = relatorio.fechamentos.filter(f => f.status === 'pendente').length;
      
      // Tabela de maiores valores
      doc.setFontSize(12);
      doc.text('Bancas com Maiores Valores', 14, 30);
      
      const dadosMaioresValores = bancasMaioresValores.map(banca => [
        banca.nomeBanca,
        formatarMoeda(banca.valorTotal),
        `${((banca.valorTotal / relatorio.valorTotal) * 100).toFixed(2)}%`
      ]);
      
      autoTable(doc, {
        startY: 35,
        head: [['Banca', 'Valor', '% do Total']],
        body: dadosMaioresValores,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      // Tabela de maiores quantidades
      const finalY1 = (doc as any).lastAutoTable.finalY + 15;
      doc.text('Bancas com Maiores Quantidades de Peças', 14, finalY1);
      
      const dadosMaioresPecas = bancasMaioresPecas.map(banca => [
        banca.nomeBanca,
        banca.totalPecas.toString(),
        `${((banca.totalPecas / relatorio.totalPecas) * 100).toFixed(2)}%`
      ]);
      
      autoTable(doc, {
        startY: finalY1 + 5,
        head: [['Banca', 'Quantidade', '% do Total']],
        body: dadosMaioresPecas,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      // Status de pagamento
      const finalY2 = (doc as any).lastAutoTable.finalY + 15;
      doc.text('Status de Pagamento', 14, finalY2);
      
      const dadosStatus = [
        ['Pagas', bancasPagas.toString(), `${((bancasPagas / totalBancas) * 100).toFixed(2)}%`],
        ['Pendentes', bancasPendentes.toString(), `${((bancasPendentes / totalBancas) * 100).toFixed(2)}%`],
        ['Total', totalBancas.toString(), '100%']
      ];
      
      autoTable(doc, {
        startY: finalY2 + 5,
        head: [['Status', 'Quantidade', 'Percentual']],
        body: dadosStatus,
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
      
      // Salvar o PDF
      doc.save(`${nomeArquivo}.pdf`);
      
      toast({
        title: "Relatório gerado",
        description: `O relatório "${nomeArquivo}.pdf" foi gerado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao gerar o relatório geral de fechamento.",
        variant: "destructive",
      });
    } finally {
      setIsImprimindo(false);
    }
  };

  return (
    <Card className="w-full bg-white p-6 rounded-lg shadow-sm border animate-in fade-in duration-1000">
      <CardHeader className="px-0 pt-0">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <CardTitle className="text-xl font-bold">
              Relatório de Fechamento Semanal
            </CardTitle>
            <CardDescription>
              Período: {relatorio.dataInicio} a {relatorio.dataFim} (Semana {relatorio.semana})
            </CardDescription>
          </div>
          <Badge 
            className={
              relatorio.status === 'aberto' 
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' 
                : relatorio.status === 'pago'
                  ? 'bg-green-100 text-green-800 hover:bg-green-100'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-100'
            }
          >
            {relatorio.status === 'aberto' ? 'Em aberto' : 
             relatorio.status === 'pago' ? 'Pago' : 'Fechado'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="px-0">
        {/* Resumo geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Total de Bancas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{relatorio.fechamentos.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Total de Peças</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{relatorio.totalPecas.toLocaleString()}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{formatarMoeda(relatorio.valorTotal)}</p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabela de fechamentos por banca */}
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-4">Fechamento por Banca</h3>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Banca</TableHead>
                  <TableHead>Peças Entregues</TableHead>
                  <TableHead>Valor a Pagar</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {relatorio.fechamentos.map((fechamento) => (
                  <TableRow key={fechamento.id}>
                    <TableCell className="font-medium">{fechamento.nomeBanca}</TableCell>
                    <TableCell>{fechamento.totalPecas.toLocaleString()}</TableCell>
                    <TableCell>{formatarMoeda(fechamento.valorTotal)}</TableCell>
                    <TableCell>
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
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onVerDetalhesBanca(fechamento)}
                          title="Ver detalhes"
                        >
                          <FileText className="h-4 w-4" />
                          <span className="sr-only">Ver detalhes</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onImprimirComprovante(fechamento)}
                          title="Imprimir comprovante"
                          disabled={relatorio.status === 'fechado' || fechamento.status === 'pago'}
                        >
                          <Receipt className="h-4 w-4" />
                          <span className="sr-only">Imprimir comprovante</span>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => onFinalizarBanca(fechamento.idBanca)}
                          title="Finalizar fechamento"
                          disabled={relatorio.status === 'fechado' || fechamento.status === 'pago'}
                        >
                          <FileCheck className="h-4 w-4" />
                          <span className="sr-only">Finalizar fechamento</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
              <TableCaption>
                Total de {relatorio.fechamentos.length} bancas com fechamento na semana.
              </TableCaption>
            </Table>
          </div>
        </div>
        
        {/* Seção de Chaves PIX */}
        {relatorio.fechamentos.some(f => f.chave_pix) && (
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-4">Chaves PIX para Pagamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatorio.fechamentos
                .filter(f => f.chave_pix)
                .map((fechamento) => (
                  <Card key={fechamento.id} className="p-4 border-green-200 bg-green-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-semibold text-green-800">{fechamento.nomeBanca}</h4>
                        <p className="text-sm text-green-600 mb-2">
                          Valor: {formatarMoeda(fechamento.valorTotal)}
                        </p>
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
                    <div className="mt-2 p-2 bg-white rounded border border-green-300">
                      <span className="text-xs font-medium text-green-700">Chave PIX:</span>
                      <div className="font-mono text-sm text-green-600 break-all mt-1">
                        {fechamento.chave_pix}
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-6 px-0 pb-0 border-t mt-6">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isLoading || isImprimindo}
            onClick={handleImprimirRelatorioGeral}
          >
            <Printer className="h-4 w-4 mr-2" />
            {isImprimindo ? 'Gerando...' : 'Imprimir Relatório'}
          </Button>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="default"
            disabled={isLoading || relatorio.status !== 'aberto' || !todasBancasPagas || existemBancasPendentes}
            onClick={onFinalizar}
            className="bg-indigo-600 hover:bg-indigo-700"
            title={!todasBancasPagas ? "Todas as bancas devem estar pagas para finalizar o fechamento" : ""}
          >
            {todasBancasPagas 
              ? "Finalizar Fechamento" 
              : `Aguardando Bancas (${contadorStatus.pagas}/${contadorStatus.total})`}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}; 