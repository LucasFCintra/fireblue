const knex = require("../../backend/database/connection")

class RedefinirSenhaModel {
  async findByEmail(email) {
    try {
      const result = await knex.select(["*"]).where({ email }).table("usuarios")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
    }
  }

  async updateSenha(email, novaSenha) {
    try {
      await knex.update({ senhaUser: novaSenha }).where({ emailUser: email }).table("usuarios")
      return { status: true }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new RedefinirSenhaModel() 