const knex = require("../../backend/database/connection")

class ConfiguracoesModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("configuracoes")
      return result
    } catch (err) {
      console.log(err)
    }
  }

  async findById(idConfiguracao) {
    try {
      const result = await knex.select(["*"]).where({ idConfiguracao }).table("configuracoes")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
    }
  }

  async create(configuracao) {
    try {
      await knex.insert(configuracao).table("configuracoes")
    } catch (err) {
      console.log(err)
    }
  }

  async update(idConfiguracao, configuracao) {
    try {
      await knex.update(configuracao).where({ idConfiguracao }).table("configuracoes")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }

  async delete(idConfiguracao) {
    try {
      await knex.delete().where({ idConfiguracao }).table("configuracoes")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new ConfiguracoesModel() 