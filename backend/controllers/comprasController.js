const Compras = require("../models/Compras")

class ComprasController {
  async index(req, res) {
    const compras = await Compras.findAll()
    res.json(compras)
  }

  async indexOne(req, res) {
    const id = req.params.idCompra
    const compra = await Compras.findById(id)
    if (!compra) {
      res.status(404).json({})
    } else {
      res.json(compra)
    }
  }

  async create(req, res) {
    const compra = req.body
    if (compra) {
      const resultado = await Compras.create(compra)
      if (resultado) {
        res.status(200).json({
          message: "Compra inserida com sucesso",
          data: resultado
        })
      } else {
        res.status(400).json({ err: "Erro ao inserir compra" })
      }
    } else {
      res.status(400).json({ err: "Informações indefinidas" })
    }
  }

  async update(req, res) {
    const { idCompra, ...dados } = req.body
    if (idCompra) {
      const result = await Compras.update(idCompra, dados)
      if (result.status) {
        res.status(200).json({
          message: "Compra atualizada com sucesso",
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
    const id = req.params.idCompra
    const result = await Compras.delete(id)
    if (result.status) {
      res.status(200).json({
        message: "Compra excluída com sucesso",
        data: result.data
      })
    } else {
      res.status(406).send(result.err)
    }
  }
}

module.exports = new ComprasController() 