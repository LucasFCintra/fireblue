try {
  console.log('Testando carregamento das rotas...');
  const routes = require('../routes/routes');
  console.log('Rotas carregadas com sucesso:', typeof routes);
  
  // Verificar se as rotas estão sendo registradas
  console.log('\nVerificando se as rotas estão sendo registradas...');
  
  // Simular uma requisição para ver se as rotas estão funcionando
  const express = require('express');
  const app = express();
  
  // Registrar as rotas
  app.use('/', routes);
  
  // Listar todas as rotas registradas
  console.log('Rotas registradas:');
  app._router.stack.forEach((middleware) => {
    if (middleware.route) {
      console.log(`${Object.keys(middleware.route.methods)} ${middleware.route.path}`);
    } else if (middleware.name === 'router') {
      middleware.handle.stack.forEach((handler) => {
        if (handler.route) {
          console.log(`${Object.keys(handler.route.methods)} ${handler.route.path}`);
        }
      });
    }
  });
  
} catch (error) {
  console.error('Erro ao carregar rotas:', error);
} 