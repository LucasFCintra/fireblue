const knex = require("../../backend/database/connection")

class RelatoriosModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("relatorios")
      return result
    } catch (err) {
      console.log(err)
    }
  }

  async findById(idRelatorio) {
    try {
      const result = await knex.select(["*"]).where({ idRelatorio }).table("relatorios")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
    }
  }

  async create(relatorio) {
    try {
      await knex.insert(relatorio).table("relatorios")
    } catch (err) {
      console.log(err)
    }
  }

  async update(idRelatorio, relatorio) {
    try {
      await knex.update(relatorio).where({ idRelatorio }).table("relatorios")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }

  async delete(idRelatorio) {
    try {
      await knex.delete().where({ idRelatorio }).table("relatorios")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new RelatoriosModel() 