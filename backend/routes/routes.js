var express = require("express");
var app = express();
var router = express.Router();


const produtosController = require("../controllers/produtosController");
const clientesController = require("../controllers/clientesController");
const fornecedoresController = require("../controllers/fornecedoresController");
const terceirosController = require("../controllers/terceirosController");
const ordensController = require("../controllers/ordensController");
const comprasController = require("../controllers/comprasController");
const inventarioController = require("../controllers/inventarioController");
const vendasController = require("../controllers/vendasController");
const relatoriosController = require("../controllers/relatoriosController");
const configuracoesController = require("../controllers/configuracoesController");
const cadastroController = require("../controllers/cadastroController");
const redefinirSenhaController = require("../controllers/redefinirSenhaController");
const loginController = require("../controllers/loginController");
const dashboardController = require("../controllers/dashboardController");


// ROTAS PRODUTOS
router.get('/api/produtos', produtosController.index);
router.get('/api/produtos/:idProduto', produtosController.indexOne);
router.post('/api/produtos', produtosController.create);
router.put('/api/produtos', produtosController.update);
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
router.get('/api/inventario', inventarioController.index);
router.get('/api/inventario/:id', inventarioController.indexOne);
router.post('/api/inventario', inventarioController.create);
router.put('/api/inventario', inventarioController.update);
router.delete('/api/inventario/:id', inventarioController.delete);

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

module.exports = router;