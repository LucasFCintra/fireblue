-- Criar tabela para terceiros (fornecedores e bancas)
CREATE TABLE IF NOT EXISTS terceiros (
  idTerceiro INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20),
  email VARCHAR(255),
  telefone VARCHAR(20),
  endereco VARCHAR(255),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  cep VARCHAR(10),
  tipo ENUM('fornecedor', 'banca') NOT NULL DEFAULT 'fornecedor',
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
); 