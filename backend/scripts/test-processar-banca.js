const knex = require('../database/connection');
const FechamentosModel = require('../models/Fechamentos');

async function testProcessarBanca() {
  try {
    console.log('=== TESTE DE PROCESSAR BANCA ===');
    
    const dataInicio = '2025-06-22';
    const dataFim = '2025-06-28';
    
    // Simular dados de uma banca
    const banca = {
      idTerceiro: 55,
      nome: 'Banca 1',
      cnpj: '2131231',
      email: 'banca1@teste.com',
      telefone: '(11) 1234-5678'
    };
    
    console.log(`\n1. Testando processarFechamentoBanca para ${banca.nome}:`);
    
    // Testar a consulta específica da função processarFechamentoBanca
    console.log('\n2. Executando consulta de movimentações:');
    const movimentacoes = await knex('movimentacoes_fichas as mf')
      .leftJoin('fichas as f', 'f.id', 'mf.ficha_id')
      .leftJoin('produtos as p', 'p.id', 'f.produto_id')
      .where('f.banca', banca.nome)
      .where(function() {
        this.where('mf.tipo', 'Retorno')
            .orWhere('mf.tipo', 'Conclusão');
      })
      .whereBetween('mf.data', [dataInicio, dataFim])
      .select([
        'mf.id as movimentacao_id',
        'mf.ficha_id',
        'mf.quantidade as quantidade_movimentada',
        'mf.data as data_movimentacao',
        'f.codigo as codigo_ficha',
        'f.produto',
        'f.data_entrada',
        'f.status',
        knex.raw('COALESCE(p.valor_unitario, 0) as valor_unitario')
      ]);
    
    console.log('Movimentações encontradas:', movimentacoes.length);
    
    if (movimentacoes.length > 0) {
      console.log('Detalhes das movimentações:');
      movimentacoes.forEach((mov, index) => {
        console.log(`${index + 1}. ID: ${mov.movimentacao_id}, Tipo: ${mov.tipo}, Quantidade: ${mov.quantidade_movimentada}, Produto: ${mov.produto}, Valor: ${mov.valor_unitario}`);
      });
    }
    
    console.log('\n3. Testando função completa:');
    const resultado = await FechamentosModel.processarFechamentoBanca(1, banca, dataInicio, dataFim);
    
    if (resultado) {
      console.log('✅ Resultado obtido com sucesso:');
      console.log('- ID:', resultado.id);
      console.log('- Nome da banca:', resultado.nome_banca);
      console.log('- Total de peças:', resultado.total_pecas);
      console.log('- Valor total:', resultado.valor_total);
      console.log('- Itens:', resultado.itens.length);
    } else {
      console.log('❌ Resultado é null');
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  } finally {
    await knex.destroy();
  }
}

testProcessarBanca(); 