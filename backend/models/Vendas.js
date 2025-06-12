const knex = require("../../backend/database/connection")

class VendasModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("vendas")
      return result
    } catch (err) {
      console.log(err)
    }
  }

  async findById(idVenda) {
    try {
      const result = await knex.select(["*"]).where({ idVenda }).table("vendas")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
    }
  }

  async create(venda) {
    try {
      const ids = await knex.insert(venda).table("vendas")
      // Após criar, buscar a venda completa para enviar via Socket
      const novaVenda = await this.findById(ids[0])
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('venda_criada', novaVenda)
      }
      return novaVenda
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async update(idVenda, venda) {
    try {
      await knex.update(venda).where({ idVenda }).table("vendas")
      
      // Após atualizar, buscar a venda completa para enviar via Socket
      const vendaAtualizada = await this.findById(idVenda)
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('venda_atualizada', vendaAtualizada)
      }
      
      return { status: true, data: vendaAtualizada }
    } catch (err) {
      return { status: false, err }
    }
  }

  async delete(idVenda) {
    try {
      // Buscar a venda antes de excluir para poder enviar os dados via Socket
      const vendaExcluida = await this.findById(idVenda)
      
      await knex.delete().where({ idVenda }).table("vendas")
      
      // Emitir evento para todos os clientes conectados
      if (global.io && vendaExcluida) {
        global.io.emit('venda_excluida', vendaExcluida)
      }
      
      return { status: true, data: vendaExcluida }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new VendasModel() 