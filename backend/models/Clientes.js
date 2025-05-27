const knex = require("../../backend/database/connection")

class ClientesModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("clientes")
      return result
    } catch (err) {
      console.log(err)
    }
  }

  async findById(idCliente) {
    try {
      const result = await knex.select(["*"]).where({ idCliente }).table("clientes")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
    }
  }

  async create(cliente) {
    try {
      const ids = await knex.insert(cliente).table("clientes")
      // Após criar, buscar o cliente completo para enviar via Socket
      const novoCliente = await this.findById(ids[0])
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('cliente_criado', novoCliente)
      }
      return novoCliente
    } catch (err) {
      console.log(err)
    }
  }

  async update(idCliente, cliente) {
    try {
      console.log('Model: '+JSON.stringify(cliente) + ' \n ' + idCliente)
      var result = await knex.update(cliente).where({ idCliente }).table("clientes")
      console.log('Result: '+ JSON.stringify(result))
      
      // Após atualizar, buscar o cliente completo para enviar via Socket
      const clienteAtualizado = await this.findById(idCliente)
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('cliente_atualizado', clienteAtualizado)
      }
      
      return { status: true, data: clienteAtualizado }
    } catch (err) {
      console.log(err)
      return { status: false, err }
    }
  }

  async delete(idCliente) {
    try {
      // Buscar o cliente antes de excluir para poder enviar os dados via Socket
      const clienteExcluido = await this.findById(idCliente)
      
      await knex.delete().where({ idCliente }).table("clientes")
      
      // Emitir evento para todos os clientes conectados
      if (global.io && clienteExcluido) {
        global.io.emit('cliente_excluido', clienteExcluido)
      }
      
      return { status: true, data: clienteExcluido }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new ClientesModel() 