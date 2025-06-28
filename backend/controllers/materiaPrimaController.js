const MateriasPrimas = require("../models/materiaPrima");

class MateriasPrimasController {

  async retornaEstoque(req, res) { 
    const estoque = await MateriasPrimas.retornaEstoque();
    res.json(estoque);
  }

  async index(req, res) {
    const materiasPrimas = await MateriasPrimas.findAll();
    res.json(materiasPrimas);
  }

  async indexOne(req, res) {
    const id = req.params.id;
    const materiaPrima = await MateriasPrimas.findById(id);
    if (!materiaPrima) {
      res.status(404).json({});
    } else {
      res.json(materiaPrima);
    }
  }

  async create(req, res) {
    const materiaPrima = req.body;
    if (materiaPrima) {
      const resultado = await MateriasPrimas.create(materiaPrima);
      if (resultado) {
        res.status(200).json({
          message: "Matéria-prima cadastrada com sucesso",
          data: resultado
        });
      } else {
        res.status(400).json({ err: "Erro ao cadastrar matéria-prima" });
      }
    } else {
      res.status(400).json({ err: "Informações indefinidas" });
    }
  }

  async update(req, res) {
    try {
      const idParams = req.params.id;
      const dados = req.body;
      console.log('ID dos parâmetros:', idParams);
      console.log('Dados do corpo:', dados);
      
      if (!idParams) {
        return res.status(400).json({ error: "ID é obrigatório" });
      }

      const result = await MateriasPrimas.update(idParams, dados);
      if (result.status) {
        res.status(200).json({
          message: "Matéria-prima atualizada com sucesso",
          data: result.data
        });
      } else {
        res.status(400).json({ error: result.err });
      }
    } catch (error) {
      console.error('Erro ao atualizar matéria prima:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async delete(req, res) {
    try {
    const id = req.params.id;
      console.log('Tentando excluir matéria prima com ID:', id);
      
      if (!id) {
        console.log('ID não fornecido');
        return res.status(400).json({ error: "ID é obrigatório" });
      }

    const result = await MateriasPrimas.delete(id);
      console.log('Resultado da exclusão:', result);
      
    if (result.status) {
      res.status(200).json({
        message: "Matéria-prima excluída com sucesso",
        data: result.data
      });
    } else {
        console.error('Erro ao excluir:', result.err);
        res.status(400).json({ error: result.err });
      }
    } catch (error) {
      console.error('Erro ao excluir matéria prima:', error);
      res.status(500).json({ error: "Erro interno do servidor" });
    }
  }

  async cortar(req, res) {    
    const id = req.params.id;
    const { quantidade, ordemProducao, responsavel } = req.body;
    if (!id || !quantidade) {
      return res.status(400).json({ error: "ID e quantidade são obrigatórios" });
    }
    console.log('Controller: '+req.body)
    const result = await MateriasPrimas.cortar(id, quantidade, ordemProducao, responsavel);
    if (result.status) {
      res.status(200).json({
        message: "Corte registrado com sucesso",
        data: result.data
      });
    } else {
      res.status(400).json({ error: result.error || result.err });
    }
  }

  async historico(req, res) {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: "ID é obrigatório" });
    }

    try {
      const historico = await MateriasPrimas.buscarHistorico(id);
      res.status(200).json(historico);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      res.status(400).json({ error: "Erro ao buscar histórico de movimentações" });
    }
  }

  async buscarTiposTecido(req, res) {
    try {
      console.log('Buscando tipos de tecido...');
      const tiposTecido = await MateriasPrimas.buscarTiposTecido();
      console.log('Tipos de tecido encontrados:', tiposTecido);
      res.status(200).json(tiposTecido);
    } catch (error) {
      console.error('Erro ao buscar tipos de tecido:', error);
      res.status(500).json({ error: "Erro ao buscar tipos de tecido" });
    }
  }

  async buscarCores(req, res) {
    try {
      console.log('Buscando cores...');
      const cores = await MateriasPrimas.buscarCores();
      console.log('Cores encontradas:', cores);
      res.status(200).json(cores);
    } catch (error) {
      console.error('Erro ao buscar cores:', error);
      res.status(500).json({ error: "Erro ao buscar cores" });
    }
  }

  async buscarCoresPorTipoTecido(req, res) {
    try {
      const tipoTecido = req.params.tipoTecido;
      console.log('Buscando cores para tipo de tecido:', tipoTecido);
      const cores = await MateriasPrimas.buscarCoresPorTipoTecido(tipoTecido);
      console.log('Cores encontradas para', tipoTecido, ':', cores);
      res.status(200).json(cores);
    } catch (error) {
      console.error('Erro ao buscar cores por tipo de tecido:', error);
      res.status(500).json({ error: "Erro ao buscar cores por tipo de tecido" });
    }
  }

  async verificarCodigoBarras(req, res) {
    try {
      const codigoBarras = req.params.codigoBarras;
      console.log('Verificando código de barras:', codigoBarras);
      
      if (!codigoBarras) {
        return res.status(400).json({ error: "Código de barras é obrigatório" });
      }

      const existe = await MateriasPrimas.verificarCodigoBarras(codigoBarras);
      res.status(200).json({ existe });
    } catch (error) {
      console.error('Erro ao verificar código de barras:', error);
      res.status(500).json({ error: "Erro ao verificar código de barras" });
    }
  }
}

module.exports = new MateriasPrimasController();