const Configuracoes = require("../models/Configuracoes")

class ConfiguracoesController {
  async index(req, res) {
    const configuracoes = await Configuracoes.findAll()
    res.json(configuracoes)
  }

  async indexOne(req, res) {
    const id = req.params.idConfiguracao
    const configuracao = await Configuracoes.findById(id)
    if (!configuracao) {
      res.status(404).json({})
    } else {
      res.json(configuracao)
    }
  }

  async create(req, res) {
    const configuracao = req.body
    if (configuracao) {
      await Configuracoes.create(configuracao)
      res.status(200).send("Configuração inserida com sucesso")
    } else {
      res.status(400).json({ err: "Informações indefinidas" })
    }
  }

  async update(req, res) {
    const { idConfiguracao, ...dados } = req.body
    if (idConfiguracao) {
      const result = await Configuracoes.update(idConfiguracao, dados)
      if (result.status) {
        res.status(200).send("Configuração atualizada com sucesso")
      } else {
        res.status(406).send(result.err)
      }
    } else {
      res.status(406).send("ID inválido")
    }
  }

  async delete(req, res) {
    const id = req.params.idConfiguracao
    const result = await Configuracoes.delete(id)
    if (result.status) {
      res.status(200).send("Configuração excluída com sucesso")
    } else {
      res.status(406).send(result.err)
    }
  }
}

module.exports = new ConfiguracoesController() 