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
      
      // Seção de Chaves PIX
      const bancasComPix = relatorio.fechamentos.filter(f => f.chave_pix);
      if (bancasComPix.length > 0) {
        const finalY3 = (doc as any).lastAutoTable.finalY + 15;
        doc.text('Chaves PIX para Pagamento', 14, finalY3);
        
        const dadosPix = bancasComPix.map(banca => [
          banca.nomeBanca,
          formatarMoeda(banca.valorTotal),
          banca.chave_pix,
          banca.status === 'pendente' ? 'Pendente' : 
            banca.status === 'pago' ? 'Pago' : 'Cancelado'
        ]);
        
        autoTable(doc, {
          startY: finalY3 + 5,
          head: [['Banca', 'Valor', 'Chave PIX', 'Status']],
          body: dadosPix,
          theme: 'striped',
          headStyles: { fillColor: [66, 66, 66] },
          styles: { overflow: 'linebreak' },
          columnStyles: {
            2: { cellWidth: 60 } // Largura maior para coluna da chave PIX
          }
        });
      }
      
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
    <Card className="border border-border hover:shadow-md transition-all animate-in fade-in duration-1000 dark:shadow-lg dark:shadow-black/20 dark:hover:shadow-xl dark:hover:shadow-black/30">
      <CardHeader className="bg-muted/30 border-b border-border dark:bg-muted/20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <CardTitle className="text-xl font-bold text-foreground">
              Relatório de Fechamento Semanal
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Período: {relatorio.dataInicio} a {relatorio.dataFim} (Semana {relatorio.semana})
            </CardDescription>
          </div>
          <Badge 
            className={
              relatorio.status === 'aberto' 
                ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900/50 dark:text-yellow-200 dark:hover:bg-yellow-900/50' 
                : relatorio.status === 'pago'
                  ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/50 dark:text-green-200 dark:hover:bg-green-900/50'
                  : 'bg-blue-100 text-blue-800 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-900/50'
            }
          >
            {relatorio.status === 'aberto' ? 'Em aberto' : 
             relatorio.status === 'pago' ? 'Pago' : 'Fechado'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Resumo geral */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border-blue-200 bg-blue-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-blue-800 dark:bg-blue-950 dark:hover:shadow-lg dark:hover:shadow-black/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Total de Bancas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">{relatorio.fechamentos.length}</div>
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Bancas com fechamento
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-green-800 dark:bg-green-950 dark:hover:shadow-lg dark:hover:shadow-black/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">Total de Peças</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">{relatorio.totalPecas.toLocaleString()}</div>
              <p className="text-xs text-green-600 dark:text-green-400">
                Peças entregues
              </p>
            </CardContent>
          </Card>
          
          <Card className="border-purple-200 bg-purple-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-purple-800 dark:bg-purple-950 dark:hover:shadow-lg dark:hover:shadow-black/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-800 dark:text-purple-200">Valor Total</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{formatarMoeda(relatorio.valorTotal)}</div>
              <p className="text-xs text-purple-600 dark:text-purple-400">
                Valor a receber
              </p>
            </CardContent>
          </Card>
        </div>
        
        {/* Tabela de fechamentos por banca */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-foreground">Fechamento por Banca</h3>
            <div className="text-sm text-muted-foreground">
              {contadorStatus.pagas} de {contadorStatus.total} bancas pagas
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md transition-all dark:shadow-lg dark:shadow-black/20 dark:hover:shadow-xl dark:hover:shadow-black/30">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 dark:bg-muted/30">
                    <TableHead className="text-foreground font-medium">Banca</TableHead>
                    <TableHead className="text-foreground font-medium">Peças Entregues</TableHead>
                    <TableHead className="text-foreground font-medium">Valor a Pagar</TableHead>
                    <TableHead className="text-foreground font-medium">Status</TableHead>
                    <TableHead className="text-right text-foreground font-medium">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {relatorio.fechamentos.map((fechamento) => (
                    <TableRow key={fechamento.id} className="hover:bg-muted/30 transition-colors">
                      <TableCell className="font-medium text-foreground">{fechamento.nomeBanca}</TableCell>
                      <TableCell className="text-muted-foreground">{fechamento.totalPecas.toLocaleString()}</TableCell>
                      <TableCell className="text-muted-foreground font-medium">{formatarMoeda(fechamento.valorTotal)}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            fechamento.status === 'pendente' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' 
                              : fechamento.status === 'pago'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
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
                            className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                            onClick={() => onVerDetalhesBanca(fechamento)}
                            title="Ver detalhes"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="sr-only">Ver detalhes</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-yellow-100 dark:hover:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400"
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
                            className="h-8 w-8 p-0 hover:bg-green-100 dark:hover:bg-green-900/20 text-green-600 dark:text-green-400"
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
              </Table>
            </div>
          </div>
        </div>
        
        {/* Seção de Chaves PIX */}
        {relatorio.fechamentos.some(f => f.chave_pix) && (
          <div className="mt-6 space-y-4">
            <h3 className="text-lg font-medium text-foreground">Chaves PIX para Pagamento</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {relatorio.fechamentos
                .filter(f => f.chave_pix)
                .map((fechamento) => (
                  <Card key={fechamento.id} className="border-green-200 bg-green-50 hover:shadow-md transition-all hover:-translate-y-1 dark:border-green-800 dark:bg-green-950 dark:hover:shadow-lg dark:hover:shadow-black/20">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-sm font-medium text-green-800 dark:text-green-200">{fechamento.nomeBanca}</CardTitle>
                          <CardDescription className="text-green-600 dark:text-green-400">
                            Valor: {formatarMoeda(fechamento.valorTotal)}
                          </CardDescription>
                        </div>
                        <Badge 
                          className={
                            fechamento.status === 'pendente' 
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200' 
                              : fechamento.status === 'pago'
                                ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200'
                          }
                        >
                          {fechamento.status === 'pendente' ? 'Pendente' : 
                           fechamento.status === 'pago' ? 'Pago' : 'Cancelado'}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="p-3 bg-white dark:bg-muted/50 rounded-md border border-green-300 dark:border-green-700/50">
                        <div className="text-xs font-medium text-green-700 dark:text-green-300 mb-1">Chave PIX:</div>
                        <div className="font-mono text-sm text-green-600 dark:text-green-400 break-all">
                          {fechamento.chave_pix}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-6 border-t border-border bg-muted/30 dark:bg-muted/20">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isLoading || isImprimindo}
            onClick={handleImprimirRelatorioGeral}
            className="border-border hover:bg-accent hover:text-accent-foreground"
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
            className="bg-primary hover:bg-primary/90"
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