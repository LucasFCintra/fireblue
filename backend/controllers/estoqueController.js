const EstoqueModel = require("../models/Estoques");

class EstoqueController {
  async index(req, res) {
    try {
      const items = await EstoqueModel.findAll();
      return res.json({ items });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar itens do estoque" });
    }
  }

  async indexOne(req, res) { 
    try {
      const { id } = req.params;
      const item = await EstoqueModel.findById(id);
      
      if (!item) {
        return res.status(404).json({ error: "Item não encontrado" });
      }
      
      return res.json(item);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao buscar item do estoque" });
    }
  }

  async create(req, res) {
    try {
      const item = await EstoqueModel.create(req.body);
      return res.status(201).json(item);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao criar item no estoque" });
    }
  }

  async update(req, res) {
    try {
      const { id } = req.body;
      const item = await EstoqueModel.update(id, req.body);
      return res.json(item);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao atualizar item do estoque" });
    }
  }

  async delete(req, res) {
    try {
      const { id } = req.params;
      await EstoqueModel.delete(id);
      return res.status(204).send();
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: "Erro ao excluir item do estoque" });
    }
  }
}

module.exports = new EstoqueController(); 