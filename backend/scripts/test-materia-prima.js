const knex = require("../database/connection");

async function testMateriaPrima() {
  try {
    console.log('=== TESTE DA TABELA MATERIAS_PRIMAS ===');
    
    // Verificar se a tabela existe
    const tableExists = await knex.schema.hasTable('materias_primas');
    console.log('Tabela materias_primas existe:', tableExists);
    
    if (tableExists) {
      // Verificar estrutura da tabela
      const columns = await knex.raw("DESCRIBE materias_primas");
      console.log('Colunas da tabela:', columns[0]);
      
      // Contar registros
      const count = await knex('materias_primas').count('* as total');
      console.log('Total de registros:', count[0].total);
      
      // Buscar alguns registros de exemplo
      const sample = await knex('materias_primas').select('*').limit(5);
      console.log('Registros de exemplo:', sample);
      
      // Testar busca de tipos de tecido
      const tiposTecido = await knex.select('tipo_tecido')
        .distinct()
        .whereNotNull('tipo_tecido')
        .where('tipo_tecido', '!=', '')
        .orderBy('tipo_tecido')
        .table("materias_primas");
      
      console.log('Tipos de tecido encontrados:', tiposTecido);
      
      // Testar busca de cores
      const cores = await knex.select('cor')
        .distinct()
        .whereNotNull('cor')
        .where('cor', '!=', '')
        .orderBy('cor')
        .table("materias_primas");
      
      console.log('Cores encontradas:', cores);
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  } finally {
    await knex.destroy();
  }
}

testMateriaPrima(); 