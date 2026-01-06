const axios = require('axios');

async function testFiltroCorrigido() {
  try {
    console.log('=== Teste do Filtro de Datas Corrigido ===\n');

    // Teste 1: Semana atual (30/06 a 07/07)
    console.log('1. Testando semana atual (30/06 a 07/07)...');
    const response1 = await axios.get('http://192.168.100.129:8687/api/fichas/dados-consolidados', {
      params: {
        dataInicio: '2025-06-30',
        dataFim: '2025-07-07'
      }
    });
    console.log('Dados consolidados semana atual:', response1.data);
    console.log('');

    // Teste 2: Comparar com dados dos gráficos
    console.log('2. Comparando com dados dos gráficos (semana atual)...');
    const [cortadas, recebidas, perdidas] = await Promise.all([
      axios.get('http://192.168.100.129:8687/api/fichas/cortadas/ultimos-meses', {
        params: { dataInicio: '2025-06-30', dataFim: '2025-07-07' }
      }),
      axios.get('http://192.168.100.129:8687/api/fichas/recebidos/ultimos-meses', {
        params: { dataInicio: '2025-06-30', dataFim: '2025-07-07' }
      }),
      axios.get('http://192.168.100.129:8687/api/fichas/perdidas/ultimos-meses', {
        params: { dataInicio: '2025-06-30', dataFim: '2025-07-07' }
      })
    ]);

    console.log('Cortadas:', cortadas.data);
    console.log('Recebidas:', recebidas.data);
    console.log('Perdidas:', perdidas.data);
    console.log('');

    // Verificar se os totais batem
    const totalCortadasGrafico = cortadas.data.reduce((sum, item) => sum + parseInt(item.total_cortada || 0), 0);
    const totalRecebidasGrafico = recebidas.data.reduce((sum, item) => sum + parseInt(item.total_recebido || 0), 0);
    const totalPerdidasGrafico = perdidas.data.reduce((sum, item) => sum + parseInt(item.total_perdido || 0), 0);

    console.log('Comparação de totais:');
    console.log('Consolidados - Cortadas:', response1.data.total_cortadas, 'vs Gráfico:', totalCortadasGrafico);
    console.log('Consolidados - Recebidas:', response1.data.total_recebidas, 'vs Gráfico:', totalRecebidasGrafico);
    console.log('Consolidados - Perdidas:', response1.data.total_perdidas, 'vs Gráfico:', totalPerdidasGrafico);
    console.log('');

    // Teste 3: Período diferente (últimos 7 dias)
    console.log('3. Testando últimos 7 dias (23/06 a 30/06)...');
    const response3 = await axios.get('http://192.168.100.129:8687/api/fichas/dados-consolidados', {
      params: {
        dataInicio: '2025-06-23',
        dataFim: '2025-06-30'
      }
    });
    console.log('Dados últimos 7 dias:', response3.data);
    console.log('');

    // Teste 4: Verificar se o filtro está pegando dados corretos
    console.log('4. Verificando dados brutos no banco...');
    const knex = require('knex')({
      client: 'mysql2',
      connection: {
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'sge_fire_blue'
      }
    });

    const fichasSemana = await knex('fichas')
      .whereRaw('DATE(data_entrada) BETWEEN ? AND ?', ['2025-06-30', '2025-07-07'])
      .select('codigo', 'quantidade', 'quantidade_recebida', 'quantidade_perdida', 'data_entrada');
    
    console.log('Fichas da semana atual (30/06 a 07/07):', fichasSemana.length);
    fichasSemana.forEach(ficha => {
      console.log(`- ${ficha.codigo}: ${ficha.quantidade} cortadas, ${ficha.quantidade_recebida} recebidas, ${ficha.quantidade_perdida} perdidas (${ficha.data_entrada})`);
    });

    await knex.destroy();

  } catch (error) {
    console.error('Erro no teste:', error.response?.data || error.message);
  }
}

testFiltroCorrigido(); 