const Dashboard = require("../models/Dashboard")

class DashboardController {
  async getResumo(req, res) {
    const resumo = await Dashboard.getResumo()
    if (resumo) {
      res.json(resumo)
    } else {
      res.status(500).json({ err: "Erro ao buscar resumo do dashboard" })
    }
  }
}

module.exports = new DashboardController() 