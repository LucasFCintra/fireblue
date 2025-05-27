const knex = require("../../backend/database/connection")

class InventarioModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("inventario")
      console.log(result)
      return result
    } catch (err) {
      console.log(err)
    }
  }

  async findById(idInventario) {
    try {
      const result = await knex.select(["*"]).where({ idInventario }).table("inventario")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
    }
  }

  async create(inventario) {
    try {
      await knex.insert(inventario).table("inventario")
    } catch (err) {
      console.log(err)
    }
  }

  async update(id, inventario) {
    try {
      console.log('Model: Atualizando inventario: '+ JSON.stringify(inventario) +  ' \n id: '+id)
      await knex.update(inventario).where({ id:id }).table("inventario")
      return { status: true }
    } catch (err) {
      console.log('Model: Erro ao atualizar inventario: '+err)
      return { status: false, err }
    }
  }

  async delete(id ) {
    try {
      await knex.delete().where({ id  }).table("inventario")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new InventarioModel() 