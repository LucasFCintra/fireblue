const knex = require("../../backend/database/connection")

class CadastroModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("cadastro")
      return result
    } catch (err) {
      console.log(err)
    }
  }

  async findById(idCadastro) {
    try {
      const result = await knex.select(["*"]).where({ idCadastro }).table("cadastro")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
    }
  }

  async create(cadastro) {
    try {
      await knex.insert(cadastro).table("cadastro")
    } catch (err) {
      console.log(err)
    }
  }

  async update(idCadastro, cadastro) {
    try {
      await knex.update(cadastro).where({ idCadastro }).table("cadastro")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }

  async delete(idCadastro) {
    try {
      await knex.delete().where({ idCadastro }).table("cadastro")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new CadastroModel() 