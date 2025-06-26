const knex = require("../../backend/database/connection")
const { v4: uuidv4 } = require('uuid');

class ProdutosModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("produtos")
      return result
    } catch (err) {
      console.log(err)
      return []
    }
  }

  async findById(id) {
    try {
      const result = await knex.select(["*"]).where({ id }).table("produtos")
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

  async create(produto) {
    try {
      // Garantir que os campos numéricos sejam do tipo correto
      const produtoFormatado = {
        ...produto,
        preco_venda: produto.preco_venda ? parseFloat(produto.preco_venda) : 0,
        estoque_atual: produto.estoque_atual ? parseFloat(produto.estoque_atual) : 0,
        estoque_minimo: produto.estoque_minimo ? parseFloat(produto.estoque_minimo) : 0
      };

      const result = await knex.insert(produtoFormatado).table("produtos")
      return await this.findById(result[0])
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async update(id, dados) {
    try {
      // Garantir que os campos numéricos sejam do tipo correto
      const dadosFormatados = {
        ...dados,
        preco_venda: dados.preco_venda ? parseFloat(dados.preco_venda) : 0,
        estoque_atual: dados.estoque_atual ? parseFloat(dados.estoque_atual) : 0,
        estoque_minimo: dados.estoque_minimo ? parseFloat(dados.estoque_minimo) : 0
      };
      console.log(id,dados)
      await knex.update(dadosFormatados).where({ id }).table("produtos")
      return { status: true, data: await this.findById(id) }
    } catch (err) {
      console.log(err)
      return { status: false, err: err.message }
    }
  }

  async delete(id) {
    try {
      const produto = await this.findById(id)
      if (!produto) {
        return { status: false, err: "Produto não encontrado" }
      }
      await knex.delete().where({ id }).table("produtos")
      return { status: true, data: produto }
    } catch (err) {
      console.log(err)
      return { status: false, err: err.message }
    }
  }

  async search(termo) {
    try {
      const result = await knex("produtos")
        .where("nome", "like", `%${termo}%`)
        .orWhere("codigo", "like", `%${termo}%`)
        .orWhere("codigo_barras", "like", `%${termo}%`)
        .select("*")
      return result
    } catch (err) {
      console.log(err)
      throw err
    }
  }

  async findLowStock() {
    try {
      console.log('Buscando produtos com estoque baixo...');
      
      // Query corrigida usando os nomes corretos dos campos
      const result = await knex('produtos')
        .select('*')
        .whereRaw('COALESCE(CAST(estoque_atual AS DECIMAL), 0) <= COALESCE(CAST(estoque_minimo AS DECIMAL), 0)')
        .orderBy('estoque_atual', 'asc');
      
      console.log('Produtos encontrados com estoque baixo:', result.length);
 
      return result.map(item => ({
        id: item.id,
        nome: item.nome,
        descricao: item.descricao,
        quantidade_atual: item.estoque_atual || 0,
        estoque_minimo: item.estoque_minimo || 0,
        unidade: item.unidade || 'un',
        status: parseFloat(item.estoque_atual || 0) === 0 ? 'Sem Estoque' : 'Baixo Estoque'
      }));
    } catch (err) {
      console.log('Erro ao buscar produtos com estoque baixo:', err);
      return [];
    }
  }

  async ajustarEstoque(id, dadosAjuste) {
    try {
      const produto = await this.findById(id);
      if (!produto) {
        return { status: false, err: "Produto não encontrado" };
      }

      const { tipoAjuste, quantidade, observacao } = dadosAjuste;
      let novaQuantidade = produto.estoque_atual;

      // Calcular nova quantidade com base no tipo de ajuste
      switch (tipoAjuste) {
        case "entrada":
          novaQuantidade = produto.estoque_atual + parseFloat(quantidade);
          break;
        case "saida":
          novaQuantidade = Math.max(0, produto.estoque_atual - parseFloat(quantidade));
          break;
        default:
          return { status: false, err: "Tipo de ajuste inválido" };
      }

      // Atualizar a quantidade do produto
      await knex.update({ estoque_atual: novaQuantidade }).where({ id }).table("produtos");

      // Registrar o histórico do ajuste (opcional - pode ser implementado em uma tabela separada)
      const historicoAjuste = {
        id: uuidv4(),
        produto_id: id,
        tipo_ajuste: tipoAjuste,
        quantidade_anterior: produto.estoque_atual,
        quantidade_ajuste: quantidade,
        nova_quantidade: novaQuantidade,
        observacao: observacao || null,
        data_ajuste: new Date().toISOString(),
        usuario: dadosAjuste.usuario || 'Sistema'
      };

      // Aqui você pode salvar o histórico em uma tabela separada se desejar
      // await knex.insert(historicoAjuste).table("historico_ajustes_estoque");

      return { 
        status: true, 
        data: {
          produto: await this.findById(id),
          ajuste: historicoAjuste
        }
      };
    } catch (err) {
      console.log(err);
      return { status: false, err: err.message };
    }
  }
}

module.exports = new ProdutosModel() 