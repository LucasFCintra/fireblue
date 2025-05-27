const knex = require("../../backend/database/connection")

class VendasModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("vendas")
      return result
    } catch (err) {
      console.log(err)
    }
  }

  async findById(idVenda) {
    try {
      const result = await knex.select(["*"]).where({ idVenda }).table("vendas")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
    }
  }

  async create(venda) {
    try {
      await knex.insert(venda).table("vendas")
    } catch (err) {
      console.log(err)
    }
  }

  async update(idVenda, venda) {
    try {
      await knex.update(venda).where({ idVenda }).table("vendas")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }

  async delete(idVenda) {
    try {
      await knex.delete().where({ idVenda }).table("vendas")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new VendasModel() 