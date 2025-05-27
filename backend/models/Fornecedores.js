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
      const ids = await knex.insert(fornecedor).table("fornecedores")
      // Após criar, buscar o fornecedor completo para enviar via Socket
      const novoFornecedor = await this.findById(ids[0])
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('fornecedor_criado', novoFornecedor)
      }
      return novoFornecedor
    } catch (err) {
      console.log(err)
    }
  }

  async update(idFornecedor, fornecedor) {
    try {
      await knex.update(fornecedor).where({ idFornecedor }).table("fornecedores")
      
      // Após atualizar, buscar o fornecedor completo para enviar via Socket
      const fornecedorAtualizado = await this.findById(idFornecedor)
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('fornecedor_atualizado', fornecedorAtualizado)
      }
      
      return { status: true, data: fornecedorAtualizado }
    } catch (err) {
      return { status: false, err }
    }
  }

  async delete(idFornecedor) {
    try {
      // Buscar o fornecedor antes de excluir para poder enviar os dados via Socket
      const fornecedorExcluido = await this.findById(idFornecedor)
      
      await knex.delete().where({ idFornecedor }).table("fornecedores")
      
      // Emitir evento para todos os clientes conectados
      if (global.io && fornecedorExcluido) {
        global.io.emit('fornecedor_excluido', fornecedorExcluido)
      }
      
      return { status: true, data: fornecedorExcluido }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new FornecedoresModel() 