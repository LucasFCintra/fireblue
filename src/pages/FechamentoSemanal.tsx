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
import { useNotificationToast } from '@/hooks/useNotificationToast';
import { getCurrentWeekRange } from '@/utils/dateUtils';
import { DateRange } from "react-day-picker";
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function FechamentoSemanal() {
  const { 
    relatorio, 
    historicoFechamentos,
    isLoading, 
    isLoadingHistorico,
    gerarFechamento, 
    carregarHistorico,
    buscarFechamentoHistorico,
    finalizarFechamento, 
    finalizarBanca, 
    imprimirComprovante 
  } = useFechamentoSemanal();
  
  const [selectedFechamento, setSelectedFechamento] = useState<FechamentoBanca | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: getCurrentWeekRange().start,
    to: getCurrentWeekRange().end
  });
  const { toast: toastHook } = useToast();
  const { showSuccess, showError, showWarning, showInfo } = useNotificationToast();
  
  // Estado para controlar a aba ativa
  const [activeTab, setActiveTab] = useState<'atual' | 'historico'>('atual');
  
  // Estado para controlar o relatório histórico selecionado
  const [selectedHistoricoRelatorio, setSelectedHistoricoRelatorio] = useState<RelatorioSemanal | null>(null);
  const [isHistoricoDetailOpen, setIsHistoricoDetailOpen] = useState(false);
  const [isGerandoRelatorio, setIsGerandoRelatorio] = useState(false);

  // Gera o fechamento inicial ao carregar a página
  useEffect(() => {
    if (activeTab === 'atual') {
      handleGerarFechamento();
    } else {
      // Carregar histórico de fechamentos
      carregarHistorico();
    }
  }, [activeTab]);

  // Manipulador para gerar um novo fechamento
  const handleGerarFechamento = async () => {
    if (!dateRange.from || !dateRange.to) {
      showWarning("Selecione um período completo para gerar o fechamento.", {
        description: "Período incompleto"
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
  const handleVerDetalhesHistorico = async (relatorio: RelatorioSemanal) => {
    console.log("Abrindo detalhes do relatório histórico:", relatorio);
    
    try {
      // Buscar detalhes completos do fechamento
      const fechamentoCompleto = await buscarFechamentoHistorico(relatorio.id);
      
      if (fechamentoCompleto) {
        setSelectedHistoricoRelatorio(fechamentoCompleto);
        setIsHistoricoDetailOpen(true);
      } else {
        showError("Não foi possível carregar os detalhes do fechamento.", {
          description: "Erro ao carregar detalhes"
        });
      }
    } catch (error) {
      console.error('Erro ao buscar detalhes do fechamento:', error);
      showError("Ocorreu um erro ao carregar os detalhes do fechamento.", {
        description: "Erro ao carregar detalhes"
      });
    }
  };
  
  // Manipulador para fechar o modal de detalhes do histórico
  const handleCloseHistoricoDetails = () => {
    setIsHistoricoDetailOpen(false);
    setSelectedHistoricoRelatorio(null);
  };
  
  // Manipulador para finalizar o fechamento de uma banca específica
  const handleFinalizarFechamentoBanca = async (idBanca: string) => {
    const resultado = await finalizarBanca(idBanca);
    
    if (resultado) {
      showSuccess("O fechamento da banca foi finalizado com sucesso.", {
        description: "Fechamento finalizado"
      });
    } else {
      showError("Ocorreu um erro ao finalizar o fechamento da banca.", {
        description: "Erro ao finalizar"
      });
    }
  };
  
  // Manipulador para imprimir o comprovante de uma banca
  const handleImprimirComprovante = async (fechamento: FechamentoBanca) => {
    try {
      const resultado = await imprimirComprovante(fechamento);
      
      if (resultado) {
        showSuccess(`O comprovante para ${fechamento.nomeBanca} foi gerado com sucesso.`, {
          description: "Comprovante gerado"
        });
      }
    } catch (error) {
      showError("Não foi possível gerar o comprovante de fechamento.", {
        description: "Erro ao gerar comprovante"
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
      
      showSuccess(`O relatório "${nomeArquivo}.pdf" foi gerado com sucesso.`, {
        description: "Relatório histórico gerado"
      });
    } catch (error) {
      console.error('Erro ao gerar relatório histórico:', error);
      showError("Ocorreu um erro ao gerar o relatório histórico.", {
        description: "Erro ao gerar relatório"
      });
    } finally {
      setIsGerandoRelatorio(false);
    }
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Fechamento Semanal</h1>
          <p className="text-sm text-muted-foreground mt-1">
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
              className="bg-indigo-600 hover:bg-indigo-700 shadow-sm dark:shadow-md dark:shadow-black/20"
            >
              Gerar Fechamento
            </ActionButton>
          )}
        </div>
      </div>

      {/* Cards de navegação */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-700">
        <Card 
          className={`border-indigo-200 bg-indigo-50 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer dark:border-indigo-800 dark:bg-indigo-950/50 dark:hover:shadow-lg dark:hover:shadow-black/20 ${activeTab === "atual" ? "ring-2 ring-indigo-400 dark:ring-indigo-500" : "shadow-sm"}`}
          onClick={() => setActiveTab('atual')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-indigo-800 dark:text-indigo-200">Fechamento Atual</CardTitle>
            <ClipboardCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-700 dark:text-indigo-300">
              {relatorio ? formatarMoeda(relatorio.valorTotal) : 'R$ 0,00'}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-indigo-600 dark:text-indigo-400">
                {relatorio ? `${relatorio.totalPecas} peças entregues` : 'Nenhum fechamento gerado'}
              </p>
              <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium flex items-center">
                {activeTab === "atual" ? "Visualizando" : "Ver fechamento"} <ArrowRight className="ml-1 h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className={`border-blue-200 bg-blue-50 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer dark:border-blue-800 dark:bg-blue-950/50 dark:hover:shadow-lg dark:hover:shadow-black/20 ${activeTab === "historico" ? "ring-2 ring-blue-400 dark:ring-blue-500" : "shadow-sm"}`}
          onClick={() => setActiveTab('historico')}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-800 dark:text-blue-200">Histórico de Fechamentos</CardTitle>
            <History className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {historicoFechamentos.length}
            </div>
            <div className="flex justify-between items-center">
              <p className="text-xs text-blue-600 dark:text-blue-400">
                Fechamentos anteriores
              </p>
              <span className="text-xs text-blue-600 dark:text-blue-400 font-medium flex items-center">
                {activeTab === "historico" ? "Visualizando" : "Ver histórico"} <ArrowRight className="ml-1 h-3 w-3" />
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="text-center text-xs text-muted-foreground -mt-2 mb-4 animate-in fade-in">
        Clique nos cards acima para alternar entre o fechamento atual e o histórico
      </div>

      {/* Conteúdo da aba ativa */}
      {activeTab === 'atual' ? (
        <div className="space-y-6">
          {/* Período de fechamento */}
          <Card className="border border-border hover:shadow-md transition-all dark:shadow-lg dark:shadow-black/20">
            <CardHeader className="bg-muted/30 border-b border-border dark:bg-muted/20">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div>
                  <CardTitle className="text-foreground">Período de Fechamento</CardTitle>
                  <CardDescription className="text-muted-foreground">
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
            <Card className="p-8 text-center border border-border hover:shadow-md transition-all dark:shadow-lg dark:shadow-black/20">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Calendar className="h-12 w-12 text-muted-foreground" />
                <h3 className="text-lg font-medium text-foreground">Nenhum fechamento gerado</h3>
                <p className="text-sm text-muted-foreground">
                  Selecione um período e clique em "Gerar Fechamento" para criar um novo relatório.
                </p>
                <Button 
                  onClick={handleGerarFechamento}
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 shadow-sm dark:shadow-md dark:shadow-black/20"
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
          <Card className="border border-border hover:shadow-md transition-all dark:shadow-lg dark:shadow-black/20 animate-in fade-in duration-1000">
            <CardHeader className="px-0 pt-0 bg-muted/30 border-b border-border dark:bg-muted/20">
              <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center p-6">
                <div>
                  <CardTitle className="text-xl font-bold flex items-center text-foreground">
                    <History className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-2" />
                    Histórico de Fechamentos
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Visualize todos os fechamentos semanais anteriores
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {isLoadingHistorico ? (
                <div className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4">
                    <RefreshCw className="h-12 w-12 text-muted-foreground animate-spin" />
                    <h3 className="text-lg font-medium text-foreground">Carregando histórico...</h3>
                  </div>
                </div>
              ) : historicoFechamentos.length > 0 ? (
                <div className="space-y-6 p-6">
                  {historicoFechamentos.map((relatorio) => (
                    <Card key={relatorio.id} className="overflow-hidden border border-border hover:shadow-md transition-all dark:shadow-lg dark:shadow-black/20">
                      <CardHeader className="bg-muted/30 border-b border-border dark:bg-muted/20 pb-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle className="text-lg text-foreground">Semana {relatorio.semana}</CardTitle>
                            <CardDescription className="text-muted-foreground">
                              Período: {relatorio.dataInicio} a {relatorio.dataFim}
                            </CardDescription>
                          </div>
                          <Badge 
                            className={relatorio.status === 'aberto' 
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
                      <CardContent className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                          <div className="p-3 bg-muted/50 rounded-md border border-border dark:bg-muted/30">
                            <div className="text-sm text-muted-foreground">Total de Bancas</div>
                            <div className="text-lg font-bold text-foreground">{relatorio.fechamentos.length}</div>
                          </div>
                          
                          <div className="p-3 bg-muted/50 rounded-md border border-border dark:bg-muted/30">
                            <div className="text-sm text-muted-foreground">Total de Peças</div>
                            <div className="text-lg font-bold text-foreground">{relatorio.totalPecas.toLocaleString()}</div>
                          </div>
                          
                          <div className="p-3 bg-muted/50 rounded-md border border-border dark:bg-muted/30">
                            <div className="text-sm text-muted-foreground">Valor Total</div>
                            <div className="text-lg font-bold text-primary">{formatarMoeda(relatorio.valorTotal)}</div>
                          </div>
                        </div>
                        
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleVerDetalhesHistorico(relatorio)}
                            className="border-border hover:bg-accent hover:text-accent-foreground"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Ver Detalhes
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleGerarRelatorioHistorico(relatorio)}
                            disabled={isGerandoRelatorio}
                            className="border-border hover:bg-accent hover:text-accent-foreground"
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
                    <ClipboardList className="h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-medium text-foreground">Nenhum histórico encontrado</h3>
                    <p className="text-sm text-muted-foreground">
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
          <DialogContent className="sm:max-w-5xl max-h-[90vh] p-6 w-[95vw] overflow-hidden border border-border dark:shadow-xl dark:shadow-black/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold text-foreground">
                Detalhes do Fechamento - Semana {selectedHistoricoRelatorio.semana}
              </DialogTitle>
              <div className="text-sm text-muted-foreground">
                Período: {selectedHistoricoRelatorio.dataInicio} a {selectedHistoricoRelatorio.dataFim}
              </div>
              <div className="text-sm text-muted-foreground">
                Status: {selectedHistoricoRelatorio.status === 'aberto' ? 'Em aberto' : 
                         selectedHistoricoRelatorio.status === 'pago' ? 'Pago' : 'Fechado'}
              </div>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 bg-muted/50 rounded-md border border-border dark:bg-muted/30">
                <div className="text-sm text-muted-foreground">Total de Bancas</div>
                <div className="text-xl font-bold text-foreground">{selectedHistoricoRelatorio.fechamentos.length}</div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-md border border-border dark:bg-muted/30">
                <div className="text-sm text-muted-foreground">Total de Peças</div>
                <div className="text-xl font-bold text-foreground">{selectedHistoricoRelatorio.totalPecas.toLocaleString()}</div>
              </div>
              
              <div className="p-4 bg-muted/50 rounded-md border border-border dark:bg-muted/30">
                <div className="text-sm text-muted-foreground">Valor Total</div>
                <div className="text-xl font-bold text-primary">{formatarMoeda(selectedHistoricoRelatorio.valorTotal)}</div>
              </div>
            </div>
            
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2 text-foreground">Detalhamento por Banca</h3>
              <div className="overflow-y-auto max-h-[400px] border border-border rounded-md">
                <table className="min-w-full divide-y divide-border">
                  <thead className="bg-muted/50 dark:bg-muted/30 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Banca</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Peças</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Valor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Data Pagamento</th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-border">
                    {selectedHistoricoRelatorio.fechamentos.map((fechamento) => (
                      <tr key={fechamento.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{fechamento.nomeBanca}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{fechamento.totalPecas}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{formatarMoeda(fechamento.valorTotal)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
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
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{fechamento.dataPagamento || '-'}</td>
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
                className="mr-2 border-border hover:bg-accent hover:text-accent-foreground"
              >
                <Printer className="h-4 w-4 mr-2" />
                {isGerandoRelatorio ? 'Gerando...' : 'Imprimir Relatório'}
              </Button>
              <Button 
                variant="secondary"
                onClick={handleCloseHistoricoDetails}
                className="bg-muted hover:bg-muted/80 text-muted-foreground"
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