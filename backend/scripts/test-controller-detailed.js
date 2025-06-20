try {
  console.log('Testando carregamento do controller de fechamento...');
  const fechamentoController = require('../controllers/fechamentoController');
  console.log('Controller carregado com sucesso:', typeof fechamentoController);
  console.log('É uma instância?', fechamentoController instanceof Object);
  console.log('Métodos disponíveis:', Object.getOwnPropertyNames(fechamentoController));
  console.log('Prototype methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(fechamentoController)));
  
  // Testar se os métodos existem
  console.log('\nTestando métodos específicos:');
  console.log('gerarFechamento:', typeof fechamentoController.gerarFechamento);
  console.log('buscarFechamento:', typeof fechamentoController.buscarFechamento);
  console.log('listarFechamentos:', typeof fechamentoController.listarFechamentos);
  
} catch (error) {
  console.error('Erro ao carregar controller:', error);
} 