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
      const ids = await knex.insert(produto).table("produtos")
      // Após criar, buscar o produto completo para enviar via Socket
      const novoProduto = await this.findById(ids[0])
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('produto_criado', novoProduto)
      }
      return novoProduto
    } catch (err) {
      console.log(err)
    }
  }

  async update(idProduto, produto) {
    try {
      await knex.update(produto).where({ idProduto }).table("produtos")
      
      // Após atualizar, buscar o produto completo para enviar via Socket
      const produtoAtualizado = await this.findById(idProduto)
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('produto_atualizado', produtoAtualizado)
      }
      
      return { status: true, data: produtoAtualizado }
    } catch (err) {
      return { status: false, err }
    }
  }

  async delete(idProduto) {
    try {
      // Buscar o produto antes de excluir para poder enviar os dados via Socket
      const produtoExcluido = await this.findById(idProduto)
      
      await knex.delete().where({ idProduto }).table("produtos")
      
      // Emitir evento para todos os clientes conectados
      if (global.io && produtoExcluido) {
        global.io.emit('produto_excluido', produtoExcluido)
      }
      
      return { status: true, data: produtoExcluido }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new ProdutosModel() 