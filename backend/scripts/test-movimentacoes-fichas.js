const knex = require('../database/connection');

async function testMovimentacoesFichas() {
  try {
    console.log('=== TESTE DE MOVIMENTAÇÕES DE FICHAS ===');
    
    const dataInicio = '2025-06-22';
    const dataFim = '2025-06-28';
    
    console.log(`\n1. Verificando dados na tabela movimentacoes_fichas:`);
    const totalMovimentacoes = await knex('movimentacoes_fichas').count('* as total');
    console.log('Total de movimentações:', totalMovimentacoes[0].total);
    
    console.log(`\n2. Verificando movimentações no período ${dataInicio} a ${dataFim}:`);
    const movimentacoesPeriodo = await knex('movimentacoes_fichas')
      .where('data', '>=', dataInicio)
      .andWhere('data', '<=', dataFim);
    console.log('Movimentações no período:', movimentacoesPeriodo.length);
    
    if (movimentacoesPeriodo.length > 0) {
      console.log('Primeiras 5 movimentações:');
      movimentacoesPeriodo.slice(0, 5).forEach((mov, index) => {
        console.log(`${index + 1}. ID: ${mov.id}, Tipo: ${mov.tipo}, Data: ${mov.data}, Quantidade: ${mov.quantidade}`);
      });
    }
    
    console.log(`\n3. Verificando movimentações com tipo 'Retorno' ou 'Conclusão':`);
    const movimentacoesTipo = await knex('movimentacoes_fichas')
      .where('data', '>=', dataInicio)
      .andWhere('data', '<=', dataFim)
      .where(function() {
        this.where('tipo', 'Retorno')
            .orWhere('tipo', 'Conclusão');
      });
    console.log('Movimentações com tipo Retorno/Conclusão:', movimentacoesTipo.length);
    
    if (movimentacoesTipo.length > 0) {
      console.log('Primeiras 5 movimentações com tipo correto:');
      movimentacoesTipo.slice(0, 5).forEach((mov, index) => {
        console.log(`${index + 1}. ID: ${mov.id}, Tipo: ${mov.tipo}, Data: ${mov.data}, Quantidade: ${mov.quantidade}`);
      });
    }
    
    console.log(`\n4. Verificando JOIN com fichas:`);
    const movimentacoesComFichas = await knex('movimentacoes_fichas as mf')
      .leftJoin('fichas as f', 'f.id', 'mf.ficha_id')
      .where('mf.data', '>=', dataInicio)
      .andWhere('mf.data', '<=', dataFim)
      .where(function() {
        this.where('mf.tipo', 'Retorno')
            .orWhere('mf.tipo', 'Conclusão');
      })
      .select(['mf.id', 'mf.tipo', 'mf.data', 'mf.quantidade', 'f.banca', 'f.produto']);
    
    console.log('Movimentações com dados de fichas:', movimentacoesComFichas.length);
    
    if (movimentacoesComFichas.length > 0) {
      console.log('Primeiras 5 movimentações com fichas:');
      movimentacoesComFichas.slice(0, 5).forEach((mov, index) => {
        console.log(`${index + 1}. ID: ${mov.id}, Tipo: ${mov.tipo}, Banca: ${mov.banca}, Produto: ${mov.produto}`);
      });
    }
    
    console.log(`\n5. Verificando bancas únicas:`);
    const bancasUnicas = await knex('movimentacoes_fichas as mf')
      .leftJoin('fichas as f', 'f.id', 'mf.ficha_id')
      .where('mf.data', '>=', dataInicio)
      .andWhere('mf.data', '<=', dataFim)
      .where(function() {
        this.where('mf.tipo', 'Retorno')
            .orWhere('mf.tipo', 'Conclusão');
      })
      .groupBy('f.banca')
      .select('f.banca');
    
    console.log('Bancas únicas encontradas:', bancasUnicas.length);
    bancasUnicas.forEach((banca, index) => {
      console.log(`${index + 1}. ${banca.banca}`);
    });
    
    console.log(`\n6. Verificando JOIN com terceiros:`);
    const bancasComTerceiros = await knex('movimentacoes_fichas as mf')
      .leftJoin('fichas as f', 'f.id', 'mf.ficha_id')
      .leftJoin('terceiros as t', 't.nome', 'f.banca')
      .where('mf.data', '>=', dataInicio)
      .andWhere('mf.data', '<=', dataFim)
      .where(function() {
        this.where('mf.tipo', 'Retorno')
            .orWhere('mf.tipo', 'Conclusão');
      })
      .groupBy('t.idTerceiro')
      .select([
        't.idTerceiro as idTerceiro',
        't.nome as nome',
        't.cnpj',
        't.email',
        't.telefone'
      ]);
    
    console.log('Bancas com dados de terceiros:', bancasComTerceiros.length);
    bancasComTerceiros.forEach((banca, index) => {
      console.log(`${index + 1}. ID: ${banca.idTerceiro}, Nome: ${banca.nome}, CNPJ: ${banca.cnpj}`);
    });
    
  } catch (error) {
    console.error('Erro no teste:', error);
  } finally {
    await knex.destroy();
  }
}

testMovimentacoesFichas(); 