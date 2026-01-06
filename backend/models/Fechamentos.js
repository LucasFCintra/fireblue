const knex = require('../database/connection');
const Terceiros = require('./Terceiros')

class FechamentosModel {
  /**
   * Gera um novo fechamento semanal
   */
  async gerarFechamentoSemanal(dataInicio, dataFim) {
    try {
      const semana = this.obterSemana(dataInicio);
      console.log('[DEBUG] ==========================================');
      console.log('[DEBUG] Gerando fechamento para semana:', semana);
      console.log('[DEBUG] Data início:', dataInicio);
      console.log('[DEBUG] Data fim:', dataFim);

      // Verificar se já existe fechamento para a semana
      let fechamentoExistente = await knex('fechamentos_semanais')
        .where({ semana })
        .first();

      console.log('[DEBUG] Fechamento existente encontrado:', fechamentoExistente ? 'SIM' : 'NÃO');
      if (fechamentoExistente) {
        console.log('[DEBUG] ID do fechamento existente:', fechamentoExistente.id);
        console.log('[DEBUG] Status do fechamento existente:', fechamentoExistente.status);
      }

      // Se já existe um fechamento para esta semana, retorna o existente
      if (fechamentoExistente) {
        console.log('[DEBUG] Fechamento já existe para semana', semana, 'ID:', fechamentoExistente.id, 'Status:', fechamentoExistente.status);
        
        // Buscar fechamento completo com bancas e itens
        const fechamentoCompleto = await this.buscarFechamentoPorId(fechamentoExistente.id);
        
        // Se o status for 'aberto', atualizar totais baseado nas movimentações atuais
        if (fechamentoExistente.status === 'aberto') {
          console.log('[DEBUG] Atualizando totais do fechamento aberto');
          
          // Buscar bancas que tiveram movimentação de entrada na semana
          const bancasComMovimentacao = await this.buscarBancasComMovimentacao(dataInicio, dataFim);
          
          let totalPecasGeral = 0;
          let valorTotalGeral = 0;
          const fechamentosBancas = [];

          for (const banca of bancasComMovimentacao) {
            // Verifica se já existe fechamento_banca para esta banca nesta semana
            let fechamentoBancaExistente = await knex('fechamentos_bancas')
              .where({ fechamento_semanal_id: fechamentoExistente.id, banca_id: banca.idTerceiro })
              .first();

            let fechamentoBanca;
            if (fechamentoBancaExistente) {
              // Atualizar totais e itens
              await knex('fechamentos_itens').where({ fechamento_banca_id: fechamentoBancaExistente.id }).del();
              fechamentoBanca = await this.processarFechamentoBanca(fechamentoExistente.id, banca, dataInicio, dataFim);
              
              if (fechamentoBanca) {
                await knex('fechamentos_bancas')
                  .where({ id: fechamentoBancaExistente.id })
                  .update({
                    total_pecas: fechamentoBanca.total_pecas,
                    valor_total: fechamentoBanca.valor_total
                  });
              }
            } else {
              fechamentoBanca = await this.processarFechamentoBanca(fechamentoExistente.id, banca, dataInicio, dataFim);
            }
            
            if (fechamentoBanca) {
              fechamentosBancas.push(fechamentoBanca);
              totalPecasGeral += fechamentoBanca.total_pecas;
              valorTotalGeral += fechamentoBanca.valor_total;
            }
          }

          // Atualizar totais do fechamento semanal
          await knex('fechamentos_semanais')
            .where({ id: fechamentoExistente.id })
            .update({
              total_pecas: totalPecasGeral,
              valor_total: valorTotalGeral
            });

          console.log('[DEBUG] Retornando fechamento atualizado com ID:', fechamentoExistente.id);
          
          // Retornar com totais atualizados
          return {
            id: fechamentoExistente.id,
            semana: fechamentoExistente.semana,
            data_inicio: fechamentoExistente.data_inicio,
            data_fim: fechamentoExistente.data_fim,
            total_pecas: totalPecasGeral,
            valor_total: valorTotalGeral,
            status: fechamentoExistente.status,
            fechamentos: fechamentosBancas
          };
        } else {
          console.log('[DEBUG] Retornando fechamento existente sem atualização (status não é aberto)');
          // Se não for 'aberto', retorna o fechamento como está (sem tentar atualizar)
          return {
            id: fechamentoExistente.id,
            semana: fechamentoExistente.semana,
            data_inicio: fechamentoExistente.data_inicio,
            data_fim: fechamentoExistente.data_fim,
            total_pecas: fechamentoExistente.total_pecas,
            valor_total: fechamentoExistente.valor_total,
            status: fechamentoExistente.status,
            fechamentos: fechamentoCompleto.fechamentos || []
          };
        }
      }

      // Se não existe, criar novo fechamento
      console.log('[DEBUG] Criando novo fechamento semanal para semana', semana);
      
      // Buscar bancas que tiveram movimentação de entrada na semana
      const bancasComMovimentacao = await this.buscarBancasComMovimentacao(dataInicio, dataFim);

      // Criar novo fechamento semanal
      const fechamentoSemanal = {
        semana: semana,
        data_inicio: dataInicio,
        data_fim: dataFim,
        total_pecas: 0,
        valor_total: 0.00,
        status: 'aberto'
      };
      let fechamentoId;
      try {
        const result = await knex('fechamentos_semanais').insert(fechamentoSemanal);
        fechamentoId = Array.isArray(result) ? result[0] : result;
        console.log('[DEBUG] Novo fechamento criado com ID:', fechamentoId);
      } catch (insertErr) {
        // Se erro for de duplicidade, buscar e retornar o existente
        if (insertErr && insertErr.code && (insertErr.code === 'ER_DUP_ENTRY' || insertErr.code === 'SQLITE_CONSTRAINT' || insertErr.message.includes('duplicate'))) {
          console.log('[DEBUG] Erro de duplicidade ao inserir. Buscando fechamento existente para semana:', semana);
          fechamentoExistente = await knex('fechamentos_semanais').where({ semana }).first();
          if (fechamentoExistente) {
            const fechamentoCompleto = await this.buscarFechamentoPorId(fechamentoExistente.id);
            return {
              id: fechamentoExistente.id,
              semana: fechamentoExistente.semana,
              data_inicio: fechamentoExistente.data_inicio,
              data_fim: fechamentoExistente.data_fim,
              total_pecas: fechamentoExistente.total_pecas,
              valor_total: fechamentoExistente.valor_total,
              status: fechamentoExistente.status,
              fechamentos: fechamentoCompleto.fechamentos || []
            };
          } else {
            throw insertErr;
          }
        } else {
          throw insertErr;
        }
      }

      // Processar cada banca
      const fechamentosBancas = [];
      let totalPecasGeral = 0;
      let valorTotalGeral = 0;

      for (const banca of bancasComMovimentacao) {
        const fechamentoBanca = await this.processarFechamentoBanca(fechamentoId, banca, dataInicio, dataFim);
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

      console.log('[DEBUG] Retornando novo fechamento com ID:', fechamentoId);
      console.log('[DEBUG] ==========================================');

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
      console.log('[DEBUG] Buscando bancas com movimentação entre:', dataInicio, 'e', dataFim);
      
      // Primeiro, buscar todas as movimentações de retorno/conclusão no período
      const movimentacoes = await knex('movimentacoes_fichas as mf')
        .leftJoin('fichas as f', 'f.id', 'mf.ficha_id')
        .whereRaw('DATE(mf.data) >= ?', [dataInicio])
        .andWhereRaw('DATE(mf.data) <= ?', [dataFim])
        .andWhere(function() {
          this.where('mf.tipo', 'Retorno')
              .orWhere('mf.tipo', 'Conclusão');
        })
        .select([
          'f.banca as nome_banca',
          'mf.ficha_id',
          'mf.quantidade',
          'mf.data'
        ]);
      
      console.log('[DEBUG] Movimentações encontradas:', movimentacoes.length);
      
      // Extrair bancas únicas das movimentações
      const bancasUnicas = [...new Set(movimentacoes.map(m => m.nome_banca))].filter(banca => banca);
      
      console.log('[DEBUG] Bancas únicas encontradas:', bancasUnicas);
      
      if (bancasUnicas.length === 0) {
        console.log('[DEBUG] Nenhuma banca encontrada');
        return [];
      }
      
      // Buscar dados completos das bancas na tabela terceiros usando TRIM para comparação
      const bancas = [];
      
      for (const nomeBanca of bancasUnicas) {
        // Tentar encontrar o terceiro correspondente usando TRIM
        const terceiro = await knex('terceiros')
          .whereRaw('TRIM(nome) = ?', [nomeBanca.trim()])
          .orWhereRaw('TRIM(nome) = ?', [nomeBanca])
          .orWhere('nome', nomeBanca.trim())
          .orWhere('nome', nomeBanca)
          .select([
            'idTerceiro as idTerceiro',
            'nome as nome',
            'cnpj',
            'email',
            'telefone',
            'endereco',
            'cidade',
            'estado',
            'cep',
            'complemento',
            'numero',
            'chave_pix'
          ])
          .first();
        
        if (terceiro) {
          console.log(`[DEBUG] Terceiro encontrado para "${nomeBanca}": ID ${terceiro.idTerceiro}`);
          bancas.push(terceiro);
        } else {
          console.log(`[DEBUG] Terceiro NÃO encontrado para "${nomeBanca}"`);
          
          // Criar um registro temporário para bancas não cadastradas
          bancas.push({
            idTerceiro: `temp_${bancas.length + 1}`,
            nome: nomeBanca.trim(),
            cnpj: null,
            email: null,
            telefone: null,
            endereco: null,
            cidade: null,
            estado: null,
            cep: null,
            complemento: null,
            numero: null,
            chave_pix: null
          });
        }
      }
      
      console.log('[DEBUG] Dados das bancas encontradas:', bancas.length);
      console.log('[DEBUG] Dados das bancas:', JSON.stringify(bancas, null, 2));
      
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
      console.log(`[DEBUG] Processando fechamento da banca: ${banca.nome}`);
      
      // Buscar movimentações de retorno da banca específica no período
      const movimentacoes = await knex('movimentacoes_fichas as mf')
        .leftJoin('fichas as f', 'f.id', 'mf.ficha_id')
        .where(function() {
          // Buscar por nome exato ou com trim
          this.where('f.banca', banca.nome)
              .orWhereRaw('TRIM(f.banca) = ?', [banca.nome.trim()]);
        })
        .where(function() {
          this.where('mf.tipo', 'Retorno')
              .orWhere('mf.tipo', 'Conclusão');
        })
        .whereRaw('DATE(mf.data) >= ?', [dataInicio])
        .andWhereRaw('DATE(mf.data) <= ?', [dataFim])
        .select([
          'mf.id as movimentacao_id',
          'mf.ficha_id',
          'mf.quantidade as quantidade_movimentada',
          'mf.data as data_movimentacao',
          'f.codigo as codigo_ficha',
          'f.produto',
          'f.data_entrada',
          'f.status'
        ]);
      
      console.log(`Movimentações encontradas para ${banca.nome}:`, movimentacoes.length);
      
      if (movimentacoes.length === 0) {
        console.log(`[DEBUG] Nenhuma movimentação encontrada para ${banca.nome}`);
        return null;
      }
      
      // Calcular totais da banca
      let totalPecas = 0;
      let valorTotal = 0;
      const itens = [];
      
      // Buscar todos os produtos únicos de uma vez
      const produtosUnicos = [...new Set(movimentacoes.map(m => m.produto))].filter(produto => produto);
      const produtosUnicosNormalizados = produtosUnicos.map(p => p.trim().toLowerCase());
      const produtosPrecificados = {};
      // Valor padrão por peça
      const valorPadrao = 3.50;
      // Buscar preços dos produtos
      if (produtosUnicos.length > 0) {
        try {
          const produtos = await knex('produtos')
            .whereIn(
              knex.raw('LOWER(TRIM(nome_produto))'),
              produtosUnicosNormalizados
            )
            .select(['nome_produto', 'valor_unitario']);
          // Criar mapa de preços
          produtos.forEach(produto => {
            const nomeNormalizado = produto.nome_produto.trim().toLowerCase();
            const valorUnitario = parseFloat(produto.valor_unitario);
            produtosPrecificados[nomeNormalizado] = valorUnitario;
            console.log('valorUnitario: '+valorUnitario+ ' | ' + produto.nome_produto)
          });
        } catch (err) {
          console.log(`[DEBUG] Erro ao buscar produtos:`, err.message);
        }
      }

      for (const mov of movimentacoes) {
        const quantidade = parseInt(mov.quantidade_movimentada) || 0;
        const nomeMovNormalizado = mov.produto.trim().toLowerCase();
        let valorUnitario = produtosPrecificados[nomeMovNormalizado];
        if (!valorUnitario) {
          console.log(`[DEBUG] Produto não encontrado para precificação: "${mov.produto}". Usando valor padrão.`);
          valorUnitario = valorPadrao;
        }
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
          data_entrada: mov.data_entrada
        };
        
        itens.push(item);
      }
      
      console.log(`TOTAIS para ${banca.nome}: ${totalPecas} peças, R$ ${valorTotal.toFixed(2)}`);
      
      // Usar diretamente o idTerceiro que já temos da banca
      const bancaId = banca.idTerceiro;
      
      console.log('bancaId: '+bancaId+ ' | ' + banca.nome )
      console.log('Dados completos da banca:', JSON.stringify(banca));
      
      // Verificar se já existe fechamento de banca para esta banca neste fechamento semanal
      let fechamentoBancaExistente = await knex('fechamentos_bancas')
        .where({ 
          fechamento_semanal_id: fechamentoId, 
          banca_id: bancaId 
        })
        .first();
      
      let fechamentoBancaId;
      
      if (fechamentoBancaExistente) {
        console.log(`[DEBUG] Fechamento de banca já existe para ${banca.nome}, atualizando...`);
        
        // Atualizar fechamento existente
        await knex('fechamentos_bancas')
          .where({ id: fechamentoBancaExistente.id })
          .update({
            total_pecas: totalPecas,
            valor_total: valorTotal
          });
        
        // Remover itens antigos e inserir novos
        await knex('fechamentos_itens')
          .where({ fechamento_banca_id: fechamentoBancaExistente.id })
          .del();
        
        fechamentoBancaId = fechamentoBancaExistente.id;
      } else {
        console.log(`[DEBUG] Criando novo fechamento de banca para ${banca.nome}`);
        
        // Criar novo fechamento da banca
        const fechamentoBanca = {
          fechamento_semanal_id: fechamentoId,
          banca_id: bancaId,
          nome_banca: banca.nome,
          data_inicio: dataInicio,
          data_fim: dataFim,
          total_pecas: totalPecas,
          valor_total: valorTotal,
          status: 'pendente'
        };
        
        console.log('fechamentoBanca:', JSON.stringify(fechamentoBanca));
        
        const [novoFechamentoBancaId] = await knex('fechamentos_bancas').insert(fechamentoBanca);
        fechamentoBancaId = novoFechamentoBancaId;
      }
      
      // Inserir itens do fechamento
      if (itens.length > 0) {
        const itensComFechamentoId = itens.map(item => ({
          ...item,
          fechamento_banca_id: fechamentoBancaId
        }));
        console.log('itensComFechamentoId: '+JSON.stringify(itensComFechamentoId))
        await knex('fechamentos_itens').insert(itensComFechamentoId);
      }
      
      console.log(`[DEBUG] Fechamento da banca ${banca.nome} processado com sucesso`);
      
      return {
        id: fechamentoBancaId,
        fechamento_semanal_id: fechamentoId,
        banca_id: bancaId,
        nome_banca: banca.nome,
        data_inicio: dataInicio,
        data_fim: dataFim,
        total_pecas: totalPecas,
        valor_total: valorTotal,
        status: fechamentoBancaExistente ? fechamentoBancaExistente.status : 'pendente',
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
      console.log('[DEBUG] Buscando fechamento por ID:', id);
      
      const fechamento = await knex('fechamentos_semanais')
        .where({ id })
        .first();
      
      if (!fechamento) {
        console.log('[DEBUG] Fechamento não encontrado para ID:', id);
        return null;
      }
      
      console.log('[DEBUG] Fechamento encontrado:', {
        id: fechamento.id,
        semana: fechamento.semana,
        status: fechamento.status
      });
      
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
      
      console.log('[DEBUG] Fechamentos de bancas encontrados:', fechamentosBancas.length);
      
      // Buscar itens de cada fechamento de banca
      for (const fechamentoBanca of fechamentosBancas) {
        const itens = await knex('fechamentos_itens')
          .where({ fechamento_banca_id: fechamentoBanca.id })
          .orderBy('produto');
        
        fechamentoBanca.itens = itens;
        console.log(`[DEBUG] Banca ${fechamentoBanca.nome_banca}: ${itens.length} itens`);
      }
      
      fechamento.fechamentos = fechamentosBancas;
      
      console.log('[DEBUG] Fechamento completo retornado com sucesso');
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
        .where({ status: 'aberto' }) // Apenas fechamentos pagos no histórico
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