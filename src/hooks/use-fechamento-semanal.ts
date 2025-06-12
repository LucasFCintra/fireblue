import { useState, useCallback } from 'react';
import { 
  gerarRelatorioSemanal, 
  salvarFechamentoSemanal,
  finalizarFechamentoSemanal,
  finalizarFechamentoBanca,
  gerarComprovantePDF
} from '@/services/fechamentoService';
import { FechamentoBanca, RelatorioSemanal } from '@/types/fechamento';
import { useToast } from '@/hooks/use-toast';

export function useFechamentoSemanal() {
  const [relatorio, setRelatorio] = useState<RelatorioSemanal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Gera o fechamento semanal para o período informado
   */
  const gerarFechamento = useCallback(async (dataInicio?: Date, dataFim?: Date) => {
    setIsLoading(true);
    try {
      const resultado = gerarRelatorioSemanal(dataInicio, dataFim);
      setRelatorio(resultado);
      
      toast({
        title: "Fechamento gerado",
        description: `Fechamento gerado para o período de ${resultado.dataInicio} a ${resultado.dataFim}.`,
      });
      
      return resultado;
    } catch (error) {
      console.error('Erro ao gerar fechamento:', error);
      toast({
        title: "Erro ao gerar fechamento",
        description: "Ocorreu um erro ao gerar o fechamento semanal.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Salva o fechamento semanal atual
   */
  const salvarFechamento = useCallback(async () => {
    if (!relatorio) {
      toast({
        title: "Nenhum relatório para salvar",
        description: "Gere um relatório de fechamento primeiro.",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const resultado = await salvarFechamentoSemanal(relatorio);
      if (resultado) {
        toast({
          title: "Fechamento salvo",
          description: "O fechamento semanal foi salvo com sucesso.",
        });
      }
      return resultado;
    } catch (error) {
      console.error('Erro ao salvar fechamento:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o fechamento semanal.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [relatorio, toast]);

  /**
   * Finaliza o fechamento semanal atual
   */
  const finalizarFechamento = useCallback(async () => {
    if (!relatorio) {
      toast({
        title: "Nenhum relatório para finalizar",
        description: "Gere um relatório de fechamento primeiro.",
        variant: "destructive",
      });
      return false;
    }

    // Verifica se todas as bancas estão pagas
    const todasBancasPagas = relatorio.fechamentos.length > 0 && 
                            relatorio.fechamentos.every(fechamento => fechamento.status === 'pago');
    
    if (!todasBancasPagas) {
      toast({
        title: "Não é possível finalizar",
        description: "Todas as bancas devem estar pagas para finalizar o fechamento semanal.",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const resultado = await finalizarFechamentoSemanal(relatorio.id);
      if (resultado) {
        // Atualiza o status do relatório para pago
        setRelatorio({
          ...relatorio,
          status: 'pago'
        });
        
        toast({
          title: "Fechamento finalizado",
          description: "O fechamento semanal foi finalizado e marcado como pago com sucesso.",
        });
      }
      return resultado;
    } catch (error) {
      console.error('Erro ao finalizar fechamento:', error);
      toast({
        title: "Erro ao finalizar",
        description: "Ocorreu um erro ao finalizar o fechamento semanal.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [relatorio, toast]);

  /**
   * Finaliza o fechamento de uma banca específica
   */
  const finalizarBanca = useCallback(async (idBanca: string) => {
    if (!relatorio) {
      toast({
        title: "Nenhum relatório disponível",
        description: "Gere um relatório de fechamento primeiro.",
        variant: "destructive",
      });
      return false;
    }

    setIsLoading(true);
    try {
      const resultado = await finalizarFechamentoBanca(relatorio.id, idBanca);
      if (resultado) {
        // Encontra o fechamento da banca para atualizar
        const fechamentosAtualizados = [...relatorio.fechamentos];
        const index = fechamentosAtualizados.findIndex(f => f.idBanca === idBanca);
        
        if (index !== -1) {
          // Cria um novo objeto para o fechamento atualizado
          const fechamentoAtualizado: FechamentoBanca = {
            ...fechamentosAtualizados[index],
            status: 'pago',
            dataPagamento: new Date().toLocaleDateString('pt-BR')
          };
          
          // Substitui o fechamento no array
          fechamentosAtualizados[index] = fechamentoAtualizado;
          
          // Atualiza o relatório
          setRelatorio({
            ...relatorio,
            fechamentos: fechamentosAtualizados
          });
          
          toast({
            title: "Fechamento de banca finalizado",
            description: "O fechamento da banca foi finalizado com sucesso.",
          });
        }
      }
      return resultado;
    } catch (error) {
      console.error('Erro ao finalizar banca:', error);
      toast({
        title: "Erro ao finalizar",
        description: "Ocorreu um erro ao finalizar o fechamento da banca.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [relatorio, toast]);

  /**
   * Gera e imprime o comprovante de fechamento para uma banca
   */
  const imprimirComprovante = useCallback(async (fechamento: FechamentoBanca) => {
    setIsLoading(true);
    try {
      // Gera o comprovante PDF
      const nomeArquivo = await gerarComprovantePDF(fechamento);
      
      // Em um ambiente real, aqui seria iniciada a impressão ou download do PDF
      
      toast({
        title: "Comprovante gerado",
        description: `O comprovante "${nomeArquivo}.pdf" para ${fechamento.nomeBanca} foi gerado com sucesso.`,
      });
      
      return nomeArquivo;
    } catch (error) {
      console.error('Erro ao gerar comprovante:', error);
      toast({
        title: "Erro ao gerar comprovante",
        description: "Ocorreu um erro ao gerar o comprovante.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  return {
    relatorio,
    isLoading,
    gerarFechamento,
    finalizarFechamento,
    finalizarBanca,
    imprimirComprovante
  };
} 