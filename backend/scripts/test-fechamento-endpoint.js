const axios = require('axios');

async function testFechamentoEndpoint() {
  try {
    console.log('Testando endpoint de fechamento...');
    
    // Testar se o servidor está respondendo
    const serverStatus = await axios.get('http://26.203.75.236:8687/api/server-status');
    console.log('Status do servidor:', serverStatus.data);
    
    // Testar endpoint de fechamento
    const dataInicio = '2024-01-01';
    const dataFim = '2024-12-31';
    
    console.log('\nTestando geração de fechamento...');
    const response = await axios.post('http://26.203.75.236:8687/api/fechamentos/gerar', {
      dataInicio: dataInicio,
      dataFim: dataFim
    });
    
    console.log('Resposta do fechamento:', response.data);
    
  } catch (error) {
    console.error('Erro no teste:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
  }
}

testFechamentoEndpoint(); 