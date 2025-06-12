const Vendas = require("../models/Vendas")

class VendasController {
  async index(req, res) {
    const vendas = await Vendas.findAll()
    res.json(vendas)
  }

  async indexOne(req, res) {
    const id = req.params.idVenda
    const venda = await Vendas.findById(id)
    if (!venda) {
      res.status(404).json({})
    } else {
      res.json(venda)
    }
  }

  async create(req, res) {
    const venda = req.body
    if (venda) {
      const resultado = await Vendas.create(venda)
      if (resultado) {
        res.status(200).json({
          message: "Venda inserida com sucesso",
          data: resultado
        })
      } else {
        res.status(400).json({ err: "Erro ao inserir venda" })
      }
    } else {
      res.status(400).json({ err: "Informações indefinidas" })
    }
  }

  async update(req, res) {
    const { idVenda, ...dados } = req.body
    if (idVenda) {
      const result = await Vendas.update(idVenda, dados)
      if (result.status) {
        res.status(200).json({
          message: "Venda atualizada com sucesso",
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
    const id = req.params.idVenda
    const result = await Vendas.delete(id)
    if (result.status) {
      res.status(200).json({
        message: "Venda excluída com sucesso",
        data: result.data
      })
    } else {
      res.status(406).send(result.err)
    }
  }
}

module.exports = new VendasController() 