const knex = require('../database/connection');
const Terceiros = require('./Terceiros')

class FechamentosModel {
  /**
   * Gera um novo fechamento semanal
   */
  async gerarFechamentoSemanal(dataInicio, dataFim) {
    try {
      const semana = this.obterSemana(dataInicio);
      
      // Buscar bancas que tiveram movimentação de entrada na semana
      const bancasComMovimentacao = await this.buscarBancasComMovimentacao(dataInicio, dataFim);
      
      console.log("gerarFechamentoSemanal "+dataInicio, dataFim)
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
        console.log('3232'+JSON.stringify(banca))
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
       // chave_pix:chave_pix,
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
      // Teste para verificar se o campo chave_pix existe
      const teste = await knex('terceiros').select('*').limit(1);
      console.log('Estrutura da tabela terceiros:', Object.keys(teste[0] || {}));
      
      const bancas = await knex('movimentacoes_fichas as mf')
        .leftJoin('fichas as f', 'f.id', 'mf.ficha_id')
        .leftJoin('terceiros as t', 't.nome', 'f.banca')
        .where('mf.data', '>=', dataInicio)
        .andWhere('mf.data', '<=', dataFim)
        .andWhere(function() {
          this.where('mf.tipo', 'Retorno')
              .orWhere('mf.tipo', 'Conclusão');
        })
        .groupBy('t.idTerceiro')
        .select([
          't.idTerceiro as idTerceiro',
          't.nome as nome',
          't.cnpj',
          't.email',
          't.telefone',
          't.endereco',
          't.cidade',
          't.estado',
          't.cep',
          't.complemento',
          't.numero',
          't.chave_pix'
        ]);
      
      console.log('Bancas únicas encontradas:', bancas.length);
      console.log('Dados das bancas:', JSON.stringify(bancas, null, 2));
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
      // Buscar movimentações de retorno da banca específica no período
      const movimentacoes = await knex('movimentacoes_fichas as mf')
        .leftJoin('fichas as f', 'f.id', 'mf.ficha_id')
        .leftJoin('produtos as p', 'p.id', 'f.produto_id')
        .where('f.banca', banca.nome)
        .where(function() {
          this.where('mf.tipo', 'Retorno')
              .orWhere('mf.tipo', 'Conclusão');
        })
        .whereBetween('mf.data', [dataInicio, dataFim])
        .select([
          'mf.id as movimentacao_id',
          'mf.ficha_id',
          'mf.quantidade as quantidade_movimentada',
          'mf.data as data_movimentacao',
          'f.codigo as codigo_ficha',
          'f.produto',
          'f.data_entrada',
          'f.status',
          knex.raw('COALESCE(p.valor_unitario, 0) as valor_unitario')
        ]);
      
      console.log(`Movimentações encontradas para ${banca.nome}:`, movimentacoes.length);
      
      if (movimentacoes.length === 0) {
        return null;
      }
      
      // Calcular totais da banca
      let totalPecas = 0;
      let valorTotal = 0;
      const itens = [];
      
      for (const mov of movimentacoes) {
        const quantidade = parseInt(mov.quantidade_movimentada) || 0;
        const valorUnitario = parseFloat(mov.valor_unitario) || 0;
        const valorTotalItem = quantidade * valorUnitario;
        
        totalPecas += quantidade;
        valorTotal += valorTotalItem;
        
        console.log(`${banca.nome} - Movimentação: ${quantidade} peças, R$ ${valorTotalItem.toFixed(2)}`);
        
        // Criar item do fechamento
        const item = {
          ficha_id: mov.ficha_id,
          codigo_ficha: mov.codigo_ficha,
          produto: mov.produto,
          quantidade: quantidade,
          valor_unitario: valorUnitario,
          valor_total: valorTotalItem,
          data_entrada: mov.data_entrada,
        //  data_movimentacao: mov.data_movimentacao
        };
        
        itens.push(item);
      }
      
      console.log(`TOTAIS para ${banca.nome}: ${totalPecas} peças, R$ ${valorTotal.toFixed(2)}`);
      
      const bancaObj = await Terceiros.findByNome(banca.nome);
      const bancaId = Array.isArray(bancaObj) ? bancaObj[0]?.idTerceiro : bancaObj?.idTerceiro;
      
      console.log('bancaId: '+bancaId+ ' | ' + bancaObj )
      console.log('Dados completos da banca:', JSON.stringify(banca));
      
      // Criar fechamento da banca
      const fechamentoBanca = {
        fechamento_semanal_id: fechamentoId,
        banca_id: bancaObj,
        nome_banca: banca.nome,
        data_inicio: dataInicio,
        data_fim: dataFim,
        total_pecas: totalPecas,
        valor_total: valorTotal,
        status: 'pendente'
      };
      
      console.log('fechamentoBanca:', JSON.stringify(fechamentoBanca));
      
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
        // Dados completos da banca
        chave_pix: banca.chave_pix,
        cnpj: banca.cnpj,
        email: banca.email,
        telefone: banca.telefone,
        endereco: banca.endereco,
        cidade: banca.cidade,
        estado: banca.estado,
        cep: banca.cep,
        complemento: banca.complemento,
        numero: banca.numero,
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
      const fechamentosBancas = await knex('fechamentos_bancas as fb')
        .leftJoin('terceiros as t', 't.idTerceiro', 'fb.banca_id')
        .where({ fechamento_semanal_id: id })
        .select([
          'fb.*',
          't.nome as nome_banca_completo',
          't.cnpj',
          't.email',
          't.telefone',
          't.endereco',
          't.cidade',
          't.estado',
          't.cep',
          't.complemento',
          't.numero',
          't.chave_pix'
        ])
        .orderBy('fb.nome_banca');
      
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