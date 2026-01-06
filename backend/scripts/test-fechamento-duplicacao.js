const axios = require('axios');

async function testarFechamentoDuplicacao() {
  const API_URL = 'http://192.168.100.129:8687/api';
  
  console.log('=== TESTE DE DUPLICAÇÃO DE FECHAMENTO ===');
  
  // Data de teste (semana atual)
  const dataInicio = '2025-06-22';
  const dataFim = '2025-06-28';
  
  try {
    console.log(`\n1. Primeira chamada para gerar fechamento (${dataInicio} a ${dataFim})`);
    const response1 = await axios.post(`${API_URL}/fechamentos/gerar`, {
      dataInicio,
      dataFim
    });
    
    console.log('Resultado da primeira chamada:');
    console.log('- ID:', response1.data.id);
    console.log('- Semana:', response1.data.semana);
    console.log('- Status:', response1.data.status);
    console.log('- Total de bancas:', response1.data.fechamentos.length);
    
    console.log('\n2. Segunda chamada para gerar fechamento (mesmo período)');
    const response2 = await axios.post(`${API_URL}/fechamentos/gerar`, {
      dataInicio,
      dataFim
    });
    
    console.log('Resultado da segunda chamada:');
    console.log('- ID:', response2.data.id);
    console.log('- Semana:', response2.data.semana);
    console.log('- Status:', response2.data.status);
    console.log('- Total de bancas:', response2.data.fechamentos.length);
    
    console.log('\n3. Terceira chamada para gerar fechamento (mesmo período)');
    const response3 = await axios.post(`${API_URL}/fechamentos/gerar`, {
      dataInicio,
      dataFim
    });
    
    console.log('Resultado da terceira chamada:');
    console.log('- ID:', response3.data.id);
    console.log('- Semana:', response3.data.semana);
    console.log('- Status:', response3.data.status);
    console.log('- Total de bancas:', response3.data.fechamentos.length);
    
    // Verificar se os IDs são iguais (não há duplicação)
    const ids = [response1.data.id, response2.data.id, response3.data.id];
    const idsUnicos = [...new Set(ids)];
    
    console.log('\n=== RESULTADO DO TESTE ===');
    console.log('IDs retornados:', ids);
    console.log('IDs únicos:', idsUnicos);
    
    if (idsUnicos.length === 1) {
      console.log('✅ SUCESSO: Não houve duplicação! Todos os IDs são iguais.');
    } else {
      console.log('❌ FALHA: Houve duplicação! IDs diferentes foram retornados.');
      console.log('IDs duplicados encontrados:', ids.filter((id, index) => ids.indexOf(id) !== index));
    }
    
    // Verificar se as semanas são iguais
    const semanas = [response1.data.semana, response2.data.semana, response3.data.semana];
    const semanasUnicas = [...new Set(semanas)];
    
    if (semanasUnicas.length === 1) {
      console.log('✅ SUCESSO: Todas as semanas são iguais.');
    } else {
      console.log('❌ FALHA: Semanas diferentes foram retornadas.');
    }
    
  } catch (error) {
    console.error('Erro durante o teste:', error.response?.data || error.message);
  }
}

// Executar o teste
testarFechamentoDuplicacao(); 