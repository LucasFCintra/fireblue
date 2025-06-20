const knex = require('../database/connection');
const fs = require('fs');
const path = require('path');

async function runFechamentosMigration() {
  try {
    console.log('Iniciando migração das tabelas de fechamento...');
    
    // Ler o arquivo de migração
    const migrationPath = path.join(__dirname, '../database/migrations/create_fechamentos_table.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    // Executar as queries SQL
    const queries = migrationSQL.split(';').filter(query => query.trim());
    
    for (const query of queries) {
      if (query.trim()) {
        console.log('Executando query:', query.substring(0, 50) + '...');
        await knex.raw(query);
      }
    }
    
    console.log('Migração das tabelas de fechamento concluída com sucesso!');
    
  } catch (error) {
    console.error('Erro ao executar migração:', error);
  } finally {
    process.exit(0);
  }
}

runFechamentosMigration(); 