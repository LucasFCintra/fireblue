const Cadastro = require("../models/Cadastro")

class CadastroController {
  async index(req, res) {
    const cadastros = await Cadastro.findAll()
    res.json(cadastros)
  }

  async indexOne(req, res) {
    const id = req.params.idCadastro
    const cadastro = await Cadastro.findById(id)
    if (!cadastro) {
      res.status(404).json({})
    } else {
      res.json(cadastro)
    }
  }

  async create(req, res) {
    const cadastro = req.body
    if (cadastro) {
      await Cadastro.create(cadastro)
      res.status(200).send("Cadastro inserido com sucesso")
    } else {
      res.status(400).json({ err: "Informações indefinidas" })
    }
  }

  async update(req, res) {
    const { idCadastro, ...dados } = req.body
    if (idCadastro) {
      const result = await Cadastro.update(idCadastro, dados)
      if (result.status) {
        res.status(200).send("Cadastro atualizado com sucesso")
      } else {
        res.status(406).send(result.err)
      }
    } else {
      res.status(406).send("ID inválido")
    }
  }

  async delete(req, res) {
    const id = req.params.idCadastro
    const result = await Cadastro.delete(id)
    if (result.status) {
      res.status(200).send("Cadastro excluído com sucesso")
    } else {
      res.status(406).send(result.err)
    }
  }
}

module.exports = new CadastroController() 