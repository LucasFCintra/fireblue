import { useState, useCallback } from 'react';
import { RelatorioSemanal } from '@/types/fechamento';
import { 
  gerarRelatorioSemanal, 
  salvarRelatorioSemanal, 
  finalizarFechamentoSemanal 
} from '@/services/fechamentoService';
import { useToast } from './use-toast';

export function useFechamentoSemanal() {
  const [relatorio, setRelatorio] = useState<RelatorioSemanal | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Gera um novo relatório de fechamento semanal
   */
  const gerarFechamento = useCallback(async (dataInicio?: Date, dataFim?: Date) => {
    setIsLoading(true);
    try {
      // Gerar o relatório com os dados do período
      const novoRelatorio = gerarRelatorioSemanal(dataInicio, dataFim);
      setRelatorio(novoRelatorio);
      return novoRelatorio;
    } catch (error) {
      console.error('Erro ao gerar fechamento:', error);
      toast({
        title: "Erro ao gerar fechamento",
        description: "Ocorreu um erro ao gerar o relatório de fechamento.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  /**
   * Salva o relatório atual
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
      const resultado = await salvarRelatorioSemanal(relatorio);
      if (resultado) {
        toast({
          title: "Relatório salvo",
          description: "O relatório de fechamento foi salvo com sucesso.",
        });
      }
      return resultado;
    } catch (error) {
      console.error('Erro ao salvar fechamento:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o relatório de fechamento.",
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

    setIsLoading(true);
    try {
      const resultado = await finalizarFechamentoSemanal(relatorio.id);
      if (resultado) {
        // Atualiza o status do relatório para fechado
        setRelatorio({
          ...relatorio,
          status: 'fechado'
        });
        
        toast({
          title: "Fechamento finalizado",
          description: "O fechamento semanal foi finalizado com sucesso.",
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

  return {
    relatorio,
    isLoading,
    gerarFechamento,
    salvarFechamento,
    finalizarFechamento,
  };
} 