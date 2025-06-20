-- Criação da tabela de fechamentos semanais
CREATE TABLE IF NOT EXISTS fechamentos_semanais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    semana VARCHAR(10) NOT NULL, -- formato: YYYY-WNN (ex: 2024-W01)
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    total_pecas INT NOT NULL DEFAULT 0,
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('aberto', 'pago', 'cancelado') NOT NULL DEFAULT 'aberto',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_pagamento TIMESTAMP NULL DEFAULT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criação da tabela de fechamentos por banca
CREATE TABLE IF NOT EXISTS fechamentos_bancas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fechamento_semanal_id INT NOT NULL,
    banca_id INT NOT NULL,
    nome_banca VARCHAR(255) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    total_pecas INT NOT NULL DEFAULT 0,
    valor_total DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('pendente', 'pago', 'cancelado') NOT NULL DEFAULT 'pendente',
    data_pagamento TIMESTAMP NULL DEFAULT NULL,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (fechamento_semanal_id) REFERENCES fechamentos_semanais(id) ON DELETE CASCADE,
    FOREIGN KEY (banca_id) REFERENCES terceiros(idTerceiro) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Criação da tabela de itens do fechamento (fichas processadas)
CREATE TABLE IF NOT EXISTS fechamentos_itens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    fechamento_banca_id INT NOT NULL,
    ficha_id INT NOT NULL,
    codigo_ficha VARCHAR(50) NOT NULL,
    produto VARCHAR(255) NOT NULL,
    quantidade INT NOT NULL,
    valor_unitario DECIMAL(10,2) NOT NULL,
    valor_total DECIMAL(10,2) NOT NULL,
    data_entrada DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (fechamento_banca_id) REFERENCES fechamentos_bancas(id) ON DELETE CASCADE,
    FOREIGN KEY (ficha_id) REFERENCES fichas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices para melhorar a performance
CREATE INDEX idx_fechamentos_semanais_semana ON fechamentos_semanais(semana);
CREATE INDEX idx_fechamentos_semanais_data_inicio ON fechamentos_semanais(data_inicio);
CREATE INDEX idx_fechamentos_semanais_data_fim ON fechamentos_semanais(data_fim);
CREATE INDEX idx_fechamentos_semanais_status ON fechamentos_semanais(status);
CREATE INDEX idx_fechamentos_bancas_fechamento_id ON fechamentos_bancas(fechamento_semanal_id);
CREATE INDEX idx_fechamentos_bancas_banca_id ON fechamentos_bancas(banca_id);
CREATE INDEX idx_fechamentos_bancas_status ON fechamentos_bancas(status);
CREATE INDEX idx_fechamentos_itens_fechamento_banca_id ON fechamentos_itens(fechamento_banca_id);
CREATE INDEX idx_fechamentos_itens_ficha_id ON fechamentos_itens(ficha_id); 