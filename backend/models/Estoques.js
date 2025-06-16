const knex = require("../database/connection")

class EstoqueModel {
  async findAll() {
    const result = await knex.select(["*"]).table("estoques")
    return result;
  }

  async findById(id) {
    const result = await knex.select(["*"]).where({ id }).table("estoques")
    return result[0];
  } 

  async create(estoque) {
    try {
      const ids = await knex.insert(estoque).table("estoques")
      const novoItem = await this.findById(ids[0])
      global.io.emit('estoque_item_criado', novoItem)
      return novoItem;
    } catch (err) {
      console.log('Model: Erro ao criar estoque: '+err)
      throw err;
    }
  }

  async update(id, estoque) {
    try {
      console.log('Model: Atualizando estoque: '+ JSON.stringify(estoque) +  ' \n id: '+id)
      await knex.update(estoque).where({ id }).table("estoques")
      const itemAtualizado = await this.findById(id)
      global.io.emit('estoque_item_atualizado', itemAtualizado)
      return itemAtualizado; 
    } catch (err) {
      console.log('Model: Erro ao atualizar estoque: '+err)
      throw err;
    }
  }

  async delete(id) {
    try {
      const itemExcluido = await this.findById(id)
      await knex.delete().where({ id }).table("estoques")
      global.io.emit('estoque_item_excluido', itemExcluido)
      return itemExcluido;
    } catch (err) {
      console.log('Model: Erro ao excluir estoque: '+err)
      throw err;
    }
  }
}

module.exports = new EstoqueModel() 