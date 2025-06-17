const knex = require("../../backend/database/connection")
const { v4: uuidv4 } = require('uuid');

class ProdutosModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("produtos")
      return result
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async findById(id) {
    try {
      const result = await knex.select(["*"]).where({ id }).table("produtos")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async create(produto) {
    try {
      // Garantir que os campos numéricos sejam do tipo correto
      const produtoFormatado = {
        ...produto,
        valor_unitario: produto.valor_unitario ? parseFloat(produto.valor_unitario) : 0,
        quantidade: produto.quantidade ? parseInt(produto.quantidade) : 0,
        estoque_minimo: produto.estoque_minimo ? parseInt(produto.estoque_minimo) : 0
      };

      const result = await knex.insert(produtoFormatado).table("produtos")
      return await this.findById(result[0])
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async update(id, dados) {
    try {
      // Garantir que os campos numéricos sejam do tipo correto
      const dadosFormatados = {
        ...dados,
        valor_unitario: dados.valor_unitario ? parseFloat(dados.valor_unitario) : 0,
        quantidade: dados.quantidade ? parseInt(dados.quantidade) : 0,
        estoque_minimo: dados.estoque_minimo ? parseInt(dados.estoque_minimo) : 0
      };

      await knex.update(dadosFormatados).where({ id }).table("produtos")
      return { status: true, data: await this.findById(id) }
    } catch (err) {
      console.log(err)
      return { status: false, err: err.message }
    }
  }

  async delete(id) {
    try {
      const produto = await this.findById(id)
      if (!produto) {
        return { status: false, err: "Produto não encontrado" }
      }
      await knex.delete().where({ id }).table("produtos")
      return { status: true, data: produto }
    } catch (err) {
      console.log(err)
      return { status: false, err: err.message }
    }
  }

  async search(termo) {
    try {
      const result = await knex("produtos")
        .where("nome_produto", "like", `%${termo}%`)
        .orWhere("sku", "like", `%${termo}%`)
        .orWhere("codigo_barras", "like", `%${termo}%`)
        .select("*")
      return result
    } catch (err) {
      console.log(err)
      throw err
    }
  }
}

module.exports = new ProdutosModel() 