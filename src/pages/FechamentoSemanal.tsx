import React, { useEffect, useState } from 'react';
import { Calendar, Download, FileText, PlusCircle, Printer, RefreshCw, History, ClipboardCheck, User, UserCircle, FileBarChart, ArrowRight, ClipboardList } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DateRangePicker } from "@/components/DateRangePicker";
import { ActionButton } from "@/components/ActionButton";
import { useFechamentoSemanal } from '@/hooks/use-fechamento-semanal';
import { RelatorioFechamento } from '@/components/fechamento/RelatorioFechamento';
import { DetalheFechamentoBanca } from '@/components/fechamento/DetalheFechamentoBanca';
import { FechamentoBanca, RelatorioSemanal } from '@/types/fechamento';
import { useToast } from '@/hooks/use-toast';
import { getCurrentWeekRange } from '@/utils/dateUtils';
import { DateRange } from "react-day-picker";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function FechamentoSemanal() {
  const { relatorio, isLoading, gerarFechamento, finalizarFechamento, finalizarBanca, imprimirComprovante } = useFechamentoSemanal();
  const [selectedFechamento, setSelectedFechamento] = useState<FechamentoBanca | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: getCurrentWeekRange().start,
    to: getCurrentWeekRange().end
  });
  const { toast } = useToast();
  
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState<'atual' | 'historico'>('atual');
  
  // Estado para controlar o relatório histórico selecionado
  const [selectedHistoricoRelatorio, setSelectedHistoricoRelatorio] = useState<RelatorioSemanal | null>(null);
  const [isHistoricoDetailOpen, setIsHistoricoDetailOpen] = useState(false);
  const [isGerandoRelatorio, setIsGerandoRelatorio] = useState(false);
  
  // Mock para histórico de fechamentos (substituir por dados reais)
  const [historicoFechamentos, setHistoricoFechamentos] = useState<RelatorioSemanal[]>([]);

  // Gera o fechamento inicial ao carregar a página
  useEffect(() => {
    if (activeTab === 'atual') {
      handleGerarFechamento();
    } else {
      // Aqui seria o carregamento do histórico de fechamentos
      // Por enquanto vamos usar um mock
      const mockHistorico = [
        {
          id: 'relatorio-2023-W25',
          semana: '2023-W25',
          dataInicio: '19/06/2023',
          dataFim: '25/06/2023',
          fechamentos: [
            {
              id: 'fechamento-banca1-2023-W25',
              idBanca: 'banca1',
              nomeBanca: 'Costura Rápida',
              dataInicio: '19/06/2023',
              dataFim: '25/06/2023',
              fichasEntregues: [],
              totalPecas: 520,
              valorTotal: 7800.50,
              status: 'pago',
              dataPagamento: '26/06/2023'
            },
            {
              id: 'fechamento-banca2-2023-W25',
              idBanca: 'banca2',
              nomeBanca: 'Bordados Maria',
              dataInicio: '19/06/2023',
              dataFim: '25/06/2023',
              fichasEntregues: [],
              totalPecas: 420,
              valorTotal: 5300.20,
              status: 'pago',
              dataPagamento: '26/06/2023'
            },
            {
              id: 'fechamento-banca3-2023-W25',
              idBanca: 'banca3',
              nomeBanca: 'Jeans Premium',
              dataInicio: '19/06/2023',
              dataFim: '25/06/2023',
              fichasEntregues: [],
              totalPecas: 303,
              valorTotal: 2578.20,
              status: 'pago',
              dataPagamento: '26/06/2023'
            }
          ],
          totalPecas: 1243,
          valorTotal: 15678.90,
          status: 'pago',
          dataCriacao: '26/06/2023'
        },
        {
          id: 'relatorio-2023-W24',
          semana: '2023-W24',
          dataInicio: '12/06/2023',
          dataFim: '18/06/2023',
          fechamentos: [
            {
              id: 'fechamento-banca1-2023-W24',
              idBanca: 'banca1',
              nomeBanca: 'Costura Rápida',
              dataInicio: '12/06/2023',
              dataFim: '18/06/2023',
              fichasEntregues: [],
              totalPecas: 410,
              valorTotal: 6200.30,
              status: 'pago',
              dataPagamento: '19/06/2023'
            },
            {
              id: 'fechamento-banca2-2023-W24',
              idBanca: 'banca2',
              nomeBanca: 'Bordados Maria',
              dataInicio: '12/06/2023',
              dataFim: '18/06/2023',
              fichasEntregues: [],
              totalPecas: 370,
              valorTotal: 4580.40,
              status: 'pago',
              dataPagamento: '19/06/2023'
            },
            {
              id: 'fechamento-banca4-2023-W24',
              idBanca: 'banca4',
              nomeBanca: 'Acabamentos Finos',
              dataInicio: '12/06/2023',
              dataFim: '18/06/2023',
              fichasEntregues: [],
              totalPecas: 207,
              valorTotal: 1564.97,
              status: 'pago',
              dataPagamento: '19/06/2023'
            }
          ],
          totalPecas: 987,
          valorTotal: 12345.67,
          status: 'pago',
          dataCriacao: '19/06/2023'
        }
      ] as RelatorioSemanal[];
      setHistoricoFechamentos(mockHistorico);
    }
  }, [activeTab]);

  // Manipulador para gerar um novo fechamento
  const handleGerarFechamento = async () => {
    if (!dateRange.from || !dateRange.to) {
      toast({
        title: "Período incompleto",
        description: "Selecione um período completo para gerar o fechamento.",
        variant: "destructive",
      });
      return;
    }

    await gerarFechamento(dateRange.from, dateRange.to);
  };

  // Manipulador para ver detalhes do fechamento de uma banca
  const handleVerDetalhesBanca = (fechamento: FechamentoBanca) => {
    console.log("Abrindo detalhes da banca:", fechamento);
    
    // Primeiro definimos o fechamento selecionado
    setSelectedFechamento(fechamento);
    
    // Depois abrimos o modal após uma pequena pausa para garantir que o estado foi atualizado
    setTimeout(() => {
      setIsDetailOpen(true);
      console.log("Modal aberto:", { isDetailOpen: true, selectedFechamento: fechamento.id });
    }, 10);
  };

  // Manipulador para fechar o modal de detalhes
  const handleCloseDetails = () => {
    setIsDetailOpen(false);
    setSelectedFechamento(null);
  };
  
  // Manipulador para ver detalhes do relatório histórico
  const handleVerDetalhesHistorico = (relatorio: RelatorioSemanal) => {
    console.log("Abrindo detalhes do relatório histórico:", relatorio);
    
    // Definimos o relatório histórico selecionado
    setSelectedHistoricoRelatorio(relatorio);
    
    // Abrimos o modal após uma pequena pausa
    setTimeout(() => {
      setIsHistoricoDetailOpen(true);
    }, 10);
  };
  
  // Manipulador para fechar o modal de detalhes do histórico
  const handleCloseHistoricoDetails = () => {
    setIsHistoricoDetailOpen(false);
    setSelectedHistoricoRelatorio(null);
  };
  
  // Manipulador para finalizar o fechamento de uma banca específica
  const handleFinalizarFechamentoBanca = async (idBanca: string) => {
    // Implementar a lógica para finalizar o fechamento de uma banca específica
    const resultado = await finalizarBanca(idBanca);
    
    if (resultado) {
      toast({
        title: "Fechamento finalizado",
        description: `O fechamento da banca foi finalizado com sucesso.`,
      });
    } else {
      toast({
        title: "Erro ao finalizar",
        description: "Ocorreu um erro ao finalizar o fechamento da banca.",
        variant: "destructive",
      });
    }
  };
  
  // Manipulador para imprimir o comprovante de uma banca
  const handleImprimirComprovante = async (fechamento: FechamentoBanca) => {
    // Implementar a lógica para gerar e imprimir o comprovante
    try {
      const resultado = await imprimirComprovante(fechamento);
      
      if (resultado) {
        toast({
          title: "Comprovante gerado",
          description: `O comprovante para ${fechamento.nomeBanca} foi gerado com sucesso.`,
        });
      }
    } catch (error) {
      toast({
        title: "Erro ao gerar comprovante",
        description: "Não foi possível gerar o comprovante de fechamento.",
        variant: "destructive",
      });
    }
  };
  
  // Função para gerar relatório histórico detalhado
  const handleGerarRelatorioHistorico = async (relatorio: RelatorioSemanal) => {
    setIsGerandoRelatorio(true);
    try {
      // Importar bibliotecas dinamicamente
      const { default: jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');
      
      // Definir nome do arquivo
      const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
      const nomeArquivo = `Relatorio_Historico_${relatorio.semana}_${dataAtual}`;
      
      // Criar um novo documento PDF
      const doc = new jsPDF();
      
      // Adicionar título
      doc.setFontSize(16);
      doc.text('RELATÓRIO HISTÓRICO DE FECHAMENTO SEMANAL', 105, 15, { align: 'center' });
      
      // Informações do relatório
      doc.setFontSize(12);
      doc.text(`Período: ${relatorio.dataInicio} a ${relatorio.dataFim} (Semana ${relatorio.semana})`, 14, 30);
      doc.text(`Status: ${
        relatorio.status === 'aberto' 
          ? 'Em aberto' 
          : relatorio.status === 'pago' 
            ? 'Pago' 
            : 'Fechado'
      }`, 14, 38);
      doc.text(`Data de criação: ${relatorio.dataCriacao}`, 14, 46);
      
      // Resumo geral
      doc.setFillColor(240, 240, 240);
      doc.rect(14, 55, 182, 25, 'F');
      doc.setFontSize(12);
      doc.text('Resumo Geral', 14, 61);
      doc.text(`Total de Bancas: ${relatorio.fechamentos.length}`, 14, 69);
      doc.text(`Total de Peças: ${relatorio.totalPecas}`, 95, 69);
      doc.text(`Valor Total: ${formatarMoeda(relatorio.valorTotal)}`, 14, 77);
      
      // Tabela detalhada de bancas
      doc.addPage();
      doc.setFontSize(14);
      doc.text('DETALHAMENTO POR BANCA', 105, 15, { align: 'center' });
      
      // Prepara dados para a tabela
      const dadosBancas = relatorio.fechamentos.map(fechamento => [
        fechamento.nomeBanca,
        fechamento.totalPecas.toString(),
        formatarMoeda(fechamento.valorTotal),
        fechamento.status === 'pendente' ? 'Pendente' : 
          fechamento.status === 'pago' ? 'Pago' : 'Cancelado',
        fechamento.dataPagamento || '-'
      ]);
      
      // Adiciona a tabela de bancas
      autoTable(doc, {
        startY: 25,
        head: [['Banca', 'Peças Entregues', 'Valor Pago', 'Status', 'Data Pagamento']],
        body: dadosBancas,
        theme: 'striped',
        headStyles: { fillColor: [66, 66, 66] }
      });
      
      // Adiciona gráficos/estatísticas
      if (relatorio.fechamentos.length > 0) {
        doc.addPage();
        doc.setFontSize(14);
        doc.text('ANÁLISE ESTATÍSTICA DO FECHAMENTO', 105, 15, { align: 'center' });
        
        // Bancas com maiores valores
        const bancasOrdenadasPorValor = [...relatorio.fechamentos].sort((a, b) => b.valorTotal - a.valorTotal);
        
        doc.setFontSize(12);
        doc.text('Distribuição de Valores por Banca', 14, 30);
        
        const dadosValoresBancas = bancasOrdenadasPorValor.map(banca => [
          banca.nomeBanca,
          formatarMoeda(banca.valorTotal),
          `${((banca.valorTotal / relatorio.valorTotal) * 100).toFixed(2)}%`
        ]);
        
        autoTable(doc, {
          startY: 35,
          head: [['Banca', 'Valor', '% do Total']],
          body: dadosValoresBancas,
          theme: 'striped',
          headStyles: { fillColor: [66, 66, 66] }
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
        title: "Relatório histórico gerado",
        description: `O relatório "${nomeArquivo}.pdf" foi gerado com sucesso.`,
      });
    } catch (error) {
      console.error('Erro ao gerar relatório histórico:', error);
      toast({
        title: "Erro ao gerar relatório",
        description: "Ocorreu um erro ao gerar o relatório histórico.",
        variant: "destructive",
      });
    } finally {
      setIsGerandoRelatorio(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-indigo-900">Fechamento Semanal</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie os fechamentos semanais com as bancas
          </p>
        </div>
        <div className="flex items-center gap-4">
          {activeTab === 'atual' && (
            <ActionButton 
              size="sm"
              startIcon={<RefreshCw className="h-4 w-4" />}
              onClick={handleGerarFechamento}
              isLoading={isLoading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              Gerar Fechamento
            </ActionButton>
          )}
        </div>
      </div>

      {/* Cards de navegação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-700">
        <Card 
          className={`border-indigo-200 bg-indigo-50 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer ${activeTab === "atual" ? "ring-2 ring-indigo-400" : "shadow-sm"}`}
          onClick={() => setActiveTab('atual')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-800">Fechamento Atual</CardTitle>
            <ClipboardCheck className="h-5 w-5 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700">
              {relatorio ? formatarMoeda(relatorio.valorTotal) : 'R$ 0,00'}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-indigo-600">
                {relatorio ? `${relatorio.totalPecas} peças entregues` : 'Nenhum fechamento gerado'}
              </p>
              <span className="text-xs text-indigo-600 font-medium flex items-center">
                {activeTab === "atual" ? "Visualizando" : "Ver fechamento"} <ArrowRight className="ml-1 h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`border-blue-200 bg-blue-50 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer ${activeTab === "historico" ? "ring-2 ring-blue-400" : "shadow-sm"}`}
          onClick={() => setActiveTab('historico')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800">Histórico de Fechamentos</CardTitle>
            <History className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">
              {historicoFechamentos.length}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-blue-600">
                Fechamentos anteriores
              </p>
              <span className="text-xs text-blue-600 font-medium flex items-center">
                {activeTab === "historico" ? "Visualizando" : "Ver histórico"} <ArrowRight className="ml-1 h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center text-xs text-gray-500 -mt-2 mb-4 animate-in fade-in">
        Clique nos cards acima para alternar entre o fechamento atual e o histórico
      </div>

      {/* Conteúdo da aba ativa */}
      {activeTab === 'atual' ? (
        <div className="space-y-6">
          {/* Período de fechamento */}
          <Card>
            <CardHeader>
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <CardTitle>Período de Fechamento</CardTitle>
                  <CardDescription>
                    Selecione o período para gerar o fechamento
                  </CardDescription>
                </div>
                <DateRangePicker
                  date={dateRange}
                  onChange={setDateRange}
                />
              </div>
            </CardHeader>
          </Card>

          {/* Relatório de fechamento atual */}
          {relatorio ? (
            <RelatorioFechamento 
              relatorio={relatorio}
              onFinalizar={finalizarFechamento}
              onVerDetalhesBanca={handleVerDetalhesBanca}
              onFinalizarBanca={handleFinalizarFechamentoBanca}
              onImprimirComprovante={handleImprimirComprovante}
              isLoading={isLoading}
            />
          ) : (
            <Card className="p-8 text-center">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Calendar className="h-12 w-12 text-gray-400" />
                <h3 className="text-lg font-medium">Nenhum fechamento gerado</h3>
                <p className="text-sm text-gray-500">
                  Selecione um período e clique em "Gerar Fechamento" para criar um novo relatório.
                </p>
                <Button 
                  onClick={handleGerarFechamento}
                  disabled={isLoading}
                >
                  Gerar Fechamento Agora
                </Button>
              </div>
            </Card>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Histórico de fechamentos */}
          <Card className="bg-white p-6 rounded-lg shadow-sm border animate-in fade-in duration-1000">
            <CardHeader className="px-0 pt-0">
              <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center">
                    <History className="h-5 w-5 text-blue-600 mr-2" />
                    Histórico de Fechamentos
                  </CardTitle>
                  <CardDescription>
                    Visualize todos os fechamentos semanais anteriores
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {historicoFechamentos.length > 0 ? (
                <div className="space-y-6">
                  {historicoFechamentos.map((relatorio) => (
                    <Card key={relatorio.id} className="overflow-hidden">
                      <CardHeader className="bg-gray-50 pb-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg">Semana {relatorio.semana}</CardTitle>
                            <CardDescription>
                              Período: {relatorio.dataInicio} a {relatorio.dataFim}
                            </CardDescription>
                          </div>
                          <Badge 
                            className={relatorio.status === 'aberto' 
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
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="p-3 bg-gray-50 rounded-md">
                            <div className="text-sm text-gray-500">Total de Bancas</div>
                            <div className="text-lg font-bold">{relatorio.fechamentos.length}</div>
                          </div>
                          
                          <div className="p-3 bg-gray-50 rounded-md">
                            <div className="text-sm text-gray-500">Total de Peças</div>
                            <div className="text-lg font-bold">{relatorio.totalPecas.toLocaleString()}</div>
                          </div>
                          
                          <div className="p-3 bg-gray-50 rounded-md">
                            <div className="text-sm text-gray-500">Valor Total</div>
                            <div className="text-lg font-bold text-primary">{formatarMoeda(relatorio.valorTotal)}</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVerDetalhesHistorico(relatorio)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleGerarRelatorioHistorico(relatorio)}
                            disabled={isGerandoRelatorio}
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            {isGerandoRelatorio ? 'Gerando...' : 'Imprimir'}
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <ClipboardList className="h-12 w-12 text-gray-400" />
                    <h3 className="text-lg font-medium">Nenhum histórico encontrado</h3>
                    <p className="text-sm text-gray-500">
                      Não há registros de fechamentos anteriores.
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal de detalhes de banca */}
      {selectedFechamento && (
        <DetalheFechamentoBanca
          key={selectedFechamento.id}
          fechamento={selectedFechamento}
          isOpen={isDetailOpen}
          onClose={handleCloseDetails}
          onFinalizarBanca={handleFinalizarFechamentoBanca}
          onImprimirComprovante={handleImprimirComprovante}
        />
      )}
      
      {/* Modal de detalhes do relatório histórico */}
      {selectedHistoricoRelatorio && (
        <Dialog open={isHistoricoDetailOpen} onOpenChange={(open) => {
          if (!open) handleCloseHistoricoDetails();
        }}>
          <DialogContent className="sm:max-w-5xl max-h-[90vh] p-6 w-[95vw] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-indigo-800">
                Detalhes do Fechamento - Semana {selectedHistoricoRelatorio.semana}
              </DialogTitle>
              <div className="text-sm text-gray-500">
                Período: {selectedHistoricoRelatorio.dataInicio} a {selectedHistoricoRelatorio.dataFim}
              </div>
              <div className="text-sm text-gray-500">
                Status: {selectedHistoricoRelatorio.status === 'aberto' ? 'Em aberto' : 
                         selectedHistoricoRelatorio.status === 'pago' ? 'Pago' : 'Fechado'}
              </div>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500">Total de Bancas</div>
                <div className="text-xl font-bold">{selectedHistoricoRelatorio.fechamentos.length}</div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500">Total de Peças</div>
                <div className="text-xl font-bold">{selectedHistoricoRelatorio.totalPecas.toLocaleString()}</div>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-md">
                <div className="text-sm text-gray-500">Valor Total</div>
                <div className="text-xl font-bold text-primary">{formatarMoeda(selectedHistoricoRelatorio.valorTotal)}</div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">Detalhamento por Banca</h3>
              <div className="overflow-y-auto max-h-[400px]">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banca</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Peças</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Pagamento</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {selectedHistoricoRelatorio.fechamentos.map((fechamento) => (
                      <tr key={fechamento.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{fechamento.nomeBanca}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fechamento.totalPecas}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatarMoeda(fechamento.valorTotal)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{fechamento.dataPagamento || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleGerarRelatorioHistorico(selectedHistoricoRelatorio)}
                disabled={isGerandoRelatorio}
                className="mr-2"
              >
                <Printer className="h-4 w-4 mr-2" />
                {isGerandoRelatorio ? 'Gerando...' : 'Imprimir Relatório'}
              </Button>
              <Button 
                variant="secondary"
                onClick={handleCloseHistoricoDetails}
              >
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Função auxiliar para formatação de moeda
function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
} 