const knex = require('../database/connection');
const FechamentosModel = require('../models/Fechamentos');

async function testFluxoFechamentoCompleto() {
  try {
    console.log('=== TESTE DE FLUXO COMPLETO DE FECHAMENTO ===');
    
    const dataInicio = '2025-06-22';
    const dataFim = '2025-06-28';
    
    // 1. Criar ou buscar o fechamento semanal
    const fechamento = await FechamentosModel.gerarFechamentoSemanal(dataInicio, dataFim);
    console.log('\nFechamento semanal criado/buscado:');
    console.log('- ID:', fechamento.id);
    console.log('- Semana:', fechamento.semana);
    console.log('- Status:', fechamento.status);
    
    // 2. Buscar bancas com movimentação
    const bancas = await FechamentosModel.buscarBancasComMovimentacao(dataInicio, dataFim);
    console.log(`\nBancas com movimentação (${bancas.length}):`);
    bancas.forEach((banca, i) => {
      console.log(`${i + 1}. ID: ${banca.idTerceiro}, Nome: ${banca.nome}`);
    });
    
    // 3. Processar cada banca
    for (const banca of bancas) {
      const resultado = await FechamentosModel.processarFechamentoBanca(fechamento.id, banca, dataInicio, dataFim);
      if (resultado) {
        console.log(`\n✅ Banca processada: ${banca.nome}`);
        console.log('- Total de peças:', resultado.total_pecas);
        console.log('- Valor total:', resultado.valor_total);
        console.log('- Itens:', resultado.itens.length);
      } else {
        console.log(`\n❌ Nenhuma movimentação encontrada para banca: ${banca.nome}`);
      }
    }
    
    // 4. Buscar fechamento completo
    const fechamentoCompleto = await FechamentosModel.buscarFechamentoPorId(fechamento.id);
    console.log('\nResumo final do fechamento semanal:');
    console.log('- Total de bancas:', fechamentoCompleto.fechamentos.length);
    fechamentoCompleto.fechamentos.forEach((banca, i) => {
      console.log(`${i + 1}. ${banca.nome_banca} - Peças: ${banca.total_pecas}, Valor: ${banca.valor_total}`);
    });
    
  } catch (error) {
    console.error('Erro no teste:', error);
  } finally {
    await knex.destroy();
  }
}

testFluxoFechamentoCompleto(); 