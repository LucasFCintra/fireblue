const axios = require('axios');

const API_BASE_URL = 'http://26.203.75.236:8687/api';

async function testarRegistroPerdas() {
  try {
    console.log('=== TESTE DE REGISTRO DE PERDAS ===\n');

    // 1. Buscar uma ficha em produção para testar
    console.log('1. Buscando fichas em produção...');
    const response = await axios.get(`${API_BASE_URL}/fichas`);
    const fichas = response.data;
    
    const fichaEmProducao = fichas.find(f => f.status === 'em_producao');
    
    if (!fichaEmProducao) {
      console.log('❌ Nenhuma ficha em produção encontrada. Criando uma ficha de teste...');
      
      // Criar uma ficha de teste
      const novaFicha = {
        codigo: 'TESTE-PERDA-001',
        banca: 'Banca Teste',
        data_entrada: new Date().toISOString(),
        data_previsao: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        quantidade: 100,
        quantidade_recebida: 0,
        quantidade_perdida: 0,
        status: 'em_producao',
        produto: 'Produto Teste',
        produto_id: '1',
        cor: 'Azul',
        tamanho: 'M',
        observacoes: 'Ficha para teste de perdas'
      };
      
      const fichaCriada = await axios.post(`${API_BASE_URL}/fichas`, novaFicha);
      console.log('✅ Ficha de teste criada:', fichaCriada.data.data.codigo);
      
      // Buscar a ficha criada
      const fichaResponse = await axios.get(`${API_BASE_URL}/fichas/${fichaCriada.data.data.id}`);
      const ficha = fichaResponse.data;
    } else {
      console.log('✅ Ficha em produção encontrada:', fichaEmProducao.codigo);
      const ficha = fichaEmProducao;
    }

    const ficha = fichaEmProducao || fichaCriada.data.data;
    console.log(`\nFicha selecionada: ${ficha.codigo}`);
    console.log(`Quantidade total: ${ficha.quantidade}`);
    console.log(`Quantidade recebida: ${ficha.quantidade_recebida || 0}`);
    console.log(`Quantidade perdida: ${ficha.quantidade_perdida || 0}`);
    console.log(`Status: ${ficha.status}`);

    // 2. Registrar uma perda
    console.log('\n2. Registrando perda de 20 unidades...');
    const perdaData = {
      tipo: 'Perda',
      quantidade: 20,
      descricao: 'Perda durante o processo de produção - teste',
      responsavel: 'Sistema de Teste',
      data: new Date().toISOString()
    };

    const perdaResponse = await axios.post(`${API_BASE_URL}/fichas/${ficha.id}/movimentacao`, perdaData);
    console.log('✅ Perda registrada com sucesso');

    // 3. Verificar se a ficha foi atualizada
    console.log('\n3. Verificando atualização da ficha...');
    const fichaAtualizada = await axios.get(`${API_BASE_URL}/fichas/${ficha.id}`);
    const fichaAtual = fichaAtualizada.data;
    
    console.log(`Quantidade perdida após registro: ${fichaAtual.quantidade_perdida}`);
    console.log(`Status após perda: ${fichaAtual.status}`);

    // 4. Verificar movimentações
    console.log('\n4. Verificando movimentações...');
    const movimentacoesResponse = await axios.get(`${API_BASE_URL}/fichas/${ficha.id}/movimentacoes`);
    const movimentacoes = movimentacoesResponse.data;
    
    const perdaMovimentacao = movimentacoes.find(m => m.tipo === 'Perda');
    if (perdaMovimentacao) {
      console.log('✅ Movimentação de perda encontrada:');
      console.log(`  - Tipo: ${perdaMovimentacao.tipo}`);
      console.log(`  - Quantidade: ${perdaMovimentacao.quantidade}`);
      console.log(`  - Descrição: ${perdaMovimentacao.descricao}`);
      console.log(`  - Responsável: ${perdaMovimentacao.responsavel}`);
    }

    // 5. Registrar recebimento parcial
    console.log('\n5. Registrando recebimento parcial de 30 unidades...');
    const recebimentoData = {
      quantidade_recebida: 30,
      observacoes: 'Recebimento parcial - teste',
      data_recebimento: new Date().toISOString()
    };

    const recebimentoResponse = await axios.post(`${API_BASE_URL}/recebimentos-parciais`, {
      ...recebimentoData,
      ficha_id: ficha.id
    });
    console.log('✅ Recebimento parcial registrado');

    // 6. Verificar ficha após recebimento
    console.log('\n6. Verificando ficha após recebimento...');
    const fichaFinal = await axios.get(`${API_BASE_URL}/fichas/${ficha.id}`);
    const fichaFinalData = fichaFinal.data;
    
    console.log(`Quantidade recebida: ${fichaFinalData.quantidade_recebida}`);
    console.log(`Quantidade perdida: ${fichaFinalData.quantidade_perdida}`);
    console.log(`Status: ${fichaFinalData.status}`);
    
    const totalProcessado = (fichaFinalData.quantidade_recebida || 0) + (fichaFinalData.quantidade_perdida || 0);
    console.log(`Total processado (recebido + perdido): ${totalProcessado}/${fichaFinalData.quantidade}`);

    // 7. Registrar mais uma perda para testar conclusão automática
    console.log('\n7. Registrando perda adicional para testar conclusão automática...');
    const perdaAdicional = {
      tipo: 'Perda',
      quantidade: 50, // Isso deve completar a ficha (30 + 20 + 50 = 100)
      descricao: 'Perda adicional para completar a ficha - teste',
      responsavel: 'Sistema de Teste',
      data: new Date().toISOString()
    };

    const perdaAdicionalResponse = await axios.post(`${API_BASE_URL}/fichas/${ficha.id}/movimentacao`, perdaAdicional);
    console.log('✅ Perda adicional registrada');

    // 8. Verificar se a ficha foi concluída automaticamente
    console.log('\n8. Verificando conclusão automática...');
    const fichaConcluida = await axios.get(`${API_BASE_URL}/fichas/${ficha.id}`);
    const fichaConcluidaData = fichaConcluida.data;
    
    console.log(`Status final: ${fichaConcluidaData.status}`);
    console.log(`Quantidade recebida final: ${fichaConcluidaData.quantidade_recebida}`);
    console.log(`Quantidade perdida final: ${fichaConcluidaData.quantidade_perdida}`);
    
    const totalFinal = (fichaConcluidaData.quantidade_recebida || 0) + (fichaConcluidaData.quantidade_perdida || 0);
    console.log(`Total final: ${totalFinal}/${fichaConcluidaData.quantidade}`);
    
    if (fichaConcluidaData.status === 'concluido') {
      console.log('✅ Ficha concluída automaticamente!');
    } else {
      console.log('❌ Ficha não foi concluída automaticamente');
    }

    console.log('\n=== TESTE CONCLUÍDO ===');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.response?.data || error.message);
  }
}

// Executar o teste
testarRegistroPerdas(); 