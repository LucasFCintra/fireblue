const Inventario = require("../models/Inventario")

class InventarioController {
  async index(req, res) {
    const inventario = await Inventario.findAll()
    res.json({ items: inventario })
  }

  async indexOne(req, res) {
    const id = req.params.idInventario
    const item = await Inventario.findById(id)
    if (!item) {
      res.status(404).json({})
    } else {
      res.json(item)
    }
  }

  async create(req, res) {
    const item = req.body
    if (item) {
      await Inventario.create(item)
      res.status(200).send("Item de inventário inserido com sucesso")
    } else {
      res.status(400).json({ err: "Informações indefinidas" })
    }
  }

  async update(req, res) {
    let { idInventario, id, atualizado_em, ...dados } = req.body
    // Converter atualizado_em para o formato MySQL se existir
    if (atualizado_em) {
      const date = new Date(atualizado_em);
      atualizado_em = date.toISOString().slice(0, 19).replace('T', ' ');
      dados.atualizado_em = atualizado_em;
    }
    const idToUse = idInventario || id;
    if (idToUse) {
      const result = await Inventario.update(idToUse, dados)
      if (result.status) {
        res.status(200).send("Item de inventário atualizado com sucesso")
      } else {
        res.status(406).send(result.err)
      }
    } else {
      res.status(406).send("ID inválido")
    }
  }

  async delete(req, res) {
    const id = req.params.id 
    const result = await Inventario.delete(id)
    if (result.status) {
      res.status(200).send("Item de inventário excluído com sucesso")
    } else {
      res.status(406).send(result.err)
    }
  }
}

module.exports = new InventarioController() 