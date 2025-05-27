const Produtos = require("../models/Produtos")

class ProdutosController {
  async index(req, res) {
    const produtos = await Produtos.findAll()
    res.json(produtos)
  }

  async indexOne(req, res) {
    const id = req.params.idProduto
    const produto = await Produtos.findById(id)
    if (!produto) {
      res.status(404).json({})
    } else {
      res.json(produto)
    }
  }

  async create(req, res) {
    const produto = req.body
    if (produto) {
      await Produtos.create(produto)
      res.status(200).send("Produto inserido com sucesso")
    } else {
      res.status(400).json({ err: "Informações indefinidas" })
    }
  }

  async update(req, res) {
    const { idProduto, ...dados } = req.body
    if (idProduto) {
      const result = await Produtos.update(idProduto, dados)
      if (result.status) {
        res.status(200).send("Produto atualizado com sucesso")
      } else {
        res.status(406).send(result.err)
      }
    } else {
      res.status(406).send("ID inválido")
    }
  }

  async delete(req, res) {
    const id = req.params.idProduto
    const result = await Produtos.delete(id)
    if (result.status) {
      res.status(200).send("Produto excluído com sucesso")
    } else {
      res.status(406).send(result.err)
    }
  }
}

module.exports = new ProdutosController() 