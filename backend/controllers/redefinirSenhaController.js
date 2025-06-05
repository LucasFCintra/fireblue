const RedefinirSenha = require("../models/RedefinirSenha")

class RedefinirSenhaController {
  async findByEmail(req, res) {
    const { email } = req.body
    const usuario = await RedefinirSenha.findByEmail(email)
    if (!usuario) {
      res.status(404).json({})
    } else {
      res.json(usuario)
    }
  }

  async updateSenha(req, res) {
    const { email, novaSenha } = req.body
    if (email && novaSenha) {
      const result = await RedefinirSenha.updateSenha(email, novaSenha)
      if (result.status) {
        res.status(200).send("Senha redefinida com sucesso")
      } else {
        res.status(406).send(result.err)
      }
    } else {
      res.status(400).json({ err: "Informações indefinidas" })
    }
  }
}

module.exports = new RedefinirSenhaController() 