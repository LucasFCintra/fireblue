import axios from 'axios';
import { Ficha } from "@/components/FichasStatusModal";
import { bancasMock } from "@/data/bancasMock";
import { fichasRecebidas } from "@/data/fichasMock";
import { Banca, FechamentoBanca, FichaFechamento, RelatorioSemanal } from "@/types/fechamento";
import { formatDateBR, getCurrentWeekRange, getWeekString, parseDate } from "@/utils/dateUtils";

const API_URL = 'http://26.203.75.236:8687/api';

/**
 * Filtra as fichas recebidas no período especificado
 */
export function filtrarFichasNoPeriodo(
  fichas: Ficha[],
  dataInicio: Date,
  dataFim: Date
): Ficha[] {
  return fichas.filter(ficha => {
    // Converte a string de data para objeto Date
    const dataRecebimento = parseDate(ficha.dataEntrada);
    
    // Verifica se a data de recebimento está dentro do período
    return dataRecebimento >= dataInicio && dataRecebimento <= dataFim;
  });
}

/**
 * Obtém todas as bancas que possuem fichas no período
 */
export function obterBancasComFichasNoPeriodo(
  fichas: Ficha[]
): Banca[] {
  // Obtém os nomes únicos das bancas das fichas
  const nomesBancas = [...new Set(fichas.map(ficha => ficha.banca))];
  
  // Filtra as bancas pelo nome
  return bancasMock.filter(banca => nomesBancas.includes(banca.nome));
}

/**
 * Calcula o valor a ser pago para cada ficha
 */
export function calcularValorFichas(
  fichas: Ficha[],
  banca: Banca
): FichaFechamento[] {
  return fichas
    .filter(ficha => ficha.banca === banca.nome)
    .map(ficha => {
      // Usa o valor padrão da banca por peça ou um valor fixo se não estiver definido
      const valorUnitario = banca.valorPorPeca || 5.0;
      const valorTotal = valorUnitario * ficha.quantidade;
      
      return {
        ...ficha,
        valorUnitario,
        valorTotal
      };
    });
}

/**
 * Gera o fechamento para uma banca específica
 */
export function gerarFechamentoBanca(
  banca: Banca,
  fichas: Ficha[],
  dataInicio: Date,
  dataFim: Date
): FechamentoBanca {
  // Calcula as fichas com valores para esta banca
  const fichasFechamento = calcularValorFichas(
    fichas.filter(ficha => ficha.banca === banca.nome),
    banca
  );
  
  // Calcula o total de peças e valor
  const totalPecas = fichasFechamento.reduce((sum, ficha) => sum + ficha.quantidade, 0);
  const valorTotal = fichasFechamento.reduce((sum, ficha) => sum + ficha.valorTotal, 0);
  
  return {
    id: `fechamento-${banca.id}-${getWeekString(dataInicio)}`,
    idBanca: banca.id,
    nomeBanca: banca.nome,
    dataInicio: formatDateBR(dataInicio),
    dataFim: formatDateBR(dataFim),
    fichasEntregues: fichasFechamento,
    totalPecas,
    valorTotal,
    status: 'pendente'
  };
}

/**
 * Gera um relatório semanal de fechamento
 */
export async function gerarRelatorioSemanal(dataInicio?: Date, dataFim?: Date): Promise<RelatorioSemanal> {
  try {
    console.log('gerarRelatorioSemanal: '+ dataInicio + ' '+ dataFim)
    const response = await axios.post(`${API_URL}/fechamentos/gerar`, {
      dataInicio: dataInicio?.toISOString().split('T')[0],
      dataFim: dataFim?.toISOString().split('T')[0]
    });
    
    const fechamento = response.data;
    console.log(fechamento)
    
    // Converter para o formato esperado pelo frontend
    return {
      id: fechamento.id,
      semana: fechamento.semana,
      dataInicio: formatarData(fechamento.data_inicio),
      dataFim: formatarData(fechamento.data_fim),
      totalPecas: fechamento.total_pecas,
      valorTotal: fechamento.valor_total,
      status: fechamento.status,
      dataCriacao: formatarData(fechamento.data_criacao),
      fechamentos: fechamento.fechamentos.map((fechamentoBanca: any) => ({
        id: fechamentoBanca.id,
        idBanca: fechamentoBanca.banca_id.toString(),
        nomeBanca: fechamentoBanca.nome_banca,
        dataInicio: formatarData(fechamentoBanca.data_inicio),
        dataFim: formatarData(fechamentoBanca.data_fim),
        totalPecas: fechamentoBanca.total_pecas,
        valorTotal: fechamentoBanca.valor_total,
        status: fechamentoBanca.status,
        dataPagamento: fechamentoBanca.data_pagamento ? formatarData(fechamentoBanca.data_pagamento) : undefined,
        fichasEntregues: fechamentoBanca.itens?.map((item: any) => ({
          id: item.id,
          codigo: item.codigo_ficha,
          dataEntrada: formatarData(item.data_entrada),
          descricao: item.produto,
          quantidade: item.quantidade,
          valorUnitario: item.valor_unitario,
          valorTotal: item.valor_total
        })) || []
      }))
    };
  } catch (error) {
    console.error('Erro ao gerar relatório semanal:', error);
    throw error;
  }
}

/**
 * Salva o fechamento semanal atual
 */
export async function salvarFechamentoSemanal(relatorio: RelatorioSemanal): Promise<boolean> {
  try {
    // O fechamento já é salvo automaticamente quando gerado
    return true;
  } catch (error) {
    console.error('Erro ao salvar fechamento semanal:', error);
    return false;
  }
}

/**
 * Finaliza o fechamento semanal
 */
export async function finalizarFechamentoSemanal(fechamentoId: string): Promise<boolean> {
  try {
    const response = await axios.put(`${API_URL}/fechamentos/${fechamentoId}/finalizar`);
    return response.data.success;
  } catch (error) {
    console.error('Erro ao finalizar fechamento semanal:', error);
    return false;
  }
}

/**
 * Finaliza o fechamento de uma banca específica
 */
export async function finalizarFechamentoBanca(fechamentoId: string, bancaId: string): Promise<boolean> {
  try {
    const response = await axios.put(`${API_URL}/fechamentos/${fechamentoId}/bancas/${bancaId}/finalizar`);
    return response.data.success;
  } catch (error) {
    console.error('Erro ao finalizar fechamento da banca:', error);
    return false;
  }
}

/**
 * Lista todos os fechamentos históricos
 */
export async function listarFechamentosHistoricos(): Promise<RelatorioSemanal[]> {
  try {
    const response = await axios.get(`${API_URL}/fechamentos`);
    console.log(response)
    const fechamentos = response.data;
    
    return fechamentos.map((fechamento: any) => ({
      id: fechamento.id,
      semana: fechamento.semana,
      dataInicio: formatarData(fechamento.data_inicio),
      dataFim: formatarData(fechamento.data_fim),
      totalPecas: fechamento.total_pecas,
      valorTotal: fechamento.valor_total,
      status: fechamento.status,
      dataCriacao: formatarData(fechamento.data_criacao),
      fechamentos: [] // Será carregado separadamente se necessário
    }));
  } catch (error) {
    console.error('Erro ao listar fechamentos históricos:', error);
    return [];
  }
}

/**
 * Busca um fechamento específico por ID
 */
export async function buscarFechamentoPorId(id: string): Promise<RelatorioSemanal | null> {
  try {
    const response = await axios.get(`${API_URL}/fechamentos/${id}`);
    const fechamento = response.data;
    
    return {
      id: fechamento.id,
      semana: fechamento.semana,
      dataInicio: formatarData(fechamento.data_inicio),
      dataFim: formatarData(fechamento.data_fim),
      totalPecas: fechamento.total_pecas,
      valorTotal: fechamento.valor_total,
      status: fechamento.status,
      dataCriacao: formatarData(fechamento.data_criacao),
      fechamentos: fechamento.fechamentos.map((fechamentoBanca: any) => ({
        id: fechamentoBanca.id,
        idBanca: fechamentoBanca.banca_id.toString(),
        nomeBanca: fechamentoBanca.nome_banca,
        dataInicio: formatarData(fechamentoBanca.data_inicio),
        dataFim: formatarData(fechamentoBanca.data_fim),
        totalPecas: fechamentoBanca.total_pecas,
        valorTotal: fechamentoBanca.valor_total,
        status: fechamentoBanca.status,
        dataPagamento: fechamentoBanca.data_pagamento ? formatarData(fechamentoBanca.data_pagamento) : undefined,
        fichasEntregues: fechamentoBanca.itens?.map((item: any) => ({
          id: item.id,
          codigo: item.codigo_ficha,
          dataEntrada: formatarData(item.data_entrada),
          descricao: item.produto,
          quantidade: item.quantidade,
          valorUnitario: item.valor_unitario,
          valorTotal: item.valor_total
        })) || []
      }))
    };
  } catch (error) {
    console.error('Erro ao buscar fechamento:', error);
    return null;
  }
}

/**
 * Busca bancas com movimentação em um período
 */
export async function buscarBancasComMovimentacao(dataInicio: Date, dataFim: Date): Promise<any[]> {
  try {
    const response = await axios.get(`${API_URL}/fechamentos/bancas/movimentacao`, {
      params: {
        dataInicio: dataInicio.toISOString().split('T')[0],
        dataFim: dataFim.toISOString().split('T')[0]
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar bancas com movimentação:', error);
    return [];
  }
}

/**
 * Gera um comprovante PDF para uma banca
 */
export async function gerarComprovantePDF(fechamento: FechamentoBanca): Promise<boolean> {
  try {
    // Implementar geração de PDF
    // Por enquanto, apenas simula o sucesso
    return true;
  } catch (error) {
    console.error('Erro ao gerar comprovante PDF:', error);
    return false;
  }
}

/**
 * Função auxiliar para agrupar produtos de um fechamento
 */
function agruparProdutos(fichas: FichaFechamento[]) {
  const produtos: Record<string, { descricao: string, quantidade: number, valorUnitario: number, valorTotal: number }> = {};
  
  fichas.forEach(ficha => {
    if (!produtos[ficha.descricao]) {
      produtos[ficha.descricao] = {
        descricao: ficha.descricao,
        quantidade: 0,
        valorUnitario: ficha.valorUnitario,
        valorTotal: 0
      };
    }
    
    produtos[ficha.descricao].quantidade += ficha.quantidade;
    produtos[ficha.descricao].valorTotal += ficha.valorTotal;
  });
  
  return Object.values(produtos).sort((a, b) => b.valorTotal - a.valorTotal);
}

/**
 * Função auxiliar para formatar data
 */
function formatarData(data: string | Date): string {
  if (!data) return '';
  let date: Date;
  if (typeof data === 'string') {
    date = new Date(data);
  } else {
    date = data;
  }
  if (isNaN(date.getTime())) return '';
  return date.toLocaleDateString('pt-BR');
} 