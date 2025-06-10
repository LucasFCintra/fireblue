-- Criação da tabela de fichas
CREATE TABLE IF NOT EXISTS fichas (
    id VARCHAR(36) PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL,
    banca VARCHAR(100) NOT NULL,
    data_entrada DATETIME NOT NULL,
    data_previsao DATETIME NOT NULL,
    quantidade INT NOT NULL,
    status ENUM('aguardando-retirada', 'em-producao', 'recebido', 'concluido') NOT NULL DEFAULT 'aguardando-retirada',
    produto VARCHAR(100) NOT NULL,
    cor VARCHAR(50) NOT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Criação da tabela de movimentações de fichas
CREATE TABLE IF NOT EXISTS movimentacoes_fichas (
    id VARCHAR(36) PRIMARY KEY,
    ficha_id VARCHAR(36) NOT NULL,
    data DATETIME NOT NULL,
    tipo ENUM('Entrada', 'Saída', 'Retorno', 'Conclusão') NOT NULL,
    quantidade INT NOT NULL,
    descricao TEXT NOT NULL,
    responsavel VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (ficha_id) REFERENCES fichas(id) ON DELETE CASCADE
);

-- Índices para melhorar a performance
CREATE INDEX idx_fichas_codigo ON fichas(codigo);
CREATE INDEX idx_fichas_banca ON fichas(banca);
CREATE INDEX idx_fichas_status ON fichas(status);
CREATE INDEX idx_fichas_data_entrada ON fichas(data_entrada);
CREATE INDEX idx_movimentacoes_ficha_id ON movimentacoes_fichas(ficha_id);
CREATE INDEX idx_movimentacoes_data ON movimentacoes_fichas(data);

-- Inserções de teste para a tabela de fichas
INSERT INTO fichas (id, codigo, banca, data_entrada, data_previsao, quantidade, status, produto, cor, observacoes) VALUES
('1', 'FICHA-001', 'Banca do João', '2024-03-01 09:00:00', '2024-03-15 18:00:00', 50, 'aguardando-retirada', 'Camisa Polo', 'Azul', 'Urgente'),
('2', 'FICHA-002', 'Banca da Maria', '2024-03-02 10:30:00', '2024-03-16 18:00:00', 30, 'em-producao', 'Calça Jeans', 'Preto', NULL),
('3', 'FICHA-003', 'Banca do Pedro', '2024-03-03 14:00:00', '2024-03-17 18:00:00', 25, 'recebido', 'Vestido', 'Vermelho', 'Tecido especial'),
('4', 'FICHA-004', 'Banca do José', '2024-03-04 11:15:00', '2024-03-18 18:00:00', 40, 'concluido', 'Blusa', 'Branco', NULL),
('5', 'FICHA-005', 'Banca da Ana', '2024-03-05 08:45:00', '2024-03-19 18:00:00', 35, 'aguardando-retirada', 'Short', 'Verde', 'Tamanho P'),
('6', 'FICHA-006', 'Banca do Carlos', '2024-03-06 13:20:00', '2024-03-20 18:00:00', 45, 'em-producao', 'Jaqueta', 'Cinza', 'Couro sintético'),
('7', 'FICHA-007', 'Banca da Paula', '2024-03-07 15:30:00', '2024-03-21 18:00:00', 20, 'recebido', 'Saia', 'Rosa', NULL),
('8', 'FICHA-008', 'Banca do Roberto', '2024-03-08 16:00:00', '2024-03-22 18:00:00', 55, 'concluido', 'Terno', 'Preto', 'Tamanho G');

-- Inserções de teste para a tabela de movimentações
INSERT INTO movimentacoes_fichas (id, ficha_id, data, tipo, quantidade, descricao, responsavel) VALUES
('1', '1', '2024-03-01 09:00:00', 'Entrada', 50, 'Entrada inicial de material', 'João Silva'),
('2', '2', '2024-03-02 10:30:00', 'Entrada', 30, 'Entrada inicial de material', 'Maria Santos'),
('3', '2', '2024-03-02 14:00:00', 'Saída', 15, 'Retirada para produção', 'Pedro Oliveira'),
('4', '3', '2024-03-03 14:00:00', 'Entrada', 25, 'Entrada inicial de material', 'José Pereira'),
('5', '3', '2024-03-03 16:00:00', 'Retorno', 25, 'Retorno da produção', 'Ana Costa'),
('6', '4', '2024-03-04 11:15:00', 'Entrada', 40, 'Entrada inicial de material', 'Carlos Souza'),
('7', '4', '2024-03-04 15:00:00', 'Conclusão', 40, 'Conclusão da produção', 'Paula Lima'),
('8', '5', '2024-03-05 08:45:00', 'Entrada', 35, 'Entrada inicial de material', 'Roberto Santos'); 