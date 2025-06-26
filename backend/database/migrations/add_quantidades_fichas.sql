-- Adicionar colunas de quantidade recebida e perdida na tabela fichas
ALTER TABLE fichas 
ADD COLUMN quantidade_recebida INT DEFAULT 0,
ADD COLUMN quantidade_perdida INT DEFAULT 0;

-- Atualizar dados existentes com valores baseados no status
UPDATE fichas SET 
quantidade_recebida = CASE 
    WHEN status = 'concluido' THEN quantidade 
    WHEN status = 'recebido' THEN quantidade 
    ELSE 0 
END,
quantidade_perdida = CASE 
    WHEN status = 'concluido' THEN 0 
    WHEN status = 'recebido' THEN 0 
    ELSE FLOOR(RAND() * 5) -- Simular algumas perdas para dados de teste
END;

-- Adicionar alguns dados de teste mais recentes para a semana atual
INSERT INTO fichas (id, codigo, banca, data_entrada, data_previsao, quantidade, quantidade_recebida, quantidade_perdida, status, produto, cor, observacoes) VALUES
('9', 'FICHA-009', 'Banca da Semana', NOW() - INTERVAL 2 DAY, NOW() + INTERVAL 5 DAY, 60, 55, 5, 'em-producao', 'Camisa Social', 'Branco', 'Semana atual'),
('10', 'FICHA-010', 'Banca da Semana', NOW() - INTERVAL 1 DAY, NOW() + INTERVAL 4 DAY, 40, 38, 2, 'em-producao', 'Calça Social', 'Preto', 'Semana atual'),
('11', 'FICHA-011', 'Banca da Semana', NOW(), NOW() + INTERVAL 3 DAY, 30, 25, 5, 'em-producao', 'Vestido', 'Azul', 'Semana atual'); 