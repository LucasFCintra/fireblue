const knex = require("../../backend/database/connection")

class ComprasModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("compras")
      return result
    } catch (err) {
      console.log(err)
    }
  }

  async findById(idCompra) {
    try {
      const result = await knex.select(["*"]).where({ idCompra }).table("compras")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
    }
  }

  async create(compra) {
    try {
      const ids = await knex.insert(compra).table("compras")
      // Após criar, buscar a compra completa para enviar via Socket
      const novaCompra = await this.findById(ids[0])
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('compra_criada', novaCompra)
      }
      return novaCompra
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async update(idCompra, compra) {
    try {
      await knex.update(compra).where({ idCompra }).table("compras")
      
      // Após atualizar, buscar a compra completa para enviar via Socket
      const compraAtualizada = await this.findById(idCompra)
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('compra_atualizada', compraAtualizada)
      }
      
      return { status: true, data: compraAtualizada }
    } catch (err) {
      return { status: false, err }
    }
  }

  async delete(idCompra) {
    try {
      // Buscar a compra antes de excluir para poder enviar os dados via Socket
      const compraExcluida = await this.findById(idCompra)
      
      await knex.delete().where({ idCompra }).table("compras")
      
      // Emitir evento para todos os clientes conectados
      if (global.io && compraExcluida) {
        global.io.emit('compra_excluida', compraExcluida)
      }
      
      return { status: true, data: compraExcluida }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new ComprasModel() 