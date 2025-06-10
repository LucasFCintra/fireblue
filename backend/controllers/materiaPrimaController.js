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
      const { id, ...dados } = req.body;
      console.log('ID do corpo:', id);
      console.log('Dados do corpo:', dados);
      
      if (!id) {
        return res.status(400).json({ error: "ID é obrigatório" });
      }

      const result = await MateriasPrimas.update(id, dados);
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
    const id = req.params.id;
    const result = await MateriasPrimas.delete(id);
    if (result.status) {
      res.status(200).json({
        message: "Matéria-prima excluída com sucesso",
        data: result.data
      });
    } else {
      res.status(406).send(result.err);
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
}

module.exports = new MateriasPrimasController();