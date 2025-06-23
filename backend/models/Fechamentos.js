const knex = require('../database/connection');

class FechamentosModel {
  /**
   * Gera um novo fechamento semanal
   */
  async gerarFechamentoSemanal(dataInicio, dataFim) {
    try {
      const semana = this.obterSemana(dataInicio);
      
      // Buscar bancas que tiveram movimentação de entrada na semana
      const bancasComMovimentacao = await this.buscarBancasComMovimentacao(dataInicio, dataFim);
      
      // Criar o fechamento semanal
      const fechamentoSemanal = {
        semana: semana,
        data_inicio: dataInicio,
        data_fim: dataFim,
        total_pecas: 0,
        valor_total: 0.00,
        status: 'aberto'
      };
      
      const [fechamentoId] = await knex('fechamentos_semanais').insert(fechamentoSemanal);
      
      // Processar cada banca
      const fechamentosBancas = [];
      let totalPecasGeral = 0;
      let valorTotalGeral = 0;
      
      for (const banca of bancasComMovimentacao) {
        const fechamentoBanca = await this.processarFechamentoBanca(
          fechamentoId, 
          banca, 
          dataInicio, 
          dataFim
        );
        
        if (fechamentoBanca) {
          fechamentosBancas.push(fechamentoBanca);
          totalPecasGeral += fechamentoBanca.total_pecas;
          valorTotalGeral += fechamentoBanca.valor_total;
        }
      }
      
      // Atualizar totais do fechamento semanal
      await knex('fechamentos_semanais')
        .where({ id: fechamentoId })
        .update({
          total_pecas: totalPecasGeral,
          valor_total: valorTotalGeral
        });
      
      return {
        id: fechamentoId,
        semana: semana,
        data_inicio: dataInicio,
        data_fim: dataFim,
        total_pecas: totalPecasGeral,
        valor_total: valorTotalGeral,
        status: 'aberto',
        fechamentos: fechamentosBancas
      };
      
    } catch (err) {
      console.error('Erro ao gerar fechamento semanal:', err);
      throw err;
    }
  }
  
  /**
   * Busca bancas que tiveram movimentação de retorno na semana
   */
  async buscarBancasComMovimentacao(dataInicio, dataFim) {
    try {
      const bancas = await knex('fichas as f')
        .join('movimentacoes_fichas as mf', 'f.id', 'mf.ficha_id')
        .join('terceiros as t', 'f.banca', 't.nome')
        .where('mf.tipo', 'Retorno')
        .whereIn('f.status', ['em-producao', 'recebido', 'concluido'])
        .whereBetween('mf.data', [dataInicio, dataFim])
        .where('t.tipo', 'banca')
        .select(
          't.idTerceiro as id',
          't.nome as nome',
          't.cnpj',
          't.telefone',
          't.email'
        )
        .distinct();
      
      return bancas;
    } catch (err) {
      console.error('Erro ao buscar bancas com movimentação:', err);
      return [];
    }
  }
  
  /**
   * Processa o fechamento de uma banca específica
   */
  async processarFechamentoBanca(fechamentoId, banca, dataInicio, dataFim) {
    try {
      // Buscar fichas da banca com movimentação de retorno na semana
      const fichas = await knex('fichas as f')
        .join('movimentacoes_fichas as mf', 'f.id', 'mf.ficha_id')
        .leftJoin('produtos as p', function() {
          this.on('f.produto', '=', 'p.nome_produto');
        })
        .where('f.banca', banca.nome)
        .where('mf.tipo', 'Retorno')
        .whereIn('f.status', ['em-producao', 'recebido', 'concluido'])
        .whereBetween('mf.data', [dataInicio, dataFim])
        .select(
          'f.id as ficha_id',
          'f.codigo as codigo_ficha',
          'f.produto',
          'f.quantidade',
          'f.data_entrada',
          knex.raw('COALESCE(p.valor_unitario, 0) as valor_unitario'),
          'mf.quantidade as quantidade_movimentada'
        );
      
      if (fichas.length === 0) {
        return null;
      }
      
      // Calcular totais da banca
      let totalPecas = 0;
      let valorTotal = 0;
      const itens = [];
      
      for (const ficha of fichas) {
        const quantidade = ficha.quantidade_movimentada || ficha.quantidade;
        const valorUnitario = parseFloat(ficha.valor_unitario) || 0;
        const valorTotalItem = quantidade * valorUnitario;
        
        totalPecas += quantidade;
        valorTotal += valorTotalItem;
        
        // Criar item do fechamento
        const item = {
          ficha_id: ficha.ficha_id,
          codigo_ficha: ficha.codigo_ficha,
          produto: ficha.produto,
          quantidade: quantidade,
          valor_unitario: valorUnitario,
          valor_total: valorTotalItem,
          data_entrada: ficha.data_entrada
        };
        
        itens.push(item);
      }
      
      // Criar fechamento da banca
      const fechamentoBanca = {
        fechamento_semanal_id: fechamentoId,
        banca_id: banca.id,
        nome_banca: banca.nome,
        data_inicio: dataInicio,
        data_fim: dataFim,
        total_pecas: totalPecas,
        valor_total: valorTotal,
        status: 'pendente'
      };
      
      const [fechamentoBancaId] = await knex('fechamentos_bancas').insert(fechamentoBanca);
      
      // Inserir itens do fechamento
      if (itens.length > 0) {
        const itensComFechamentoId = itens.map(item => ({
          ...item,
          fechamento_banca_id: fechamentoBancaId
        }));
        await knex('fechamentos_itens').insert(itensComFechamentoId);
      }
      
      return {
        id: fechamentoBancaId,
        ...fechamentoBanca,
        itens: itens
      };
      
    } catch (err) {
      console.error('Erro ao processar fechamento da banca:', err);
      return null;
    }
  }
  
  /**
   * Busca um fechamento semanal por ID
   */
  async buscarFechamentoPorId(id) {
    try {
      const fechamento = await knex('fechamentos_semanais')
        .where({ id })
        .first();
      
      if (!fechamento) {
        return null;
      }
      
      // Buscar fechamentos das bancas
      const fechamentosBancas = await knex('fechamentos_bancas')
        .where({ fechamento_semanal_id: id })
        .orderBy('nome_banca');
      
      // Buscar itens de cada fechamento de banca
      for (const fechamentoBanca of fechamentosBancas) {
        const itens = await knex('fechamentos_itens')
          .where({ fechamento_banca_id: fechamentoBanca.id })
          .orderBy('produto');
        
        fechamentoBanca.itens = itens;
      }
      
      fechamento.fechamentos = fechamentosBancas;
      
      return fechamento;
      
    } catch (err) {
      console.error('Erro ao buscar fechamento:', err);
      return null;
    }
  }
  
  /**
   * Lista todos os fechamentos semanais
   */
  async listarFechamentos() {
    try {
      const fechamentos = await knex('fechamentos_semanais')
        .orderBy('data_criacao', 'desc');
      
      return fechamentos;
    } catch (err) {
      console.error('Erro ao listar fechamentos:', err);
      return [];
    }
  }
  
  /**
   * Finaliza o fechamento de uma banca específica
   */
  async finalizarFechamentoBanca(fechamentoId, bancaId) {
    try {
      const resultado = await knex('fechamentos_bancas')
        .where({ 
          fechamento_semanal_id: fechamentoId,
          banca_id: bancaId,
          status: 'pendente'
        })
        .update({
          status: 'pago',
          data_pagamento: knex.fn.now()
        });
      
      if (resultado > 0) {
        // Verificar se todas as bancas estão pagas
        const bancasPendentes = await knex('fechamentos_bancas')
          .where({ 
            fechamento_semanal_id: fechamentoId,
            status: 'pendente'
          })
          .count('* as total');
        
        // Se não há bancas pendentes, finalizar o fechamento semanal
        if (bancasPendentes[0].total === 0) {
          await knex('fechamentos_semanais')
            .where({ id: fechamentoId })
            .update({
              status: 'pago',
              data_pagamento: knex.fn.now()
            });
        }
      }
      
      return resultado > 0;
      
    } catch (err) {
      console.error('Erro ao finalizar fechamento da banca:', err);
      return false;
    }
  }
  
  /**
   * Finaliza o fechamento semanal completo
   */
  async finalizarFechamentoSemanal(id) {
    try {
      const resultado = await knex('fechamentos_semanais')
        .where({ id, status: 'aberto' })
        .update({
          status: 'pago',
          data_pagamento: knex.fn.now()
        });
      
      return resultado > 0;
      
    } catch (err) {
      console.error('Erro ao finalizar fechamento semanal:', err);
      return false;
    }
  }
  
  /**
   * Obtém a semana no formato YYYY-WNN
   */
  obterSemana(data) {
    const date = new Date(data);
    const year = date.getFullYear();
    const startOfYear = new Date(year, 0, 1);
    const days = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    const weekNumber = Math.ceil((days + startOfYear.getDay() + 1) / 7);
    return `${year}-W${weekNumber.toString().padStart(2, '0')}`;
  }
}

module.exports = new FechamentosModel(); 