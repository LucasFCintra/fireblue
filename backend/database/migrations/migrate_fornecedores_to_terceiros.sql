-- Migrar dados da tabela fornecedores para terceiros
INSERT INTO terceiros (
  nome,
  cnpj,
  email,
  telefone,
  endereco,
  cidade,
  estado,
  cep,
  tipo
)
SELECT 
  nome,
  cnpj,
  email,
  telefone,
  endereco,
  cidade,
  estado,
  cep,
  'fornecedor' as tipo
FROM fornecedores; 