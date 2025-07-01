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
      // Se vier produto_id mas não vier produto, buscar o nome do produto
      if ((!fichas.produto || fichas.produto === '') && fichas.produto_id) {
        const produto = await Produtos.findById(fichas.produto_id);
        if (produto) {
          fichas.produto = produto.nome_produto;
        }
      }
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
      console.log('Model: '+ fichas.produto + '\n'+JSON.stringify(fichas))

      // Se vier produto_id mas não vier produto, buscar o nome do produto
      if ((!fichas.produto || fichas.produto === '') && fichas.produto_id) {
        const produto = await Produtos.findById(fichas.produto_id);
        if (produto) {
          fichas.produto = produto.nome_produto;
        }
      }

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

  async delete(id) {
    try {
      console.log('Iniciando exclusão da ficha ID:', id);
      
      // Buscar o fichas antes de excluir para poder enviar os dados via Socket
      const fichasExcluido = await this.findById(id)
      console.log('Ficha encontrada:', fichasExcluido);
      
      if (!fichasExcluido) {
        console.log('Ficha não encontrada');
        return { status: false, err: "Ficha não encontrada" }
      }
      
      // Excluir movimentações relacionadas primeiro
      console.log('Excluindo movimentações...');
      const movimentacoesDeletadas = await knex.delete().where({ ficha_id: id }).table("movimentacoes_fichas")
      console.log('Movimentações deletadas:', movimentacoesDeletadas);
      
      // Excluir recebimentos parciais relacionados
      console.log('Excluindo recebimentos parciais...');
      const recebimentosDeletados = await knex.delete().where({ ficha_id: id }).table("recebimentos_parciais")
      console.log('Recebimentos deletados:', recebimentosDeletados);
      
      // Excluir a ficha
      console.log('Excluindo a ficha...');
      const fichaDeletada = await knex.delete().where({ id }).table("fichas")
      console.log('Ficha deletada:', fichaDeletada);
      
      // Emitir evento para todos os clientes conectados
      if (global.io && fichasExcluido) {
        global.io.emit('fichas_excluido', fichasExcluido)
      }
      
      console.log('Exclusão concluída com sucesso');
      return { status: true, data: fichasExcluido }
    } catch (err) {
      console.log('Erro ao excluir ficha:', err)
      return { status: false, err: err.message || "Erro ao excluir ficha" }
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

      // Buscar a ficha atual para verificar quantidades
      const ficha = await this.findById(fichaId);
      if (!ficha) {
        throw new Error('Ficha não encontrada');
      }

      // Se for uma perda, atualizar a quantidade_perdida na ficha
      if (tipo === 'Perda') {
        const novaQuantidadePerdida = (ficha.quantidade_perdida || 0) + quantidade;
        await knex('fichas')
          .where({ id: fichaId })
          .update({ quantidade_perdida: novaQuantidadePerdida });
        
        console.log(`Perda registrada: ${quantidade} unidades. Total perdido: ${novaQuantidadePerdida}`);
      }

      // Atualizar o status da ficha se for uma conclusão
      if (tipo === 'Conclusão') {
        await knex('fichas')
          .where({ id: fichaId })
          .update({ status: 'concluido' });
      }

      // Verificar se a ficha deve ser marcada como concluída
      // Uma ficha é concluída quando: quantidade_recebida + quantidade_perdida >= quantidade
      const quantidadeRecebida = ficha.quantidade_recebida || 0;
      const quantidadePerdida = ficha.quantidade_perdida || 0;
      const quantidadeTotal = ficha.quantidade;
      
      if ((quantidadeRecebida + quantidadePerdida) >= quantidadeTotal) {
        await knex('fichas')
          .where({ id: fichaId })
          .update({ status: 'concluido' });
        
        console.log(`Ficha ${fichaId} marcada como concluída. Recebido: ${quantidadeRecebida}, Perdido: ${quantidadePerdida}, Total: ${quantidadeTotal}`);
      }

      // Atualizar a quantidade do produto relacionado (apenas para recebimentos, não para perdas)
      if (ficha.produto_id && quantidade > 0 && tipo !== 'Perda') {
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

      // Buscar a ficha atualizada para emitir via Socket
      const fichaAtualizada = await this.findById(fichaId);
      if (global.io && fichaAtualizada) {
        global.io.emit('ficha_atualizada', fichaAtualizada);
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

      // Calcular quantidade restante considerando perdas
      const quantidadePerdida = ficha.quantidade_perdida || 0;
      const quantidade_restante = ficha.quantidade - quantidade_recebida - quantidadePerdida;
      
      // Registrar o recebimento parcial
      const [id] = await knex('recebimentos_parciais').insert({
        ficha_id: fichaId,
        quantidade_recebida,
        quantidade_restante,
        observacoes,
        data_recebimento: new Date(data_recebimento)
      });

      // Se a quantidade restante for 0 ou menor, atualizar o status para concluído
      if (quantidade_restante <= 0) { 
        await knex('fichas')
          .where({ id: fichaId })
          .update({ status: 'concluido' });
        
        console.log(`Ficha ${fichaId} marcada como concluída após recebimento parcial. Recebido: ${quantidade_recebida}, Perdido: ${quantidadePerdida}, Restante: ${quantidade_restante}`);
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

      // console.log('FichasModel - Buscando relatório para período:', firstDay, 'a', lastDay);

      const [stats] = await knex.raw(`
        SELECT 
          COUNT(*) as total_criadas,
          SUM(CASE WHEN status = 'concluido' THEN 1 ELSE 0 END) as total_concluidas,
          SUM(COALESCE(quantidade_recebida, 0)) as total_recebidas,
          SUM(COALESCE(quantidade_perdida, 0)) as total_perdidas,
          SUM(quantidade) as total_cortadas
        FROM fichas
        WHERE data_entrada BETWEEN ? AND ?
      `, [firstDay, lastDay]);

      // console.log('FichasModel - Resultado bruto da consulta:', stats[0]);

      const resultado = {
        total_cortadas: parseInt(stats[0].total_cortadas) || 0,
        total_perdidas: parseInt(stats[0].total_perdidas) || 0,
        total_recebidas: parseInt(stats[0].total_recebidas) || 0,
        total_criadas: parseInt(stats[0].total_criadas) || 0,
        total_concluidas: parseInt(stats[0].total_concluidas) || 0
      };

      // console.log('FichasModel - Resultado processado:', resultado);

      return resultado;
    } catch (error) {
      console.error('FichasModel - Erro ao buscar relatório:', error);
      throw error;
    }
  }

  async getRecebidosUltimosMeses(qtdMeses = 5, dataInicio = null, dataFim = null) {
    try {
     // // console.log('FichasModel - getRecebidosUltimosMeses - Parâmetros:', { qtdMeses, dataInicio, dataFim });
      
      let query = knex('movimentacoes_fichas as mf')
        .leftJoin('fichas as f', 'f.id', 'mf.ficha_id')
        .select(
          knex.raw("DATE_FORMAT(mf.data, '%Y-%m') as mes"),
          knex.raw("SUM(COALESCE(mf.quantidade, 0)) as total_recebido"),
          knex.raw("COUNT(DISTINCT f.banca) as total_bancas"),
          knex.raw("GROUP_CONCAT(DISTINCT f.banca SEPARATOR ', ') as bancas")
        )
        .whereIn('mf.tipo', ['Retorno', 'Conclusão']);

      if (dataInicio && dataFim) {
        // console.log('FichasModel - getRecebidosUltimosMeses - Usando filtro de datas:', dataInicio, 'a', dataFim);
        query = query.whereRaw('DATE(mf.data) BETWEEN ? AND ?', [dataInicio, dataFim]);
      } else {
        // console.log('FichasModel - getRecebidosUltimosMeses - Usando filtro de meses:', qtdMeses);
        query = query.andWhere('mf.data', '>=', knex.raw(`DATE_SUB(CURDATE(), INTERVAL ${qtdMeses-1} MONTH)`));
      }
      console.log( query.toString())
      const result = await query
        .groupByRaw("DATE_FORMAT(mf.data, '%Y-%m')")
        .orderByRaw("mes ASC");

     // // console.log('FichasModel - getRecebidosUltimosMeses - Resultado:', result);
      return result;
    } catch (error) {
      console.error('FichasModel - getRecebidosUltimosMeses - Erro:', error);
      throw error;
    }
  }

  async getPerdidasUltimosMeses(qtdMeses = 5, dataInicio = null, dataFim = null) {
    try {
      // console.log('FichasModel - getPerdidasUltimosMeses - Parâmetros:', { qtdMeses, dataInicio, dataFim });
      
      let query = knex('movimentacoes_fichas as mf')
        .leftJoin('fichas as f', 'f.id', 'mf.ficha_id')
        .select(
          knex.raw("DATE_FORMAT(mf.data, '%Y-%m') as mes"),
          knex.raw("SUM(COALESCE(mf.quantidade, 0)) as total_perdido"),
          knex.raw("COUNT(DISTINCT f.banca) as total_bancas"),
          knex.raw("GROUP_CONCAT(DISTINCT f.banca SEPARATOR ', ') as bancas")
        )
        .where('mf.tipo', 'Perda');

      if (dataInicio && dataFim) {
        // console.log('FichasModel - getPerdidasUltimosMeses - Usando filtro de datas:', dataInicio, 'a', dataFim);
        query = query.whereRaw('DATE(mf.data) BETWEEN ? AND ?', [dataInicio, dataFim]);
      } else {
        // console.log('FichasModel - getPerdidasUltimosMeses - Usando filtro de meses:', qtdMeses);
        query = query.andWhere('mf.data', '>=', knex.raw(`DATE_SUB(CURDATE(), INTERVAL ${qtdMeses-1} MONTH)`));
      }

      const result = await query
        .groupByRaw("DATE_FORMAT(mf.data, '%Y-%m')")
        .orderByRaw("mes ASC");

      // console.log('FichasModel - getPerdidasUltimosMeses - Resultado:', result);
      return result;
    } catch (error) {
      console.error('FichasModel - getPerdidasUltimosMeses - Erro:', error);
      throw error;
    }
  }

  async getCortadasUltimosMeses(qtdMeses = 5, dataInicio = null, dataFim = null) {
    try {
      // console.log('FichasModel - getCortadasUltimosMeses - Parâmetros:', { qtdMeses, dataInicio, dataFim });
      
      let query = knex('fichas')
        .select(
          knex.raw("DATE_FORMAT(data_entrada, '%Y-%m') as mes"),
          knex.raw("SUM(COALESCE(quantidade, 0)) as total_cortada"),
          knex.raw("COUNT(DISTINCT banca) as total_bancas"),
          knex.raw("GROUP_CONCAT(DISTINCT banca SEPARATOR ', ') as bancas")
        );

      if (dataInicio && dataFim) {
        // console.log('FichasModel - getCortadasUltimosMeses - Usando filtro de datas:', dataInicio, 'a', dataFim);
        query = query.whereRaw('DATE(data_entrada) BETWEEN ? AND ?', [dataInicio, dataFim]);
      } else {
        // console.log('FichasModel - getCortadasUltimosMeses - Usando filtro de meses:', qtdMeses);
        query = query.andWhere('data_entrada', '>=', knex.raw(`DATE_SUB(CURDATE(), INTERVAL ${qtdMeses-1} MONTH)`));
      }

      const result = await query
        .groupByRaw("DATE_FORMAT(data_entrada, '%Y-%m')")
        .orderByRaw("mes ASC");

      // console.log('FichasModel - getCortadasUltimosMeses - Resultado:', result);
      return result;
    } catch (error) {
      console.error('FichasModel - getCortadasUltimosMeses - Erro:', error);
      throw error;
    }
  }

  // Método para buscar dados consolidados de um período específico
  async getDadosConsolidadosPeriodo(dataInicio, dataFim) {
    try {
      // console.log('FichasModel - Buscando dados consolidados para período:', dataInicio, 'a', dataFim);
      // console.log('FichasModel - Tipos de dados:', typeof dataInicio, typeof dataFim);

      // Verificar se as datas são válidas
      if (!dataInicio || !dataFim) {
        // console.log('FichasModel - Datas inválidas, retornando zeros');
        return {
          total_cortadas: 0,
          total_recebidas: 0,
          total_perdidas: 0,
          total_fichas: 0,
          total_concluidas: 0
        };
      }

      // Buscar dados de peças cortadas (quantidade da tabela fichas)
      const [cortadasStats] = await knex.raw(`
        SELECT 
          SUM(COALESCE(quantidade, 0)) as total_cortadas,
          COUNT(*) as total_fichas,
          COUNT(CASE WHEN status = 'concluido' THEN 1 END) as total_concluidas
        FROM fichas
        WHERE DATE(data_entrada) BETWEEN ? AND ?
      `, [dataInicio, dataFim]);

      // Buscar dados de peças recebidas (movimentações tipo Retorno ou Conclusão)
      const [recebidasStats] = await knex.raw(`
        SELECT 
          SUM(COALESCE(mf.quantidade, 0)) as total_recebidas
        FROM movimentacoes_fichas mf
        INNER JOIN fichas f ON f.id = mf.ficha_id
        WHERE DATE(mf.data) BETWEEN ? AND ?
        AND mf.tipo IN ('Retorno', 'Conclusão')
      `, [dataInicio, dataFim]);

      // Buscar dados de peças perdidas (movimentações tipo Perda)
      const [perdidasStats] = await knex.raw(`
        SELECT 
          SUM(COALESCE(mf.quantidade, 0)) as total_perdidas
        FROM movimentacoes_fichas mf
        INNER JOIN fichas f ON f.id = mf.ficha_id
        WHERE DATE(mf.data) BETWEEN ? AND ?
        AND mf.tipo = 'Perda'
      `, [dataInicio, dataFim]);

      /* console.log('FichasModel - Dados consolidados brutos:', {
        cortadas: cortadasStats[0],
        recebidas: recebidasStats[0],
        perdidas: perdidasStats[0]
      });*/

      const resultado = {
        total_cortadas: parseInt(cortadasStats[0].total_cortadas) || 0,
        total_recebidas: parseInt(recebidasStats[0].total_recebidas) || 0,
        total_perdidas: parseInt(perdidasStats[0].total_perdidas) || 0,
        total_fichas: parseInt(cortadasStats[0].total_fichas) || 0,
        total_concluidas: parseInt(cortadasStats[0].total_concluidas) || 0
      };

      // console.log('FichasModel - Resultado processado:', resultado);

      return resultado;
    } catch (error) {
      console.error('FichasModel - Erro ao buscar dados consolidados:', error);
      console.error('FichasModel - Stack trace:', error.stack);
      throw error;
    }
  }

  // Método para buscar dados detalhados de peças recebidas por banca
  async getRecebidosDetalhadosPorBanca(dataInicio, dataFim) {
    try {
      // console.log('FichasModel - getRecebidosDetalhadosPorBanca - Parâmetros:', { dataInicio, dataFim });
      
      const result = await knex('movimentacoes_fichas as mf')
        .leftJoin('fichas as f', 'f.id', 'mf.ficha_id')
        .select(
          'f.banca',
          knex.raw("DATE_FORMAT(mf.data, '%Y-%m') as mes"),
          knex.raw("SUM(COALESCE(mf.quantidade, 0)) as total_recebido"),
          knex.raw("COUNT(*) as total_movimentacoes")
        )
        .whereIn('mf.tipo', ['Retorno', 'Conclusão'])
        .whereRaw('DATE(mf.data) BETWEEN ? AND ?', [dataInicio, dataFim])
        .groupBy('f.banca', knex.raw("DATE_FORMAT(mf.data, '%Y-%m')"))
        .orderBy('f.banca', 'mes');

      // console.log('FichasModel - getRecebidosDetalhadosPorBanca - Resultado:', result);
      return result;
    } catch (error) {
      console.error('FichasModel - getRecebidosDetalhadosPorBanca - Erro:', error);
      throw error;
    }
  }

  // Método para buscar dados detalhados de peças perdidas por banca
  async getPerdidasDetalhadasPorBanca(dataInicio, dataFim) {
    try {
      // console.log('FichasModel - getPerdidasDetalhadasPorBanca - Parâmetros:', { dataInicio, dataFim });
      
      const result = await knex('movimentacoes_fichas as mf')
        .leftJoin('fichas as f', 'f.id', 'mf.ficha_id')
        .select(
          'f.banca',
          knex.raw("DATE_FORMAT(mf.data, '%Y-%m') as mes"),
          knex.raw("SUM(COALESCE(mf.quantidade, 0)) as total_perdido"),
          knex.raw("COUNT(*) as total_movimentacoes")
        )
        .where('mf.tipo', 'Perda')
        .whereRaw('DATE(mf.data) BETWEEN ? AND ?', [dataInicio, dataFim])
        .groupBy('f.banca', knex.raw("DATE_FORMAT(mf.data, '%Y-%m')"))
        .orderBy('f.banca', 'mes');

      // console.log('FichasModel - getPerdidasDetalhadasPorBanca - Resultado:', result);
      return result;
    } catch (error) {
      console.error('FichasModel - getPerdidasDetalhadasPorBanca - Erro:', error);
      throw error;
    }
  }

  // Método para buscar dados detalhados de peças cortadas por banca
  async getCortadasDetalhadasPorBanca(dataInicio, dataFim) {
    try {
      // console.log('FichasModel - getCortadasDetalhadasPorBanca - Parâmetros:', { dataInicio, dataFim });
      
      const result = await knex('fichas')
        .select(
          'banca',
          knex.raw("DATE_FORMAT(data_entrada, '%Y-%m') as mes"),
          knex.raw("SUM(COALESCE(quantidade, 0)) as total_cortada"),
          knex.raw("COUNT(*) as total_fichas")
        )
        .whereRaw('DATE(data_entrada) BETWEEN ? AND ?', [dataInicio, dataFim])
        .groupBy('banca', knex.raw("DATE_FORMAT(data_entrada, '%Y-%m')"))
        .orderBy('banca', 'mes');

      // console.log('FichasModel - getCortadasDetalhadasPorBanca - Resultado:', result);
      return result;
    } catch (error) {
      console.error('FichasModel - getCortadasDetalhadasPorBanca - Erro:', error);
      throw error;
    }
  }
}

module.exports = new FichasModel() 