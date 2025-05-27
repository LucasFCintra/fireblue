const knex = require("../../backend/database/connection")

class ProdutosModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("produtos")
      return result
    } catch (err) {
      console.log(err)
    }
  }

  async findById(idProduto) {
    try {
      const result = await knex.select(["*"]).where({ idProduto }).table("produtos")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
    }
  }

  async create(produto) {
    try {
      await knex.insert(produto).table("produtos")
    } catch (err) {
      console.log(err)
    }
  }

  async update(idProduto, produto) {
    try {
      await knex.update(produto).where({ idProduto }).table("produtos")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }

  async delete(idProduto) {
    try {
      await knex.delete().where({ idProduto }).table("produtos")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new ProdutosModel() 