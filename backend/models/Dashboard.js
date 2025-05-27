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
}

module.exports = new DashboardModel() 