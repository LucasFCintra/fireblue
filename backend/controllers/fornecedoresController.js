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
      const resultado = await Fornecedores.create(fornecedor)
      if (resultado) {
        res.status(200).json({
          message: "Fornecedor inserido com sucesso",
          data: resultado
        })
      } else {
        res.status(400).json({ err: "Erro ao inserir fornecedor" })
      }
    } else {
      res.status(400).json({ err: "Informações indefinidas" })
    }
  }

  async update(req, res) {
    const { idFornecedor, ...dados } = req.body
    if (idFornecedor) {
      const result = await Fornecedores.update(idFornecedor, dados)
      if (result.status) {
        res.status(200).json({
          message: "Fornecedor atualizado com sucesso",
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
    const id = req.params.idFornecedor
    const result = await Fornecedores.delete(id)
    if (result.status) {
      res.status(200).json({
        message: "Fornecedor excluído com sucesso",
        data: result.data
      })
    } else {
      res.status(406).send(result.err)
    }
  }
}

module.exports = new FornecedoresController() 