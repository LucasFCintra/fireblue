const knex = require("../../backend/database/connection")

class CorteModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("cortes")
      return result
    } catch (err) {
      console.log(err)
      return []
    }
  }

  async findById(idCorte) {
    try {
      const result = await knex.select(["*"]).where({ idCorte }).table("cortes")
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
      const result = await knex.select(["*"]).where({ tipo }).table("cortes")
      return result
    } catch (err) {
      console.log(err)
      return []
    }
  }

  async create(corte) {
    try {
      const ids = await knex.insert(corte).table("cortes")
      // Após criar, buscar o corte completo para enviar via Socket
      const novoCorte = await this.findById(ids[0])
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('corte_criado', novoCorte)
      }
      return novoCorte
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async update(idCorte, corte) {
    try {
      await knex.update(corte).where({ idCorte }).table("cortes")
      
      // Após atualizar, buscar o corte completo para enviar via Socket
      const corteAtualizado = await this.findById(idCorte)
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('corte_atualizado', corteAtualizado)
      }
      
      return { status: true, data: corteAtualizado }
    } catch (err) {
      return { status: false, err }
    }
  }

  async delete(idCorte) {
    try {
      // Buscar o corte antes de excluir para poder enviar os dados via Socket
      const corteExcluido = await this.findById(idCorte)
      
      await knex.delete().where({ idCorte }).table("cortes")
      
      // Emitir evento para todos os clientes conectados
      if (global.io && corteExcluido) {
        global.io.emit('corte_excluido', corteExcluido)
      }
      
      return { status: true, data: corteExcluido }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new CorteModel()