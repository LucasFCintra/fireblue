const RecebimentosParciais = require('../models/RecebimentosParciais');
const Fichas = require('../models/Fichas');

class RecebimentosParciaisController {
  static async create(req, res) {
    try {
      const { ficha_id, quantidade_recebida, observacoes } = req.body;

      // Busca a ficha
      const ficha = await Fichas.findById(ficha_id);
      if (!ficha) {
        return res.status(404).json({ error: 'Ficha não encontrada' });
      }

      // Calcula a nova quantidade recebida
      const novaQuantidadeRecebida = (ficha.quantidade_recebida || 0) + quantidade_recebida;
      
      // Calcula a quantidade restante
      const quantidade_restante = ficha.quantidade - novaQuantidadeRecebida;

      // Cria o recebimento parcial
      const recebimento = await RecebimentosParciais.create({
        ficha_id,
        quantidade_recebida,
        quantidade_restante,
        observacoes,
        data_recebimento: new Date()
      });

      // Atualiza a quantidade recebida na ficha
      await Fichas.update(ficha_id, { 
        quantidade_recebida: novaQuantidadeRecebida,
        status: quantidade_restante === 0 ? 'concluido' : 'em_producao'
      });

      // Registra a movimentação
      await Fichas.registrarMovimentacao(ficha_id, {
        tipo: 'Entrada',
        quantidade: quantidade_recebida,
        descricao: `Recebimento parcial: ${observacoes || 'Sem observações'}`,
        responsavel: req.body.responsavel || 'Sistema'
      });

      return res.status(201).json(recebimento);
    } catch (error) {
      console.error('Erro ao criar recebimento parcial:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async findByFichaId(req, res) {
    try {
      const { fichaId } = req.params;
      const recebimentos = await RecebimentosParciais.findByFichaId(fichaId);
      return res.json(recebimentos);
    } catch (error) {
      console.error('Erro ao buscar recebimentos parciais:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async update(req, res) {
    try {
      const { id } = req.params;
      const recebimento = await RecebimentosParciais.update(id, req.body);
      return res.json(recebimento);
    } catch (error) {
      console.error('Erro ao atualizar recebimento parcial:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }

  static async delete(req, res) {
    try {
      const { id } = req.params;
      await RecebimentosParciais.delete(id);
      return res.status(204).send();
    } catch (error) {
      console.error('Erro ao deletar recebimento parcial:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}

module.exports = RecebimentosParciaisController; 