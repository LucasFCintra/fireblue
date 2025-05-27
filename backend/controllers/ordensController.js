const Ordens = require("../models/Ordens")

class OrdensController {
  async index(req, res) {
    const ordens = await Ordens.findAll()
    res.json(ordens)
  }

  async indexOne(req, res) {
    const id = req.params.idOrdem
    const ordem = await Ordens.findById(id)
    if (!ordem) {
      res.status(404).json({})
    } else {
      res.json(ordem)
    }
  }

  async create(req, res) {
    const ordem = req.body
    if (ordem) {
      await Ordens.create(ordem)
      res.status(200).send("Ordem inserida com sucesso")
    } else {
      res.status(400).json({ err: "Informações indefinidas" })
    }
  }

  async update(req, res) {
    const { idOrdem, ...dados } = req.body
    if (idOrdem) {
      const result = await Ordens.update(idOrdem, dados)
      if (result.status) {
        res.status(200).send("Ordem atualizada com sucesso")
      } else {
        res.status(406).send(result.err)
      }
    } else {
      res.status(406).send("ID inválido")
    }
  }

  async delete(req, res) {
    const id = req.params.idOrdem
    const result = await Ordens.delete(id)
    if (result.status) {
      res.status(200).send("Ordem excluída com sucesso")
    } else {
      res.status(406).send(result.err)
    }
  }
}

module.exports = new OrdensController() 