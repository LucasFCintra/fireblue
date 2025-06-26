-- Adicionar campo chave_pix à tabela terceiros
ALTER TABLE terceiros 
ADD COLUMN chave_pix VARCHAR(255) AFTER cep;

-- Adicionar campo complemento e numero se não existirem
ALTER TABLE terceiros 
ADD COLUMN complemento VARCHAR(100) AFTER cep,
ADD COLUMN numero VARCHAR(20) AFTER complemento; 