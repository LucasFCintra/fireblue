const knex = require("../../backend/database/connection")


class RecebimentosParciais {
  static async create(recebimento) {
    try {
      const [id] = await knex('recebimentos_parciais').insert(recebimento);
      return this.findById(id);
    } catch (error) {
      console.error('Erro ao criar recebimento parcial:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      return await knex('recebimentos_parciais')
        .where({ id })
        .first();
    } catch (error) {
      console.error('Erro ao buscar recebimento parcial:', error);
      throw error;
    }
  }

  static async findByFichaId(fichaId) {
    try {
      return await knex('recebimentos_parciais')
        .where({ ficha_id: fichaId })
        .orderBy('data_recebimento', 'desc');
    } catch (error) {
      console.error('Erro ao buscar recebimentos parciais da ficha:', error);
      throw error;
    }
  }

  static async update(id, recebimento) {
    try {
      await knex('recebimentos_parciais')
        .where({ id })
        .update({
          ...recebimento,
          updated_at: knex.fn.now()
        });
      return this.findById(id);
    } catch (error) {
      console.error('Erro ao atualizar recebimento parcial:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      await knex('recebimentos_parciais')
        .where({ id })
        .delete();
      return true;
    } catch (error) {
      console.error('Erro ao deletar recebimento parcial:', error);
      throw error;
    }
  }
}

module.exports = RecebimentosParciais; 