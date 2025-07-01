const { Console } = require("console")
const Fichas = require("../models/Fichas")
const { Controller } = require("react-hook-form")

class FichasController {
  async index(req, res) {   
    const fichas = await Fichas.findAll()
    res.json(fichas)
  }

  async indexOne(req, res) {
    const id = req.params.id
    const ficha = await Fichas.findById(id)
    if (!ficha) {
      res.status(404).json({})
    } else {
      res.json(ficha)
    }
  }

  async indexByTipo(req, res) {
    const tipo = req.params.tipo
    const fichas = await Fichas.findByTipo(tipo)
    res.json(fichas)
  }

  async indexByStatus(req, res) {
    const status = req.params.status
    const fichas = await Fichas.findByStatus(status)
    res.json(fichas)
  }

  async getStatusSummary(req, res) {
    const summary = await Fichas.getStatusSummary()
    res.json(summary)
  }

  async getFichasByStatus(req, res) {
    const status = req.params.status
    const fichas = await Fichas.findByStatus(status)
    res.json(fichas)
  }

  async create(req, res) {
    const terceiro = req.body
    if (terceiro) {
      const resultado = await Fichas.create(terceiro)
      if (resultado) {
        res.status(200).json({
          message: "Terceiro inserido com sucesso",
          data: resultado
        })
      } else {
        res.status(400).json({ err: "Erro ao inserir terceiro" })
      }
    } else {
      res.status(400).json({ err: "Informações indefinidas" })
    }
  }

  async update(req, res) {
    const { id, ...dados } = req.body

    console.log('ControllerID'+id)
    console.log('Controller'+JSON.stringify(req.body))
    if (id) {
      const result = await Fichas.update(id, dados)
      if (result.status) {
        res.status(200).json({
          message: "Terceiro atualizado com sucesso",
          data: result.data
        })
      } else {
        res.status(406).send(result.err)
      }
    } else {
      res.status(406).send("ID inválido")
    }
  }

  async delete(req, res) {
    const id = req.params.id
    const result = await Fichas.delete(id)
    if (result.status) {
      res.status(200).json({
        message: "Ficha excluída com sucesso",
        data: result.data
      })
    } else {
      res.status(406).send(result.err)
    }
  }

  async registrarMovimentacao(req, res) {
    try {
      const { id } = req.params;
      const movimentacao = req.body;
      console.log('Controller: '+movimentacao)
      // Validar se a ficha existe
      const ficha = await Fichas.findById(id);
      if (!ficha) {
        return res.status(404).json({ error: "Ficha não encontrada" });
      }

      // Registrar a movimentação
      const movimentacaoId = await Fichas.registrarMovimentacao(id, movimentacao);
      
      res.json({ 
        success: true, 
        message: "Movimentação registrada com sucesso",
        data: { id: movimentacaoId }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao registrar movimentação" });
    }
  }

  async buscarMovimentacoes(req, res) {
    try {
      const { id } = req.params;

      // Validar se a ficha existe
      const ficha = await Fichas.findById(id);
      if (!ficha) {
        return res.status(404).json({ error: "Ficha não encontrada" });
      }

      // Buscar as movimentações
      const movimentacoes = await Fichas.buscarMovimentacoes(id);
      
      res.json(movimentacoes);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erro ao buscar movimentações" });
    }
  }

  async getMonthlyStats(req, res) {
    try {
      const stats = await Fichas.getMonthlyStats();
      res.json(stats);
    } catch (error) {
      console.error('Erro ao buscar estatísticas mensais:', error);
      res.status(500).json({ error: 'Erro ao buscar estatísticas mensais' });
    }
  }

  async getRecebidosUltimosMeses(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      
     // console.log('FichasController - getRecebidosUltimosMeses - Query params:', req.query);
     // console.log('FichasController - getRecebidosUltimosMeses - dataInicio:', dataInicio);
     // console.log('FichasController - getRecebidosUltimosMeses - dataFim:', dataFim);
      
      const data = await Fichas.getRecebidosUltimosMeses(5, dataInicio, dataFim);
      
      //console.log('FichasController - getRecebidosUltimosMeses - Resultado:', data);
      
      res.json(data);
    } catch (error) {
      console.error('FichasController - getRecebidosUltimosMeses - Erro:', error);
      res.status(500).json({ error: 'Erro ao buscar dados dos últimos meses' });
    }
  }

  async getRelatorio(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      const relatorio = await Fichas.getRelatorio(dataInicio, dataFim);
      res.json(relatorio);
    } catch (error) {
      console.error('Erro ao buscar relatório:', error);
      res.status(500).json({ error: 'Erro ao buscar relatório' });
    }
  }

  async getPerdidasUltimosMeses(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      
     // console.log('FichasController - getPerdidasUltimosMeses - Query params:', req.query);
   //   console.log('FichasController - getPerdidasUltimosMeses - dataInicio:', dataInicio);
     // console.log('FichasController - getPerdidasUltimosMeses - dataFim:', dataFim);
      
      const data = await Fichas.getPerdidasUltimosMeses(5, dataInicio, dataFim);
      
    //  console.log('FichasController - getPerdidasUltimosMeses - Resultado:', data);
      
      res.json(data);
    } catch (error) {
      console.error('FichasController - getPerdidasUltimosMeses - Erro:', error);
      res.status(500).json({ error: 'Erro ao buscar peças perdidas dos últimos meses' });
    }
  }

  async getCortadasUltimosMeses(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      
      //console.log('FichasController - getCortadasUltimosMeses - Query params:', req.query);
     // console.log('FichasController - getCortadasUltimosMeses - dataInicio:', dataInicio);
      //console.log('FichasController - getCortadasUltimosMeses - dataFim:', dataFim);
      
      const data = await Fichas.getCortadasUltimosMeses(5, dataInicio, dataFim);
      
      //console.log('FichasController - getCortadasUltimosMeses - Resultado:', data);
      
      res.json(data);
    } catch (error) {
      console.error('FichasController - getCortadasUltimosMeses - Erro:', error);
      res.status(500).json({ error: 'Erro ao buscar peças cortadas dos últimos meses' });
    }
  }

  async getDadosConsolidadosPeriodo(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      
     /* console.log('FichasController - getDadosConsolidadosPeriodo - Query params:', req.query);
      console.log('FichasController - getDadosConsolidadosPeriodo - dataInicio:', dataInicio);
      console.log('FichasController - getDadosConsolidadosPeriodo - dataFim:', dataFim);
      */
      const data = await Fichas.getDadosConsolidadosPeriodo(dataInicio, dataFim);
      
     // console.log('FichasController - getDadosConsolidadosPeriodo - Resultado:', data);
      
      res.json(data);
    } catch (error) {
      console.error('FichasController - getDadosConsolidadosPeriodo - Erro:', error);
      res.status(500).json({ error: 'Erro ao buscar dados consolidados do período' });
    }
  }

  async getRecebidosDetalhadosPorBanca(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      
    //  console.log('FichasController - getRecebidosDetalhadosPorBanca - Query params:', req.query);
      
      const data = await Fichas.getRecebidosDetalhadosPorBanca(dataInicio, dataFim);
      
     // console.log('FichasController - getRecebidosDetalhadosPorBanca - Resultado:', data);
      
      res.json(data);
    } catch (error) {
      console.error('FichasController - getRecebidosDetalhadosPorBanca - Erro:', error);
      res.status(500).json({ error: 'Erro ao buscar dados detalhados de peças recebidas por banca' });
    }
  }

  async getPerdidasDetalhadasPorBanca(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      
     // console.log('FichasController - getPerdidasDetalhadasPorBanca - Query params:', req.query);
      
      const data = await Fichas.getPerdidasDetalhadasPorBanca(dataInicio, dataFim);
      
    //  console.log('FichasController - getPerdidasDetalhadasPorBanca - Resultado:', data);
      
      res.json(data);
    } catch (error) {
      console.error('FichasController - getPerdidasDetalhadasPorBanca - Erro:', error);
      res.status(500).json({ error: 'Erro ao buscar dados detalhados de peças perdidas por banca' });
    }
  }

  async getCortadasDetalhadasPorBanca(req, res) {
    try {
      const { dataInicio, dataFim } = req.query;
      
     // console.log('FichasController - getCortadasDetalhadasPorBanca - Query params:', req.query);
      
      const data = await Fichas.getCortadasDetalhadasPorBanca(dataInicio, dataFim);
      
      //console.log('FichasController - getCortadasDetalhadasPorBanca - Resultado:', data);
      
      res.json(data);
    } catch (error) {
      console.error('FichasController - getCortadasDetalhadasPorBanca - Erro:', error);
      res.status(500).json({ error: 'Erro ao buscar dados detalhados de peças cortadas por banca' });
    }
  }
}

module.exports = new FichasController() 