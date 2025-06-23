const FechamentosModel = require('../models/Fechamentos');

class FechamentoController {
  /**
   * Gera um novo fechamento semanal
   */
  async gerarFechamento(req, res) {
    try {
      const { dataInicio, dataFim } = req.body;
      console.log(dataInicio,dataFim)
      if (!dataInicio || !dataFim) {
        return res.status(400).json({
          error: 'Data de início e fim são obrigatórias'
        });
      }
      
      const fechamento = await FechamentosModel.gerarFechamentoSemanal(dataInicio, dataFim);
      
      res.json(fechamento);
    } catch (error) {
      console.error('Erro ao gerar fechamento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * Busca um fechamento por ID
   */
  async buscarFechamento(req, res) {
    try {
      const { id } = req.params;
      
      const fechamento = await FechamentosModel.buscarFechamentoPorId(id);
      
      if (!fechamento) {
        return res.status(404).json({
          error: 'Fechamento não encontrado'
        });
      }
      
      res.json(fechamento);
    } catch (error) {
      console.error('Erro ao buscar fechamento:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * Lista todos os fechamentos
   */
  async listarFechamentos(req, res) {
    try {
      const fechamentos = await FechamentosModel.listarFechamentos();
      
      res.json(fechamentos);
    } catch (error) {
      console.error('Erro ao listar fechamentos:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * Finaliza o fechamento de uma banca específica
   */
  async finalizarFechamentoBanca(req, res) {
    try {
      const { fechamentoId, bancaId } = req.params;
      
      const resultado = await FechamentosModel.finalizarFechamentoBanca(fechamentoId, bancaId);
      
      if (resultado) {
        res.json({
          success: true,
          message: 'Fechamento da banca finalizado com sucesso'
        });
      } else {
        res.status(400).json({
          error: 'Não foi possível finalizar o fechamento da banca'
        });
      }
    } catch (error) {
      console.error('Erro ao finalizar fechamento da banca:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * Finaliza o fechamento semanal completo
   */
  async finalizarFechamentoSemanal(req, res) {
    try {
      const { id } = req.params;
      
      const resultado = await FechamentosModel.finalizarFechamentoSemanal(id);
      
      if (resultado) {
        res.json({
          success: true,
          message: 'Fechamento semanal finalizado com sucesso'
        });
      } else {
        res.status(400).json({
          error: 'Não foi possível finalizar o fechamento semanal'
        });
      }
    } catch (error) {
      console.error('Erro ao finalizar fechamento semanal:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
  
  /**
   * Busca bancas com movimentação em um período
   */
  async buscarBancasComMovimentacao(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      console.log('Controller: '+JSON.stringify(req.query))
      if (!dataInicio || !dataFim) {
        return res.status(400).json({
          error: 'Data de início e fim são obrigatórias'
        });
      }
      
      const bancas = await FechamentosModel.buscarBancasComMovimentacao(dataInicio, dataFim);
      console.log('Controleer 2: '+bancas)
      res.json(bancas);
    } catch (error) {
      console.error('Erro ao buscar bancas com movimentação:', error);
      res.status(500).json({
        error: 'Erro interno do servidor'
      });
    }
  }
}

module.exports = new FechamentoController(); 