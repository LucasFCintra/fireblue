const Terceiros = require("../models/Terceiros")

class TerceirosController {
  async index(req, res) {
    const terceiros = await Terceiros.findAll()
    res.json(terceiros)
  }

  async indexOne(req, res) {
    const id = req.params.idTerceiro
    const terceiro = await Terceiros.findById(id)
    if (!terceiro) {
      res.status(404).json({})
    } else {
      res.json(terceiro)
    }
  }

  async indexByTipo(req, res) {
    const tipo = req.params.tipo
    const terceiros = await Terceiros.findByTipo(tipo)
    res.json(terceiros)
  }

  async create(req, res) {
    const terceiro = req.body
    if (terceiro) {
      const resultado = await Terceiros.create(terceiro)
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
    const { idTerceiro, ...dados } = req.body
    if (idTerceiro) {
      const result = await Terceiros.update(idTerceiro, dados)
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
    const result = await Terceiros.delete(id)
    if (result.status) {
      res.status(200).json({
        message: "Terceiro excluído com sucesso",
        data: result.data
      })
    } else {
      res.status(406).send(result.err)
    }
  }
}

module.exports = new TerceirosController() 