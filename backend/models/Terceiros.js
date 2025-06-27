const knex = require("../../backend/database/connection")

class TerceirosModel {
  async findAll() {
    try {
      const result = await knex.select(["*"]).table("terceiros")
      return result
    } catch (err) {
      console.log(err)
      return []
    }
  }

  async findById(idTerceiro) {
    try {
      const result = await knex.select(["*"]).where({ idTerceiro }).table("terceiros")
      if (result.length > 0) {
        return result[0]
      } else {
        return undefined
      }
    } catch (err) {
      console.log(err)
      return undefined
    }
  }
  
  async findByTipo(tipo) {
    try {
      const result = await knex.select(["*"]).where({ tipo }).table("terceiros")
      return result
    } catch (err) {
      console.log(err)
      return []
    }
  }

  async findByNome(nome) {
    try {
      const result = await knex.select(["idTerceiro"]).where({ nome }).table("terceiros")
      return JSON.stringify(result[0].idTerceiro)
    } catch (err) {
      console.log(err)
      return []
    }
  }


  async create(terceiro) {
    try {
      const ids = await knex.insert(terceiro).table("terceiros")
      // Após criar, buscar o terceiro completo para enviar via Socket
      const novoTerceiro = await this.findById(ids[0])
      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('terceiro_criado', novoTerceiro)
      }
      return novoTerceiro
    } catch (err) {
      console.log(err)
      return null
    }
  }

  async update(idTerceiro, terceiro) {
    try {
      // Verificar se o terceiro existe
      const existente = await this.findById(idTerceiro);
      if (!existente) {
        return { status: false, err: "Terceiro não encontrado" };
      }

      // Garantir que os dados estejam no formato correto
      const dadosParaAtualizar = {
        nome: terceiro.nome,
        cnpj: terceiro.cnpj || '',
        email: terceiro.email || '',
        telefone: terceiro.telefone || '',
        endereco: terceiro.endereco || '',
        cidade: terceiro.cidade || '',
        estado: terceiro.estado || '',
        cep: terceiro.cep || '',
        tipo: terceiro.tipo,
        observacoes: terceiro.observacoes || null,
        complemento: terceiro.complemento || '',
        numero: terceiro.numero || '',
        chave_pix: terceiro.chave_pix || ''
      };

      await knex.update(dadosParaAtualizar).where({ idTerceiro }).table("terceiros");
      
      // Após atualizar, buscar o terceiro completo para enviar via Socket
      const terceiroAtualizado = await this.findById(idTerceiro);
      
      if (!terceiroAtualizado) {
        return { status: false, err: "Erro ao buscar terceiro atualizado" };
      }

      // Emitir evento para todos os clientes conectados
      if (global.io) {
        global.io.emit('terceiro_atualizado', terceiroAtualizado);
      }
      
      return { status: true, data: terceiroAtualizado };
    } catch (err) {
      console.error('Erro ao atualizar terceiro:', err);
      return { status: false, err: err.message || "Erro ao atualizar terceiro" };
    }
  }

  async delete(idTerceiro) {
    try {
      // Buscar o terceiro antes de excluir para poder enviar os dados via Socket
      const terceiroExcluido = await this.findById(idTerceiro)
      
      await knex.delete().where({ idTerceiro }).table("terceiros")
      
      // Emitir evento para todos os clientes conectados
      if (global.io && terceiroExcluido) {
        global.io.emit('terceiro_excluido', terceiroExcluido)
      }
      
      return { status: true, data: terceiroExcluido }
    } catch (err) {
      return { status: false, err }
    }
  }
}

module.exports = new TerceirosModel() 