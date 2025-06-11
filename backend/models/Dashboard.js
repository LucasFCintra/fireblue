const knex = require("../../backend/database/connection")

class DashboardModel {
  async getResumo() {
    try {
      // Exemplo: retorna o total de vendas, compras, produtos, etc.
      const totalVendas = await knex("vendas").count("idVenda as total")
      const totalCompras = await knex("compras").count("idCompra as total")
      const totalProdutos = await knex("produtos").count("idProduto as total")
      return {
        vendas: totalVendas[0].total,
        compras: totalCompras[0].total,
        produtos: totalProdutos[0].total
      }
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async getProducaoSemanal() {
    try {
      const hoje = new Date();
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay()); // Domingo
      inicioSemana.setHours(0, 0, 0, 0);

      const fimSemana = new Date(inicioSemana);
      fimSemana.setDate(inicioSemana.getDate() + 6); // Sábado
      fimSemana.setHours(23, 59, 59, 999);

      const producao = await knex('fichas')
        .select(
          knex.raw('DAYNAME(data_entrada) as dia'),
          knex.raw('COUNT(*) as quantidade')
        )
        .whereBetween('data_entrada', [inicioSemana, fimSemana])
        .where('status', 'concluido')
        .groupBy('dia')
        .orderBy('data_entrada');

      // Mapear os dias da semana em português
      const diasSemana = {
        'Sunday': 'Dom',
        'Monday': 'Seg',
        'Tuesday': 'Ter',
        'Wednesday': 'Qua',
        'Thursday': 'Qui',
        'Friday': 'Sex',
        'Saturday': 'Sab'
      };

      // Formatar os dados para o gráfico
      const dadosFormatados = producao.map(item => ({
        name: diasSemana[item.dia],
        producao: item.quantidade
      }));

      return dadosFormatados;
    } catch (err) {
      console.log(err);
      return [];
    }
  }
}

module.exports = new DashboardModel() 