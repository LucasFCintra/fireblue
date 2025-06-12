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
export function salvarFechamentoSemanal(relatorio: RelatorioSemanal): Promise<boolean> {
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

/**
 * Finaliza o fechamento de uma banca específica
 */
export async function finalizarFechamentoBanca(idRelatorio: string, idBanca: string): Promise<boolean> {
  return new Promise((resolve) => {
    // Simulação de finalização da banca
    setTimeout(() => {
      console.log('Fechamento da banca finalizado:', { idRelatorio, idBanca });
      resolve(true);
    }, 800);
  });
}

/**
 * Gera o comprovante de fechamento em PDF
 */
export async function gerarComprovantePDF(fechamento: FechamentoBanca): Promise<string> {
  return new Promise((resolve) => {
    // Simulação da geração do PDF
    setTimeout(() => {
      // Em um ambiente real, aqui seria utilizada a função abaixo
      try {
        // Importa a biblioteca jspdf dinamicamente
        import('jspdf').then(({ default: jsPDF }) => {
          // Define nome do arquivo
          const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
          const nomeArquivo = `Comprovante_Pagamento_${fechamento.nomeBanca.replace(/\s+/g, '_')}_${dataAtual}`;
          
          // Cria um novo documento PDF
          const doc = new jsPDF();
          
          // Adiciona o título
          doc.setFontSize(16);
          doc.text('COMPROVANTE DE FECHAMENTO SEMANAL', 105, 15, { align: 'center' });
          
          // Informações da banca
          doc.setFontSize(12);
          doc.text('Dados da Banca', 14, 35);
          doc.setFontSize(10);
          doc.text(`Nome: ${fechamento.nomeBanca}`, 14, 45);
          doc.text(`Período: ${fechamento.dataInicio} a ${fechamento.dataFim}`, 14, 52);
          doc.text(`Total de Peças: ${fechamento.totalPecas}`, 14, 59);
          doc.text(`Valor Total: ${formatarMoeda(fechamento.valorTotal)}`, 14, 66);
          
          // Adiciona tabela de produtos
          import('jspdf-autotable').then(({ default: autoTable }) => {
            // Agrupa produtos por descrição
            const produtosAgrupados = agruparProdutos(fechamento.fichasEntregues);
            
            // Prepara dados para a tabela
            const dadosProdutos = produtosAgrupados.map(produto => [
              produto.descricao,
              produto.quantidade.toString(),
              formatarMoeda(produto.valorUnitario),
              formatarMoeda(produto.valorTotal)
            ]);
            
            // Adiciona a tabela
            autoTable(doc, {
              startY: 75,
              head: [['Produto', 'Quantidade', 'Valor Unit.', 'Valor Total']],
              body: dadosProdutos,
              theme: 'striped',
              headStyles: { fillColor: [66, 66, 66] }
            });
            
            // Adiciona campos para assinatura
            const finalY = (doc as any).lastAutoTable.finalY + 20;
            
            doc.text('Assinaturas:', 14, finalY);
            
            doc.line(20, finalY + 25, 90, finalY + 25); // Linha para assinatura da banca
            doc.text('Banca', 55, finalY + 32, { align: 'center' });
            
            doc.line(120, finalY + 25, 190, finalY + 25); // Linha para assinatura da Fire Blue
            doc.text('Fire Blue', 155, finalY + 32, { align: 'center' });
            
            // Adiciona data atual
            const dataAtual = new Date().toLocaleDateString('pt-BR');
            doc.text(`Data: ${dataAtual}`, 14, finalY + 45);
            
            // Rodapé
            const pageCount = doc.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
              doc.setPage(i);
              doc.setFontSize(8);
              doc.text('Fire Blue - Sistema de Gestão', 105, 285, { align: 'center' });
              doc.text(`Página ${i} de ${pageCount}`, 195, 285, { align: 'right' });
            }
            
            // Ao invés de apenas abrir o PDF, vamos salvar com o nome definido
            doc.save(`${nomeArquivo}.pdf`);
            
            console.log('Comprovante gerado:', nomeArquivo);
            
            resolve(nomeArquivo);
          });
        });
      } catch (error) {
        console.error('Erro ao gerar PDF:', error);
        
        // Retorna o nome do arquivo PDF gerado (simulado)
        const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
        const nomeArquivo = `Comprovante_Pagamento_${fechamento.nomeBanca.replace(/\s+/g, '_')}_${dataAtual}`;
        console.log('Comprovante gerado (fallback):', nomeArquivo);
        
        resolve(nomeArquivo);
      }
    }, 1000);
  });
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
 * Função auxiliar para formatação de moeda
 */
function formatarMoeda(valor: number) {
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
} 