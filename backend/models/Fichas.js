const knex = require("../database/connection")

class FichasModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("fichas")
   
      return result
    } catch (err) {
      console.log(err)
      return []
    }
  }

  async findById(idTerceiro) {
    try {
      const result = await knex.select(["*"]).where({ idTerceiro }).table("fichas")
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
      const result = await knex.select(["*"]).where({ tipo }).table("fichas")
      return result
    } catch (err) {
      console.log(err)
      return []
    }
  }

  async findByStatus(status) {
    try {
      const result = await knex.select(["*"]).where({ status }).table("fichas")
      return result
    } catch (err) {
      console.log(err)
      return []
    }
  }

  async countByStatus(status) {
    try {
      const result = await knex('fichas')
        .count('* as total')
        .where({ status })
        .first()
      return result.total
    } catch (err) {
      console.log(err)
      return 0
    }
  }

  async getStatusSummary() {
    try {
      const aguardandoRetirada = await this.countByStatus('aguardando_retirada')
      const emProducao = await this.countByStatus('em_producao')
      const concluido = await this.countByStatus('concluido')

      return {
        aguardando_retirada: aguardandoRetirada,
        em_producao: emProducao,
        concluido: concluido
      }
    } catch (err) {
      console.log(err)
      return {
        aguardando_retirada: 0,
        em_producao: 0,
        concluido: 0
      }
    }
  }

  async create(terceiro) {
    try {
      const ids = await knex.insert(terceiro).table("fichas")
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
      await knex.update(terceiro).where({ idTerceiro }).table("fichas")
      
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
      
      await knex.delete().where({ idTerceiro }).table("fichas")
      
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

module.exports = new FichasModel() 