const Relatorios = require("../models/Relatorios")

class RelatoriosController {
  async index(req, res) {
    const relatorios = await Relatorios.findAll()
    res.json(relatorios)
  }

  async indexOne(req, res) {
    const id = req.params.idRelatorio
    const relatorio = await Relatorios.findById(id)
    if (!relatorio) {
      res.status(404).json({})
    } else {
      res.json(relatorio)
    }
  }

  async create(req, res) {
    const relatorio = req.body
    if (relatorio) {
      await Relatorios.create(relatorio)
      res.status(200).send("Relatório inserido com sucesso")
    } else {
      res.status(400).json({ err: "Informações indefinidas" })
    }
  }

  async update(req, res) {
    const { idRelatorio, ...dados } = req.body
    if (idRelatorio) {
      const result = await Relatorios.update(idRelatorio, dados)
      if (result.status) {
        res.status(200).send("Relatório atualizado com sucesso")
      } else {
        res.status(406).send(result.err)
      }
    } else {
      res.status(406).send("ID inválido")
    }
  }

  async delete(req, res) {
    const id = req.params.idRelatorio
    const result = await Relatorios.delete(id)
    if (result.status) {
      res.status(200).send("Relatório excluído com sucesso")
    } else {
      res.status(406).send(result.err)
    }
  }
}

module.exports = new RelatoriosController() 