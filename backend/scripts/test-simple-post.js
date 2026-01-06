const axios = require('axios');

async function testSimplePost() {
  try {
    console.log('Testando POST simples...');
    
    // Testar POST para produtos (que sabemos que funciona)
    const response = await axios.post('http://192.168.100.129:8687/api/produtos', {
      nome: 'Teste',
      descricao: 'Teste',
      preco_venda: 10.00
    });
    console.log('POST para produtos funcionando:', response.status);
    
  } catch (error) {
    console.error('Erro no POST para produtos:', error.response?.status || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
  
  try {
    console.log('\nTestando POST para fechamento...');
    
    // Testar POST para fechamento
    const response = await axios.post('http://192.168.100.129:8687/api/fechamentos/gerar', {
      dataInicio: '2024-01-01',
      dataFim: '2024-12-31'
    });
    console.log('POST para fechamento funcionando:', response.status);
    console.log('Resposta:', response.data);
    
  } catch (error) {
    console.error('Erro no POST para fechamento:', error.response?.status || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

testSimplePost(); 