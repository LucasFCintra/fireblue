const knex = require("../../backend/database/connection")

class FornecedoresModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("fornecedores")
      return result
    } catch (err) {
      console.log(err)
    }
  }

  async findById(idFornecedor) {
    try {
      const result = await knex.select(["*"]).where({ idFornecedor }).table("fornecedores")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
    }
  }

  async create(fornecedor) {
    try {
      await knex.insert(fornecedor).table("fornecedores")
    } catch (err) {
      console.log(err)
    }
  }

  async update(idFornecedor, fornecedor) {
    try {
      await knex.update(fornecedor).where({ idFornecedor }).table("fornecedores")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }

  async delete(idFornecedor) {
    try {
      await knex.delete().where({ idFornecedor }).table("fornecedores")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new FornecedoresModel() 