const knex = require("../../backend/database/connection")

class OrdensModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("ordens")
      return result
    } catch (err) {
      console.log(err)
    }
  }

  async findById(idOrdem) {
    try {
      const result = await knex.select(["*"]).where({ idOrdem }).table("ordens")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
    }
  }

  async create(ordem) {
    try {
      await knex.insert(ordem).table("ordens")
    } catch (err) {
      console.log(err)
    }
  }

  async update(idOrdem, ordem) {
    try {
      await knex.update(ordem).where({ idOrdem }).table("ordens")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }

  async delete(idOrdem) {
    try {
      await knex.delete().where({ idOrdem }).table("ordens")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new OrdensModel() 