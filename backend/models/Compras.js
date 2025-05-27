const knex = require("../../backend/database/connection")

class ComprasModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("compras")
      return result
    } catch (err) {
      console.log(err)
    }
  }

  async findById(idCompra) {
    try {
      const result = await knex.select(["*"]).where({ idCompra }).table("compras")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
    }
  }

  async create(compra) {
    try {
      await knex.insert(compra).table("compras")
    } catch (err) {
      console.log(err)
    }
  }

  async update(idCompra, compra) {
    try {
      await knex.update(compra).where({ idCompra }).table("compras")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }

  async delete(idCompra) {
    try {
      await knex.delete().where({ idCompra }).table("compras")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new ComprasModel() 