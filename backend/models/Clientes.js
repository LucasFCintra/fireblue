const knex = require("../../backend/database/connection")

class ClientesModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("clientes")
      return result
    } catch (err) {
      console.log(err)
    }
  }

  async findById(idCliente) {
    try {
      const result = await knex.select(["*"]).where({ idCliente }).table("clientes")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
    }
  }

  async create(cliente) {
    try {
      await knex.insert(cliente).table("clientes")
    } catch (err) {
      console.log(err)
    }
  }

  async update(idCliente, cliente) {
    try {
      console.log('Model: '+JSON.stringify(cliente) + ' \n ' + idCliente)
      await knex.update(cliente).where({ idCliente }).table("clientes")
      return { status: true }
    } catch (err) {
      console.log(err)
      return { status: false, err }
    }
  }

  async delete(idCliente) {
    try {
      await knex.delete().where({ idCliente }).table("clientes")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new ClientesModel() 