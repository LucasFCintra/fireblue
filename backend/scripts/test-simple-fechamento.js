const knex = require('../database/connection');
const FechamentosModel = require('../models/Fechamentos');

async function testSimpleFechamento() {
  try {
    console.log('=== TESTE SIMPLES DE FECHAMENTO ===');
    
    const dataInicio = '2025-06-22';
    const dataFim = '2025-06-28';
    
    console.log('Testando com datas:', dataInicio, 'a', dataFim);
    
    // Testar a função diretamente
    const resultado = await FechamentosModel.gerarFechamentoSemanal(dataInicio, dataFim);
    
    console.log('Resultado:', {
      id: resultado.id,
      semana: resultado.semana,
      status: resultado.status,
      totalPecas: resultado.total_pecas,
      valorTotal: resultado.valor_total,
      bancas: resultado.fechamentos ? resultado.fechamentos.length : 0
    });
    
    console.log('✅ Teste concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    console.error('Stack trace:', error.stack);
  } finally {
    await knex.destroy();
  }
}

testSimpleFechamento(); 