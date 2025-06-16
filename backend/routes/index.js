const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'C:/xampp/htdocs/fireblue/imagens';
    
    try {
      // Criar o diretório se não existir
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      console.log('Diretório de upload:', uploadDir);
      cb(null, uploadDir);
    } catch (error) {
      console.error('Erro ao criar diretório:', error);
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    try {
      // Gerar um nome único para o arquivo
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const filename = uniqueSuffix + ext;
      console.log('Nome do arquivo gerado:', filename);
      cb(null, filename);
    } catch (error) {
      console.error('Erro ao gerar nome do arquivo:', error);
      cb(error);
    }
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite de 5MB
  },
  fileFilter: (req, file, cb) => {
    // Aceitar apenas imagens
    if (file.mimetype.startsWith('image/')) {
      console.log('Tipo de arquivo aceito:', file.mimetype);
      cb(null, true);
    } else {
      console.log('Tipo de arquivo rejeitado:', file.mimetype);
      cb(new Error('Apenas imagens são permitidas'));
    }
  }
});

// Rota para upload de imagem
router.post('/upload', upload.single('imagem'), (req, res) => {
  try {
    console.log('Recebendo requisição de upload');
    console.log('Arquivo recebido:', req.file);

    if (!req.file) {
      console.log('Nenhum arquivo recebido');
      return res.status(400).json({ error: 'Nenhuma imagem foi enviada' });
    }

    // Verificar se o arquivo foi realmente salvo
    const filePath = path.join('C:/xampp/htdocs/fireblue/imagens', req.file.filename);
    if (!fs.existsSync(filePath)) {
      console.error('Arquivo não encontrado após upload:', filePath);
      return res.status(500).json({ error: 'Erro ao salvar a imagem' });
    }

    console.log('Arquivo salvo com sucesso em:', filePath);

    // Retornar o URL completo da imagem
    const baseUrl = `http://${req.headers.host}`;
    const imageUrl = `${baseUrl}/imagens/${req.file.filename}`;
    console.log('URL da imagem:', imageUrl);
    
    res.json({ 
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro ao fazer upload da imagem' });
  }
});

// Rotas do estoque
router.get('/estoque', async (req, res) => {
  try {
    // Aqui você implementaria a lógica para buscar os itens do estoque
    const items = []; // Substitua por sua lógica de banco de dados
    res.json({ items });
  } catch (error) {
    console.error('Erro ao listar itens:', error);
    res.status(500).json({ error: 'Erro ao listar itens do estoque' });
  }
});

router.get('/estoque/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Aqui você implementaria a lógica para buscar um item específico
    const item = {}; // Substitua por sua lógica de banco de dados
    res.json(item);
  } catch (error) {
    console.error('Erro ao buscar item:', error);
    res.status(500).json({ error: 'Erro ao buscar item do estoque' });
  }
});

router.post('/estoque', async (req, res) => {
  try {
    const item = req.body;
    // Aqui você implementaria a lógica para criar um novo item
    const novoItem = {}; // Substitua por sua lógica de banco de dados
    res.json(novoItem);
  } catch (error) {
    console.error('Erro ao criar item:', error);
    res.status(500).json({ error: 'Erro ao criar item no estoque' });
  }
});

router.put('/estoque', async (req, res) => {
  try {
    const item = req.body;
    // Aqui você implementaria a lógica para atualizar um item
    const itemAtualizado = {}; // Substitua por sua lógica de banco de dados
    res.json(itemAtualizado);
  } catch (error) {
    console.error('Erro ao atualizar item:', error);
    res.status(500).json({ error: 'Erro ao atualizar item no estoque' });
  }
});

router.delete('/estoque/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Aqui você implementaria a lógica para excluir um item
    res.json({ message: 'Item excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir item:', error);
    res.status(500).json({ error: 'Erro ao excluir item do estoque' });
  }
});

module.exports = router; 