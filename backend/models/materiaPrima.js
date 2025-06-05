const knex = require("../../backend/database/connection");

class MateriasPrimasModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("materias_primas");
      return result;
    } catch (err) {
      console.log(err);
      return [];
    }
  }

  async findById(id) {
    try {
      const result = await knex.select(["*"]).where({ id }).table("materias_primas");
      if (result.length > 0) {
        return result[0];
      } else {
        return undefined;
      }
    } catch (err) {
      console.log(err);
      return undefined;
    }
  }

  async create(materiaPrima) {
    try {
      // Garantir que os dados estejam no formato correto
      const dadosFormatados = {
        tipo_tecido: materiaPrima.tipo_tecido,
        cor: materiaPrima.cor,
        lote: materiaPrima.lote,
        fornecedor: materiaPrima.fornecedor,
        quantidade_total: materiaPrima.quantidade_total,
        quantidade_disponivel: materiaPrima.quantidade_total, // Inicialmente igual à quantidade total
        unidade: materiaPrima.unidade || 'm',
        localizacao: materiaPrima.localizacao,
        data_entrada: materiaPrima.data_entrada || new Date(),
        codigo_barras: materiaPrima.codigo_barras,
        observacoes: materiaPrima.observacoes
      };

      const ids = await knex.insert(dadosFormatados).table("materias_primas");
      // Após criar, buscar a matéria prima completa para enviar via Socket
      const novaMateriaPrima = await this.findById(ids[0]);
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit("materias_primas_criada", novaMateriaPrima);
      }
      return novaMateriaPrima;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async update(id, materiaPrima) {
    try {
      console.log('Atualizando matéria prima:', { id, materiaPrima });
      
      // Verificar se a matéria prima existe
      const existente = await this.findById(id);
      if (!existente) {
        console.log('Matéria prima não encontrada:', id);
        return { status: false, err: "Matéria prima não encontrada" };
      }

      // Garantir que os dados estejam no formato correto
      const dadosFormatados = {
        tipo_tecido: materiaPrima.tipo_tecido,
        cor: materiaPrima.cor || '',
        lote: materiaPrima.lote || '',
        fornecedor: materiaPrima.fornecedor || '',
        quantidade_total: materiaPrima.quantidade_total,
        quantidade_disponivel: materiaPrima.quantidade_disponivel || materiaPrima.quantidade_total,
        unidade: materiaPrima.unidade || 'm',
        localizacao: materiaPrima.localizacao || '',
        data_entrada: materiaPrima.data_entrada || existente.data_entrada,
        codigo_barras: materiaPrima.codigo_barras || '',
        observacoes: materiaPrima.observacoes || ''
      };

      console.log('Dados formatados:', dadosFormatados);

      // Atualizar no banco
      await knex.update(dadosFormatados).where({ id }).table("materias_primas");
      
      // Buscar a matéria prima atualizada
      const materiaPrimaAtualizada = await this.findById(id);
      console.log('Matéria prima atualizada:', materiaPrimaAtualizada);

      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit("materias_primas_atualizada", materiaPrimaAtualizada);
      }
      
      return { status: true, data: materiaPrimaAtualizada };
    } catch (err) {
      console.error('Erro ao atualizar matéria prima:', err);
      return { status: false, err: err.message };
    }
  }

  async delete(id) {
    try {
      // Buscar a matéria prima antes de excluir para poder enviar os dados via Socket
      const materiaPrimaExcluida = await this.findById(id);
      
      await knex.delete().where({ id }).table("materias_primas");
      
      // Emitir evento para todos os clientes conectados
      if (global.io && materiaPrimaExcluida) {
        global.io.emit("materias_primas_excluida", materiaPrimaExcluida);
      }
      
      return { status: true, data: materiaPrimaExcluida };
    } catch (err) {
      return { status: false, err };
    }
  }

  async cortar(id, quantidadeCorte, ordemProducao = null, responsavel = null) {
    try {
      const bobina = await this.findById(id);
      if (!bobina) return { status: false, error: "Bobina não encontrada" };

      const novaQtd = bobina.quantidade_disponivel - quantidadeCorte;
      if (novaQtd < 0) return { status: false, error: "Estoque insuficiente" };

      await knex.update({
        quantidade_disponivel: novaQtd
      }).where({ id }).table("materias_primas");

      await knex.insert({
        materias_primas_id: id,
        tipo: "corte",
        quantidade: -quantidadeCorte,
        ordem_producao: ordemProducao,
        observacoes: responsavel ? `Responsável: ${responsavel}` : null,
        data_movimentacao: new Date()
      }).table("movimentacoes");

      const atualizada = await this.findById(id);
      return { status: true, data: atualizada };
    } catch (err) {
      console.log(err);
      return { status: false, err };
    }
  }
}

module.exports = new MateriasPrimasModel();