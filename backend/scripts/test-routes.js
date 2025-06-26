const http = require('http');

function testRoute(path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: '26.203.75.236',
      port: 8687,
      path: path,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        console.log(`\n=== TESTE: ${path} ===`);
        console.log('Status:', res.statusCode);
        console.log('Headers:', res.headers);
        console.log('Data:', data);
        resolve({ status: res.statusCode, data: data });
      });
    });

    req.on('error', (e) => {
      console.error(`Erro ao testar ${path}:`, e.message);
      reject(e);
    });

    req.end();
  });
}

async function runTests() {
  console.log('Iniciando testes das rotas...');
  
  try {
    await testRoute('/api/materia-prima/tipos-tecido');
    await testRoute('/api/materia-prima/cores');
    await testRoute('/api/materia-prima/cores/Algodão');
    await testRoute('/api/materia-prima');
  } catch (error) {
    console.error('Erro nos testes:', error);
  }
}

runTests(); 