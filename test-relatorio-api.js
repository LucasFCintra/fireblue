const axios = require('axios');

async function testRelatorioAPI() {
  try {
    console.log('=== Testando API de Relatório ===');
    
    // Calcular datas da semana atual
    const hoje = new Date();
    const dayOfWeek = hoje.getDay();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    inicioSemana.setHours(0, 0, 0, 0);
    
    const fimSemana = new Date(inicioSemana);
    fimSemana.setDate(inicioSemana.getDate() + 6);
    fimSemana.setHours(23, 59, 59, 999);
    
    const dataInicio = inicioSemana.toISOString().split('T')[0];
    const dataFim = fimSemana.toISOString().split('T')[0];
    
    console.log('Período de teste:', dataInicio, 'a', dataFim);
    
    const url = 'http://26.203.75.236:8687/api/fichas/relatorio';
    const params = { dataInicio, dataFim };
    
    console.log('URL:', url);
    console.log('Parâmetros:', params);
    
    const response = await axios.get(url, { params });
    
    console.log('Status:', response.status);
    console.log('Dados recebidos:', response.data);
    
    if (response.data) {
      console.log('\n=== Resumo dos Dados ===');
      console.log('Total criadas:', response.data.total_criadas);
      console.log('Total concluídas:', response.data.total_concluidas);
      console.log('Total cortadas:', response.data.total_cortadas);
      console.log('Total recebidas:', response.data.total_recebidas);
      console.log('Total perdidas:', response.data.total_perdidas);
    }
    
  } catch (error) {
    console.error('Erro no teste:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Dados do erro:', error.response.data);
    }
  }
}

testRelatorioAPI(); 