-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS sge_fire_blue;
USE sge_fire_blue;

-- Tabela de matéria prima
CREATE TABLE IF NOT EXISTS materia_prima (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tipo_tecido VARCHAR(100) NOT NULL,
  cor VARCHAR(50) NOT NULL,
  lote VARCHAR(50) NOT NULL,
  fornecedor VARCHAR(100),
  quantidade_total DECIMAL(10,2) NOT NULL,
  quantidade_disponivel DECIMAL(10,2) NOT NULL,
  unidade VARCHAR(10) DEFAULT 'm',
  localizacao VARCHAR(50),
  data_entrada DATETIME NOT NULL,
  codigo_barras VARCHAR(50),
  observacoes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de movimentações
CREATE TABLE IF NOT EXISTS movimentacoes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  materia_prima_id INT NOT NULL,
  tipo ENUM('entrada', 'saida', 'corte') NOT NULL,
  quantidade DECIMAL(10,2) NOT NULL,
  ordem_producao VARCHAR(50),
  observacoes TEXT,
  data_movimentacao DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (materia_prima_id) REFERENCES materia_prima(id)
); 