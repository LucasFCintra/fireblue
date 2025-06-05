const knex = require("../../backend/database/connection")

class LoginModel {
  async login(emailUser, senhaUser) {
    try {
      const result = await knex.select(["idUser"]).where({ emailUser, senhaUser }).table("usuarios")
      if (result.length > 0) {
        return result[0]
      } else {
        return null
      }
    } catch (err) {
      console.log(err)
      return null
    }
  }
}

module.exports = new LoginModel() 