const knex = require("../../backend/database/connection")

class InventarioModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("inventario")
      console.log(result)
      return result
    } catch (err) {
      console.log(err)
    }
  }

  async findById(idInventario) {
    try {
      const result = await knex.select(["*"]).where({ idInventario }).table("inventario")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
    }
  }

  async create(inventario) {
    try {
      const ids = await knex.insert(inventario).table("inventario")
      // Após criar, buscar o item completo para enviar via Socket
      const novoItem = await this.findById(ids[0])
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('inventario_item_criado', novoItem)
      }
      return novoItem
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async update(id, inventario) {
    try {
      console.log('Model: Atualizando inventario: '+ JSON.stringify(inventario) +  ' \n id: '+id)
      await knex.update(inventario).where({ id:id }).table("inventario")
      
      // Após atualizar, buscar o item completo para enviar via Socket
      const itemAtualizado = await this.findById(id)
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('inventario_item_atualizado', itemAtualizado)
      }
      
      return { status: true, data: itemAtualizado }
    } catch (err) {
      console.log('Model: Erro ao atualizar inventario: '+err)
      return { status: false, err }
    }
  }

  async delete(id) {
    try {
      // Buscar o item antes de excluir para poder enviar os dados via Socket
      const itemExcluido = await this.findById(id)
      
      await knex.delete().where({ id }).table("inventario")
      
      // Emitir evento para todos os clientes conectados
      if (global.io && itemExcluido) {
        global.io.emit('inventario_item_excluido', itemExcluido)
      }
      
      return { status: true, data: itemExcluido }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new InventarioModel() 