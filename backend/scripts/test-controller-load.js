try {
  console.log('Testando carregamento do controller de fechamento...');
  const fechamentoController = require('../controllers/fechamentoController');
  console.log('Controller carregado com sucesso:', typeof fechamentoController);
  console.log('Métodos disponíveis:', Object.keys(fechamentoController));
} catch (error) {
  console.error('Erro ao carregar controller:', error);
}

try {
  console.log('\nTestando carregamento do modelo de fechamento...');
  const fechamentosModel = require('../models/Fechamentos');
  console.log('Modelo carregado com sucesso:', typeof fechamentosModel);
  console.log('Métodos disponíveis:', Object.keys(fechamentosModel));
} catch (error) {
  console.error('Erro ao carregar modelo:', error);
}

try {
  console.log('\nTestando carregamento das rotas...');
  const routes = require('../routes/routes');
  console.log('Rotas carregadas com sucesso:', typeof routes);
} catch (error) {
  console.error('Erro ao carregar rotas:', error);
} 