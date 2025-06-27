const axios = require('axios');

async function testSimpleRoute() {
  try {
    console.log('Testando rota simples...');
    
    // Testar rota de produtos (que sabemos que funciona)
    const response = await axios.get('http://192.168.100.134:8687/api/produtos');
    console.log('Rota de produtos funcionando:', response.status);
    
    // Testar rota de terceiros
    const response2 = await axios.get('http://192.168.100.134:8687/api/terceiros');
    console.log('Rota de terceiros funcionando:', response2.status);
    
    // Testar rota de fechamento
    const response3 = await axios.get('http://192.168.100.134:8687/api/fechamentos');
    console.log('Rota de fechamento GET funcionando:', response3.status);
    
  } catch (error) {
    console.error('Erro no teste:', error.response?.status || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testSimpleRoute(); 