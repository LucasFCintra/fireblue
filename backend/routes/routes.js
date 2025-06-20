var express = require("express");
var app = express();
var router = express.Router();

const produtosController = require("../controllers/produtosController");
const clientesController = require("../controllers/clientesController");
const fornecedoresController = require("../controllers/fornecedoresController");
const terceirosController = require("../controllers/terceirosController");
const ordensController = require("../controllers/ordensController");
const comprasController = require("../controllers/comprasController");
const inventarioController = require("../controllers/estoqueController");
const vendasController = require("../controllers/vendasController");
const relatoriosController = require("../controllers/relatoriosController");
const configuracoesController = require("../controllers/configuracoesController");
const cadastroController = require("../controllers/cadastroController");
const redefinirSenhaController = require("../controllers/redefinirSenhaController");
const loginController = require("../controllers/loginController");
const dashboardController = require("../controllers/dashboardController");
const materiaPrimaController = require('../controllers/materiaPrimaController');
const fichasController = require('../controllers/fichasController');
const recebimentosParciaisController = require('../controllers/RecebimentosParciaisController');
const estoqueController = require("../controllers/estoqueController");
const fechamentoController = require("../controllers/fechamentoController");

// ROTAS RECEBIMENTOS PARCIAIS
router.post('/api/recebimentos-parciais', recebimentosParciaisController.create);
router.get('/api/recebimentos-parciais/ficha/:fichaId', recebimentosParciaisController.findByFichaId);
router.put('/api/recebimentos-parciais/:id', recebimentosParciaisController.update);
router.delete('/api/recebimentos-parciais/:id', recebimentosParciaisController.delete);

// ROTAS FICHAS
router.get('/api/fichas', fichasController.index);
router.get('/api/fichas/summary/status', fichasController.getStatusSummary);
router.get('/api/fichas/stats/monthly', fichasController.getMonthlyStats);
router.get('/api/fichas/relatorio', fichasController.getRecebidosUltimosMeses);
router.get('/api/fichas/recebidos/ultimos-meses', fichasController.getRecebidosUltimosMeses);
router.get('/api/fichas/perdidas/ultimos-meses', fichasController.getPerdidasUltimosMeses);
router.get('/api/fichas/cortadas/ultimos-meses', fichasController.getCortadasUltimosMeses);
router.get('/api/fichas/:id', fichasController.indexOne);
router.get('/api/fichas/list/:status', fichasController.getFichasByStatus);
router.get('/api/fichas/status/:status', fichasController.indexByStatus);
router.post('/api/fichas', fichasController.create);
router.put('/api/fichas/:id', fichasController.update);
router.delete('/api/fichas/:id', fichasController.delete);
// Rotas para movimentações - IMPORTANTE: estas rotas devem vir ANTES das rotas com parâmetros
router.post('/api/fichas/:id/movimentacao', fichasController.registrarMovimentacao);
router.get('/api/fichas/:id/movimentacoes', fichasController.buscarMovimentacoes);

// ROTAS MATÉRIA PRIMA
router.get('/api/materia-prima/estoque', materiaPrimaController.retornaEstoque);
router.get('/api/materia-prima', materiaPrimaController.index);
router.get('/api/materia-prima/:id', materiaPrimaController.indexOne);
router.post('/api/materia-prima', materiaPrimaController.create);
router.put('/api/materia-prima', materiaPrimaController.update);
router.delete('/api/materia-prima/:id', materiaPrimaController.delete);
router.post('/api/materia-prima/:id/corte', materiaPrimaController.cortar);
router.get('/api/materia-prima/:id/historico', materiaPrimaController.historico);

// ROTAS PRODUTOS
router.get('/api/produtos', produtosController.index);
router.get('/api/produtos/search', produtosController.search);
router.get('/api/produtos/low-stock', produtosController.getLowStock);
router.get('/api/produtos/:idProduto', produtosController.indexOne);
router.post('/api/produtos', produtosController.create);
router.put('/api/produtos/:id', produtosController.update);
router.delete('/api/produtos/:idProduto', produtosController.delete);

// ROTAS CLIENTES
router.get('/api/clientes', clientesController.index);
router.get('/api/clientes/:idCliente', clientesController.indexOne);
router.post('/api/clientes', clientesController.create);
router.put('/api/clientes', clientesController.update);
router.delete('/api/clientes/:idCliente', clientesController.delete);

// ROTAS FORNECEDORES
router.get('/api/fornecedores', fornecedoresController.index);
router.get('/api/fornecedores/:idFornecedor', fornecedoresController.indexOne);
router.post('/api/fornecedores', fornecedoresController.create);
router.put('/api/fornecedores', fornecedoresController.update);
router.delete('/api/fornecedores/:idFornecedor', fornecedoresController.delete);

// ROTAS TERCEIROS
router.get('/api/terceiros', terceirosController.index);
router.get('/api/terceiros/:idTerceiro', terceirosController.indexOne);
router.get('/api/terceiros/tipo/:tipo', terceirosController.indexByTipo);
router.post('/api/terceiros', terceirosController.create);
router.put('/api/terceiros', terceirosController.update);
router.delete('/api/terceiros/:idTerceiro', terceirosController.delete);

// ROTAS ORDENS
router.get('/api/ordens', ordensController.index);
router.get('/api/ordens/:idOrdem', ordensController.indexOne);
router.post('/api/ordens', ordensController.create);
router.put('/api/ordens', ordensController.update);
router.delete('/api/ordens/:idOrdem', ordensController.delete);

// ROTAS COMPRAS
router.get('/api/compras', comprasController.index);
router.get('/api/compras/:idCompra', comprasController.indexOne);
router.post('/api/compras', comprasController.create);
router.put('/api/compras', comprasController.update);
router.delete('/api/compras/:idCompra', comprasController.delete);

// ROTAS INVENTARIO
router.get('/api/estoques', inventarioController.index);
router.get('/api/estoques/:id', inventarioController.indexOne);
router.post('/api/estoques', inventarioController.create);
router.put('/api/estoques', inventarioController.update);
router.delete('/api/estoques/:id', inventarioController.delete);

// ROTAS VENDAS
router.get('/api/vendas', vendasController.index);
router.get('/api/vendas/:idVenda', vendasController.indexOne);
router.post('/api/vendas', vendasController.create);
router.put('/api/vendas', vendasController.update);
router.delete('/api/vendas/:idVenda', vendasController.delete);

// ROTAS RELATORIOS
router.get('/api/relatorios', relatoriosController.index);
router.get('/api/relatorios/:idRelatorio', relatoriosController.indexOne);
router.post('/api/relatorios', relatoriosController.create);
router.put('/api/relatorios', relatoriosController.update);
router.delete('/api/relatorios/:idRelatorio', relatoriosController.delete);

// ROTAS CONFIGURACOES
router.get('/api/configuracoes', configuracoesController.index);
router.get('/api/configuracoes/:idConfiguracao', configuracoesController.indexOne);
router.post('/api/configuracoes', configuracoesController.create);
router.put('/api/configuracoes', configuracoesController.update);
router.delete('/api/configuracoes/:idConfiguracao', configuracoesController.delete);

// ROTAS CADASTRO
router.get('/api/cadastro', cadastroController.index);
router.get('/api/cadastro/:idCadastro', cadastroController.indexOne);
router.post('/api/cadastro', cadastroController.create);
router.put('/api/cadastro', cadastroController.update);
router.delete('/api/cadastro/:idCadastro', cadastroController.delete);

// ROTAS REDEFINIR SENHA
router.post('/api/redefinir-senha/email', redefinirSenhaController.findByEmail);
router.put('/api/redefinir-senha', redefinirSenhaController.updateSenha);

// ROTAS LOGIN
router.post('/api/login', loginController.login);

// ROTAS DASHBOARD
router.get('/api/dashboard', dashboardController.getResumo);
router.get('/api/dashboard/producao-semanal', dashboardController.getProducaoSemanal);

// ROTAS ESTOQUE
router.get('/api/estoque', estoqueController.index);
router.get('/api/estoque/:id', estoqueController.indexOne);
router.post('/api/estoque', estoqueController.create);
router.put('/api/estoque', estoqueController.update);
router.delete('/api/estoque/:id', estoqueController.delete);

// ROTAS FECHAMENTO SEMANAL
router.post('/api/fechamentos/gerar', fechamentoController.gerarFechamento);
router.get('/api/fechamentos', fechamentoController.listarFechamentos);
router.get('/api/fechamentos/:id', fechamentoController.buscarFechamento);
router.put('/api/fechamentos/:id/finalizar', fechamentoController.finalizarFechamentoSemanal);
router.put('/api/fechamentos/:fechamentoId/bancas/:bancaId/finalizar', fechamentoController.finalizarFechamentoBanca);
router.get('/api/fechamentos/bancas/movimentacao', fechamentoController.buscarBancasComMovimentacao);

module.exports = router;