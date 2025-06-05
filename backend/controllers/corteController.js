const Corte = require('../models/Corte');

// Criar um novo corte
exports.criarCorte = async (req, res) => {
  try {
    const corte = new Corte(req.body);
    await corte.save();
    res.status(201).json(corte);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Listar todos os cortes
exports.listarCortes = async (req, res) => {
  try {
    const cortes = await Corte.find({ ativo: true });
    res.status(200).json(cortes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Buscar um corte específico
exports.buscarCorte = async (req, res) => {
  try {
    const corte = await Corte.findById(req.params.id);
    if (!corte) {
      return res.status(404).json({ message: 'Corte não encontrado' });
    }
    res.status(200).json(corte);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Atualizar um corte
exports.atualizarCorte = async (req, res) => {
  try {
    const corte = await Corte.findByIdAndUpdate(
      req.body.id,
      req.body,
      { new: true }
    );
    if (!corte) {
      return res.status(404).json({ message: 'Corte não encontrado' });
    }
    res.status(200).json(corte);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Deletar um corte (soft delete)
exports.deletarCorte = async (req, res) => {
  try {
    const corte = await Corte.findByIdAndUpdate(
      req.params.id,
      { ativo: false },
      { new: true }
    );
    if (!corte) {
      return res.status(404).json({ message: 'Corte não encontrado' });
    }
    res.status(200).json({ message: 'Corte removido com sucesso' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}; 