import { Ficha } from "@/components/FichasStatusModal";
import { bancasMock } from "@/data/bancasMock";
import { fichasRecebidas } from "@/data/fichasMock";
import { Banca, FechamentoBanca, FichaFechamento, RelatorioSemanal } from "@/types/fechamento";
import { formatDateBR, getCurrentWeekRange, getWeekString, parseDate } from "@/utils/dateUtils";

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
 * Gera o relatório semanal para todas as bancas
 */
export function gerarRelatorioSemanal(dataInicio?: Date, dataFim?: Date): RelatorioSemanal {
  // Se não forem fornecidas datas, usa a semana atual
  const periodo = dataInicio && dataFim 
    ? { start: dataInicio, end: dataFim }
    : getCurrentWeekRange();
  
  // Filtra as fichas recebidas no período
  const fichasDoPeriodo = filtrarFichasNoPeriodo(
    fichasRecebidas,
    periodo.start,
    periodo.end
  );
  
  // Obtém as bancas que têm fichas no período
  const bancasComFichas = obterBancasComFichasNoPeriodo(fichasDoPeriodo);
  
  // Gera o fechamento para cada banca
  const fechamentos = bancasComFichas.map(banca => 
    gerarFechamentoBanca(banca, fichasDoPeriodo, periodo.start, periodo.end)
  );
  
  // Calcula os totais do relatório
  const totalPecas = fechamentos.reduce((sum, fechamento) => sum + fechamento.totalPecas, 0);
  const valorTotal = fechamentos.reduce((sum, fechamento) => sum + fechamento.valorTotal, 0);
  
  return {
    id: `relatorio-${getWeekString(periodo.start)}`,
    semana: getWeekString(periodo.start),
    dataInicio: formatDateBR(periodo.start),
    dataFim: formatDateBR(periodo.end),
    fechamentos,
    totalPecas,
    valorTotal,
    status: 'aberto',
    dataCriacao: formatDateBR(new Date())
  };
}

/**
 * Simula o salvamento do relatório semanal (mock)
 */
export function salvarRelatorioSemanal(relatorio: RelatorioSemanal): Promise<boolean> {
  return new Promise((resolve) => {
    // Simulação de salvamento
    setTimeout(() => {
      console.log('Relatório salvo:', relatorio);
      resolve(true);
    }, 800);
  });
}

/**
 * Simula a finalização do fechamento semanal (mock)
 */
export function finalizarFechamentoSemanal(relatorioId: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Simulação de finalização
    setTimeout(() => {
      console.log('Fechamento finalizado:', relatorioId);
      resolve(true);
    }, 800);
  });
} 