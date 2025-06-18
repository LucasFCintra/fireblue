const Produtos = require("../models/Produtos")

class ProdutosController {
  async index(req, res) {
    try {
      const result = await Produtos.findAll()
      res.json(result)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Erro ao buscar produtos" })
    }
  }

  async indexOne(req, res) {
    try {
      const { idProduto } = req.params
      const result = await Produtos.findById(idProduto)
      if (!result) {
        return res.status(404).json({ error: "Produto não encontrado" })
      }
      res.json(result)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Erro ao buscar produto" })
    }
  }

  async create(req, res) {
    try {
      const { nome_produto, sku, valor_unitario } = req.body

      // Validações básicas
      if (!nome_produto) {
        return res.status(400).json({ error: "Nome do produto é obrigatório" })
      }

      if (!sku) {
        return res.status(400).json({ error: "SKU é obrigatório" })
      }

      if (!valor_unitario) {
        return res.status(400).json({ error: "Valor unitário é obrigatório" })
      }

      const result = await Produtos.create(req.body)
      res.status(201).json(result)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Erro ao criar produto" })
    }
  }

  async update(req, res) {
    try {
      const { id } = req.params
      const { nome_produto, sku, valor_unitario } = req.body

      console.log(id +'  '+ req.body)
      // Validações básicas
      if (!nome_produto) {
        return res.status(400).json({ error: "Nome do produto é obrigatório" })
      }

      if (!sku) {
        return res.status(400).json({ error: "SKU é obrigatório" })
      }

      if (!valor_unitario) {
        return res.status(400).json({ error: "Valor unitário é obrigatório" })
      }

      const result = await Produtos.update(id, req.body)
      if (!result.status) {
        return res.status(400).json({ error: result.err })
      }
      res.json(result.data)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Erro ao atualizar produto" })
    }
  }

  async delete(req, res) {
    try {
      const { idProduto } = req.params
      const result = await Produtos.delete(idProduto)
      if (!result.status) {
        return res.status(400).json({ error: result.err })
      }
      res.json(result.data)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Erro ao excluir produto" })
    }
  }

  async search(req, res) {
    try {
      const { termo } = req.query
      if (!termo) {
        return res.status(400).json({ error: "Termo de busca não fornecido" })
      }
      const result = await Produtos.search(termo)
      res.json(result)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: "Erro ao buscar produtos" })
    }
  }

   async getLowStock(req, res) {
    try {
      const lowStockItems = await Produtos.findLowStock(); 
      return res.json(lowStockItems);
    } catch (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error);
      return res.status(500).json({ error: 'Erro ao buscar produtos com estoque baixo' });
    }
  }
}

module.exports = new ProdutosController() 