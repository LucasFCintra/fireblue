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

  async findById(id) {
    try {
      const result = await knex.select(["*"]).where({ id }).table("fichas")
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

  async create(fichas) {
    try {
      const ids = await knex.insert(fichas).table("fichas")
      // Após criar, buscar o fichas completo para enviar via Socket
      const novoFichas = await this.findById(ids[0])
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('fichas_criado', novoFichas)
      }
      return novoFichas
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async update(id, fichas) {
    try {
      console.log('Model: '+id)
      console.log('Model: '+fichas)

      await knex.update(fichas).where({ id }).table("fichas")
      
      // Após atualizar, buscar o fichas completo para enviar via Socket
      const fichasAtualizado = await this.findById(id)
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('fichas_atualizado', fichasAtualizado)
      }
      
      return { status: true, data: fichasAtualizado }
    } catch (err) {
      return { status: false, err }
    }
  }

  async delete(idFichas) {
    try {
      // Buscar o fichas antes de excluir para poder enviar os dados via Socket
      const fichasExcluido = await this.findById(idFichas)
      
      await knex.delete().where({ idFichas }).table("fichas")
      
      // Emitir evento para todos os clientes conectados
      if (global.io && fichasExcluido) {
        global.io.emit('fichas_excluido', fichasExcluido)
      }
      
      return { status: true, data: fichasExcluido }
    } catch (err) {
      return { status: false, err }
    }
  }

  async registrarMovimentacao(fichaId, movimentacao) {
    try {
      const { tipo, quantidade, descricao, responsavel } = movimentacao;
      
      // Inserir a movimentação
      const [id] = await knex('movimentacoes_fichas').insert({
        ficha_id: fichaId,
        data: new Date(),
        tipo,
        quantidade,
        descricao,
        responsavel
      });

      // Atualizar o status da ficha se for uma conclusão
      if (tipo === 'Conclusão') {
        await knex('fichas')
          .where({ id: fichaId })
          .update({ status: 'concluido' });
      }

      return id;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  async buscarMovimentacoes(fichaId) {
    try {
      const movimentacoes = await knex('movimentacoes_fichas')
        .where({ ficha_id: fichaId })
        .orderBy('data', 'desc');
      
      return movimentacoes;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async registrarRecebimentoParcial(fichaId, dados) {
    try {
      const { quantidade_recebida, observacoes, data_recebimento } = dados;
      
      // Buscar a ficha atual
      const ficha = await this.findById(fichaId);
      if (!ficha) {
        throw new Error('Ficha não encontrada');
      }

      // Calcular quantidade restante
      const quantidade_restante = ficha.quantidade - quantidade_recebida;
      
      // Registrar o recebimento parcial
      const [id] = await knex('recebimentos_parciais').insert({
        ficha_id: fichaId,
        quantidade_recebida,
        quantidade_restante,
        observacoes,
        data_recebimento: new Date(data_recebimento)
      });

      // Se a quantidade restante for 0, atualizar o status para concluído
      if (quantidade_restante === 0) {
        await knex('fichas')
          .where({ id: fichaId })
          .update({ status: 'concluido' });
      }

      // Buscar a ficha atualizada
      const fichaAtualizada = await this.findById(fichaId);
      
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('ficha_atualizada', fichaAtualizada);
      }

      return { status: true, data: fichaAtualizada };
    } catch (err) {
      console.log(err);
      return { status: false, err };
    }
  }

  async buscarRecebimentosParciais(fichaId) {
    try {
      const recebimentos = await knex('recebimentos_parciais')
        .where({ ficha_id: fichaId })
        .orderBy('data_recebimento', 'desc');
      
      return recebimentos;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}

module.exports = new FichasModel() 