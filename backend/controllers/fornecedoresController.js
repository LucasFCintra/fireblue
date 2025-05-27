const Fornecedores = require("../models/Fornecedores")

class FornecedoresController {
  async index(req, res) {
    const fornecedores = await Fornecedores.findAll()
    res.json(fornecedores)
  }

  async indexOne(req, res) {
    const id = req.params.idFornecedor
    const fornecedor = await Fornecedores.findById(id)
    if (!fornecedor) {
      res.status(404).json({})
    } else {
      res.json(fornecedor)
    }
  }

  async create(req, res) {
    const fornecedor = req.body
    if (fornecedor) {
      await Fornecedores.create(fornecedor)
      res.status(200).send("Fornecedor inserido com sucesso")
    } else {
      res.status(400).json({ err: "Informações indefinidas" })
    }
  }

  async update(req, res) {
    const { idFornecedor, ...dados } = req.body
    if (idFornecedor) {
      const result = await Fornecedores.update(idFornecedor, dados)
      if (result.status) {
        res.status(200).send("Fornecedor atualizado com sucesso")
      } else {
        res.status(406).send(result.err)
      }
    } else {
      res.status(406).send("ID inválido")
    }
  }

  async delete(req, res) {
    const id = req.params.idFornecedor
    const result = await Fornecedores.delete(id)
    if (result.status) {
      res.status(200).send("Fornecedor excluído com sucesso")
    } else {
      res.status(406).send(result.err)
    }
  }
}

module.exports = new FornecedoresController() 