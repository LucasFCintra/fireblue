const { Console } = require("console")
const Fichas = require("../models/Fichas")

class FichasController {
  async index(req, res) {   
    const fichas = await Fichas.findAll()
    res.json(fichas)
  }

  async indexOne(req, res) {
    const id = req.params.id
    const ficha = await Fichas.findById(id)
    if (!ficha) {
      res.status(404).json({})
    } else {
      res.json(ficha)
    }
  }

  async indexByTipo(req, res) {
    const tipo = req.params.tipo
    const fichas = await Fichas.findByTipo(tipo)
    res.json(fichas)
  }

  async indexByStatus(req, res) {
    const status = req.params.status
    const fichas = await Fichas.findByStatus(status)
    res.json(fichas)
  }

  async getStatusSummary(req, res) {
    const summary = await Fichas.getStatusSummary()
    res.json(summary)
  }

  async getFichasByStatus(req, res) {
    const status = req.params.status
    const fichas = await Fichas.findByStatus(status)
    res.json(fichas)
  }

  async create(req, res) {
    const terceiro = req.body
    if (terceiro) {
      const resultado = await Fichas.create(terceiro)
      if (resultado) {
        res.status(200).json({
          message: "Terceiro inserido com sucesso",
          data: resultado
        })
      } else {
        res.status(400).json({ err: "Erro ao inserir terceiro" })
      }
    } else {
      res.status(400).json({ err: "Informações indefinidas" })
    }
  }

  async update(req, res) {
    const { id, ...dados } = req.body

    console.log('ControllerID'+id)
    console.log('Controller'+JSON.stringify(req.body))
    if (id) {
      const result = await Fichas.update(id, dados)
      if (result.status) {
        res.status(200).json({
          message: "Terceiro atualizado com sucesso",
          data: result.data
        })
      } else {
        res.status(406).send(result.err)
      }
    } else {
      res.status(406).send("ID inválido")
    }
  }

  async delete(req, res) {
    const id = req.params.idTerceiro
    const result = await Fichas.delete(id)
    if (result.status) {
      res.status(200).json({
        message: "Terceiro excluído com sucesso",
        data: result.data
      })
    } else {
      res.status(406).send(result.err)
    }
  }

  async registrarMovimentacao(req, res) {
    try {
      const { id } = req.params;
      const movimentacao = req.body;
      console.log(movimentacao)
      // Validar se a ficha existe
      const ficha = await Fichas.findById(id);
      if (!ficha) {
        return res.status(404).json({ error: "Ficha não encontrada" });
      }

      // Registrar a movimentação
      const movimentacaoId = await Fichas.registrarMovimentacao(id, movimentacao);
      
      res.json({ 
        success: true, 
        message: "Movimentação registrada com sucesso",
        data: { id: movimentacaoId }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao registrar movimentação" });
    }
  }

  async buscarMovimentacoes(req, res) {
    try {
      const { id } = req.params;

      // Validar se a ficha existe
      const ficha = await Fichas.findById(id);
      if (!ficha) {
        return res.status(404).json({ error: "Ficha não encontrada" });
      }

      // Buscar as movimentações
      const movimentacoes = await Fichas.buscarMovimentacoes(id);
      
      res.json(movimentacoes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar movimentações" });
    }
  }
}

module.exports = new FichasController() 