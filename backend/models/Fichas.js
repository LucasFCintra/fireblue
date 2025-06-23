const knex = require("../database/connection")
const Produtos = require("./Produtos")

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
      
      console.log('Tipo da movimentação:', tipo);
      console.log('Movimentação completa:', movimentacao);
      console.log('idF:', fichaId);
      
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

      // Atualizar a quantidade do produto relacionado
      const ficha = await this.findById(fichaId);
      console.log('1',ficha,ficha.produto_id)
      if (ficha && ficha.produto_id && quantidade > 0) {
        const produto = await Produtos.findById(ficha.produto_id);
        console.log(produto)
        console.log('RM: '+ficha.produto_id)        
        if (produto) {
          const novaQuantidade = (produto.quantidade || 0) + quantidade;
          console.log('5',novaQuantidade)
          const attProd = await Produtos.update(ficha.produto_id, { ...produto, quantidade: novaQuantidade });
          console.log(attProd)
        }
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
      
      console.log('1',dados, fichaId)
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

      // Atualizar a quantidade do produto relacionado

      console.log('2',ficha.produto_id, ' ', quantidade_recebida)
      if (ficha.produto_id && quantidade_recebida > 0) {
        const Produtos = require('./Produtos');
        const produto = await Produtos.findById(ficha.produto_id);
        console.log("3",produto)
        if (produto) {
          const novaQuantidade = (produto.quantidade || 0) + quantidade_recebida;
          console.log('4:',novaQuantidade)
        const attProd =  await Produtos.update(ficha.produto_id, { ...produto, quantidade: novaQuantidade });
          console.log('5:',attProd)

        }
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

  async getMonthlyStats() {
    try {
      const currentDate = new Date();
      const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

      const [stats] = await knex.raw(`
        SELECT 
          COUNT(*) as total_criadas,
          SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) as total_concluidas,
          SUM(quantidade_recebida) as total_recebidas
        FROM fichas
        WHERE data_entrada BETWEEN ? AND ?
      `, [firstDayOfMonth, lastDayOfMonth]);

      console.log(stats[0])
      return stats[0];
    } catch (error) {
      console.error('Erro ao buscar estatísticas mensais:', error);
      throw error;
    }
  }
  async getRelatorio(dataInicio, dataFim) {
    try {
      // Se não vierem datas, usa o mês atual como padrão
      let firstDay = dataInicio ? new Date(dataInicio) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      let lastDay = dataFim ? new Date(dataFim) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

      const [stats] = await knex.raw(`
        SELECT 
          COUNT(*) as total_criadas,
          SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) as total_concluidas,
          SUM(quantidade_recebida) as total_recebidas
        FROM fichas
        WHERE data_entrada BETWEEN ? AND ?
      `, [firstDay, lastDay]);

      return stats[0];
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      throw error;
    }
  }

  async getRecebidosUltimosMeses(qtdMeses = 5) {
    try {
      const result = await knex('fichas')
        .select(
          knex.raw("DATE_FORMAT(data_entrada, '%Y-%m') as mes"),
          knex.raw("SUM(quantidade_recebida) as total_recebido")
        )
        .whereNotNull('quantidade_recebida')
        .andWhere('data_entrada', '>=', knex.raw(`DATE_SUB(CURDATE(), INTERVAL ${qtdMeses-1} MONTH)`))
        .groupByRaw("DATE_FORMAT(data_entrada, '%Y-%m')")
        .orderByRaw("mes DESC")
        .limit(qtdMeses);

      // Ordena do mais antigo para o mais recente
      return result.reverse();
    } catch (error) {
      console.error('Erro ao buscar recebidos últimos meses:', error);
      throw error;
    }
  }

  async getPerdidasUltimosMeses(qtdMeses = 5) {
    try {
      const result = await knex('fichas')
        .select(
          knex.raw("DATE_FORMAT(data_entrada, '%Y-%m') as mes"),
          knex.raw("SUM(quantidade_perdida) as total_perdido")
        )
        .whereNotNull('quantidade_perdida')
        .andWhere('data_entrada', '>=', knex.raw(`DATE_SUB(CURDATE(), INTERVAL ${qtdMeses-1} MONTH)`))
        .groupByRaw("DATE_FORMAT(data_entrada, '%Y-%m')")
        .orderByRaw("mes DESC")
        .limit(qtdMeses);

      // Ordena do mais antigo para o mais recente
      return result.reverse();
    } catch (error) {
      console.error('Erro ao buscar perdidos últimos meses:', error);
      throw error;
    }
  }

  async getCortadasUltimosMeses(qtdMeses = 5) {
    try {
      const result = await knex('fichas')
        .select(
          knex.raw("DATE_FORMAT(data_entrada, '%Y-%m') as mes"),
          knex.raw("SUM(quantidade) as total_cortada")
        )
        .whereNotNull('quantidade')
        .andWhere('data_entrada', '>=', knex.raw(`DATE_SUB(CURDATE(), INTERVAL ${qtdMeses-1} MONTH)`))
        .groupByRaw("DATE_FORMAT(data_entrada, '%Y-%m')")
        .orderByRaw("mes DESC")
        .limit(qtdMeses);

      // Ordena do mais antigo para o mais recente
      return result.reverse();
    } catch (error) {
      console.error('Erro ao buscar cortadas últimos meses:', error);
      throw error;
    }
  }
}

module.exports = new FichasModel() 