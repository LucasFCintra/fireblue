const axios = require('axios');

async function testRemoteFechamento() {
  const API_URL = 'http://192.168.100.129:8687/api';
  
  console.log('=== TESTE REMOTO DE FECHAMENTO ===');
  
  const dataInicio = '2025-06-22';
  const dataFim = '2025-06-28';
  
  try {
    console.log(`Fazendo requisição para: ${API_URL}/fechamentos/gerar`);
    console.log('Dados enviados:', { dataInicio, dataFim });
    
    const response = await axios.post(`${API_URL}/fechamentos/gerar`, {
      dataInicio,
      dataFim
    }, {
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Resposta recebida com sucesso!');
    console.log('Status:', response.status);
    console.log('Dados:', {
      id: response.data.id,
      semana: response.data.semana,
      status: response.data.status,
      totalPecas: response.data.total_pecas,
      valorTotal: response.data.valor_total,
      bancas: response.data.fechamentos ? response.data.fechamentos.length : 0
    });
    
  } catch (error) {
    console.error('❌ Erro na requisição:');
    console.error('Status:', error.response?.status);
    console.error('Mensagem:', error.response?.data);
    console.error('Erro completo:', error.message);
    
    if (error.response?.data) {
      console.error('Detalhes do erro:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

testRemoteFechamento(); 