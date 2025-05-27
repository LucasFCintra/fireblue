const Clientes = require("../models/Clientes")

class ClientesController {
  async index(req, res) {
    const clientes = await Clientes.findAll()
    res.json(clientes)
  }

  async indexOne(req, res) {
    const id = req.params.idCliente
    const cliente = await Clientes.findById(id)
    if (!cliente) {
      res.status(404).json({})
    } else {
      res.json(cliente)
    }
  }

  async create(req, res) {
    const cliente = req.body
    if (cliente) {
      await Clientes.create(cliente)
      res.status(200).send("Cliente inserido com sucesso")
    } else {
      res.status(400).json({ err: "Informações indefinidas" })
    }
  }

  async update(req, res) {
    let { idCliente, atualizado_em, ...dados } = req.body
    if (atualizado_em) {
      const date = new Date(atualizado_em);
      atualizado_em = date.toISOString().slice(0, 19).replace('T', ' ');
      dados.atualizado_em = atualizado_em;
    }
    if (idCliente) {
      const result = await Clientes.update(idCliente, dados)
      if (result.status) {
        res.status(200).send("Cliente atualizado com sucesso")
      } else {
        res.status(406).send(result.err)
      }
    } else {
      res.status(406).send("ID inválido")
    }
  }

  async delete(req, res) {
    const id = req.params.idCliente
    const result = await Clientes.delete(id)
    if (result.status) {
      res.status(200).send("Cliente excluído com sucesso")
    } else {
      res.status(406).send(result.err)
    }
  }
}

module.exports = new ClientesController() 