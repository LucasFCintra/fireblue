const knex = require("../../backend/database/connection")

class TerceirosModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("terceiros")
      return result
    } catch (err) {
      console.log(err)
      return []
    }
  }

  async findById(idTerceiro) {
    try {
      const result = await knex.select(["*"]).where({ idTerceiro }).table("terceiros")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
      return undefined
    }
  }
  
  async findByTipo(tipo) {
    try {
      const result = await knex.select(["*"]).where({ tipo }).table("terceiros")
      return result
    } catch (err) {
      console.log(err)
      return []
    }
  }

  async create(terceiro) {
    try {
      const ids = await knex.insert(terceiro).table("terceiros")
      // Após criar, buscar o terceiro completo para enviar via Socket
      const novoTerceiro = await this.findById(ids[0])
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('terceiro_criado', novoTerceiro)
      }
      return novoTerceiro
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async update(idTerceiro, terceiro) {
    try {
      await knex.update(terceiro).where({ idTerceiro }).table("terceiros")
      
      // Após atualizar, buscar o terceiro completo para enviar via Socket
      const terceiroAtualizado = await this.findById(idTerceiro)
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('terceiro_atualizado', terceiroAtualizado)
      }
      
      return { status: true, data: terceiroAtualizado }
    } catch (err) {
      return { status: false, err }
    }
  }

  async delete(idTerceiro) {
    try {
      // Buscar o terceiro antes de excluir para poder enviar os dados via Socket
      const terceiroExcluido = await this.findById(idTerceiro)
      
      await knex.delete().where({ idTerceiro }).table("terceiros")
      
      // Emitir evento para todos os clientes conectados
      if (global.io && terceiroExcluido) {
        global.io.emit('terceiro_excluido', terceiroExcluido)
      }
      
      return { status: true, data: terceiroExcluido }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new TerceirosModel() 