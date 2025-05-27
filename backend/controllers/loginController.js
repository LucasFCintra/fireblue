const Login = require("../models/Login")

class LoginController {
  async login(req, res) {
    const { emailUser, senhaUser } = req.body
    const usuario = await Login.login(emailUser, senhaUser)
    if (usuario) {
      res.json(usuario)
    } else {
      res.status(401).json({ err: "Usuário ou senha inválidos" })
    }
  }
}

module.exports = new LoginController() 