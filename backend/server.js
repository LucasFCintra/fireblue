const express = require('express');
const cors = require('cors');
const path = require('path');
const routes = require('./routes');

const app = express();

// Configurações básicas
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos da pasta imagens
const imagensPath = 'C:/xampp/htdocs/fireblue/imagens';
app.use('/imagens', express.static(imagensPath, {
  setHeaders: (res, path) => {
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
  }
}));

// Log para debug
console.log('Servindo arquivos estáticos de:', imagensPath);

// Usar as rotas
app.use('/api', routes);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({ error: 'Algo deu errado!' });
});

const PORT = process.env.PORT || 8687;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse as imagens em: http://localhost:${PORT}/imagens/`);
}); 