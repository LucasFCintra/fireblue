-- Criar tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
  id VARCHAR(36) PRIMARY KEY,
  codigo VARCHAR(50),
  codigo_barras VARCHAR(50),
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  grupo_id VARCHAR(36),
  subgrupo_id VARCHAR(36),
  sub_subgrupo_id VARCHAR(36),
  preco_custo DECIMAL(10,2) DEFAULT 0,
  preco_venda DECIMAL(10,2) DEFAULT 0,
  estoque_atual DECIMAL(10,2) DEFAULT 0,
  estoque_minimo DECIMAL(10,2) DEFAULT 0,
  unidade VARCHAR(10) DEFAULT 'un',
  imagem_url VARCHAR(255),
  status VARCHAR(20) DEFAULT 'Ativo',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (grupo_id) REFERENCES grupos(id) ON DELETE SET NULL,
  FOREIGN KEY (subgrupo_id) REFERENCES subgrupos(id) ON DELETE SET NULL,
  FOREIGN KEY (sub_subgrupo_id) REFERENCES sub_subgrupos(id) ON DELETE SET NULL
);

-- Criar índices para melhorar a performance
CREATE INDEX idx_produtos_codigo ON produtos(codigo);
CREATE INDEX idx_produtos_codigo_barras ON produtos(codigo_barras);
CREATE INDEX idx_produtos_nome ON produtos(nome);
CREATE INDEX idx_produtos_status ON produtos(status);
CREATE INDEX idx_produtos_grupo ON produtos(grupo_id);
CREATE INDEX idx_produtos_subgrupo ON produtos(subgrupo_id);
CREATE INDEX idx_produtos_sub_subgrupo ON produtos(sub_subgrupo_id);

-- Inserir alguns produtos de exemplo
INSERT INTO produtos (id, codigo, codigo_barras, nome, descricao, preco_custo, preco_venda, estoque_atual, estoque_minimo, unidade, status) VALUES
('1', 'PROD001', '7891234567890', 'Camisa Básica', 'Camisa básica de algodão', 25.00, 49.90, 100, 20, 'un', 'Ativo'),
('2', 'PROD002', '7891234567891', 'Calça Jeans', 'Calça jeans slim fit', 45.00, 89.90, 50, 10, 'un', 'Ativo'),
('3', 'PROD003', '7891234567892', 'Tênis Casual', 'Tênis casual confortável', 80.00, 159.90, 30, 5, 'un', 'Ativo'); 