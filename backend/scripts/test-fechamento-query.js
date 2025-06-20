const knex = require('../database/connection');

async function testFechamentoQuery() {
  try {
    console.log('Testando consulta de fechamento...');
    
    // Testar busca de bancas com movimentação
    const dataInicio = '2024-01-01';
    const dataFim = '2024-12-31';
    
    console.log('\n1. Testando busca de bancas com movimentação:');
    const bancas = await knex('fichas as f')
      .join('movimentacoes_fichas as mf', 'f.id', 'mf.ficha_id')
      .join('terceiros as t', 'f.banca', 't.nome')
      .where('mf.tipo', 'Retorno')
      .whereIn('f.status', ['em-producao', 'recebido', 'concluido'])
      .whereBetween('mf.data', [dataInicio, dataFim])
      .where('t.tipo', 'banca')
      .select(
        't.idTerceiro as id',
        't.nome as nome',
        't.cnpj',
        't.telefone',
        't.email'
      )
      .distinct();
    
    console.log('Bancas encontradas:', bancas.length);
    bancas.forEach(banca => {
      console.log(`- ${banca.nome} (ID: ${banca.id})`);
    });
    
    // Testar busca de fichas com produtos
    if (bancas.length > 0) {
      const banca = bancas[0];
      console.log(`\n2. Testando busca de fichas para banca: ${banca.nome}`);
      
      const fichas = await knex('fichas as f')
        .join('movimentacoes_fichas as mf', 'f.id', 'mf.ficha_id')
        .leftJoin('produtos as p', function() {
          this.on('f.produto', '=', 'p.nome')
            .orOn('f.produto', '=', 'p.nome_produto');
        })
        .where('f.banca', banca.nome)
        .where('mf.tipo', 'Retorno')
        .whereIn('f.status', ['em-producao', 'recebido', 'concluido'])
        .whereBetween('mf.data', [dataInicio, dataFim])
        .select(
          'f.id as ficha_id',
          'f.codigo as codigo_ficha',
          'f.produto',
          'f.quantidade',
          'f.data_entrada',
          knex.raw('COALESCE(p.valor_unitario, p.preco_venda, 0) as valor_unitario'),
          'mf.quantidade as quantidade_movimentada'
        );
      
      console.log('Fichas encontradas:', fichas.length);
      fichas.forEach(ficha => {
        console.log(`- Ficha ${ficha.codigo_ficha}: ${ficha.produto} (${ficha.quantidade_movimentada || ficha.quantidade} unid.) - R$ ${ficha.valor_unitario}`);
      });
    }
    
    // Testar estrutura da tabela produtos
    console.log('\n3. Verificando estrutura da tabela produtos:');
    const produtos = await knex('produtos').select('*').limit(3);
    if (produtos.length > 0) {
      console.log('Campos disponíveis:', Object.keys(produtos[0]));
      produtos.forEach(produto => {
        console.log(`- ${produto.nome || produto.nome_produto}: R$ ${produto.valor_unitario || produto.preco_venda || 0}`);
      });
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  } finally {
    process.exit(0);
  }
}

testFechamentoQuery(); 