import axios from 'axios';
import { randomUUID } from 'crypto';

const API_URL = 'http://26.203.75.236:8687/api';

export interface Ficha {
  id: number;
  codigo: string;
  banca: string;
  data_entrada: string | Date;
  data_previsao: string | Date;
  quantidade: number;
  status: "aguardando_retirada" | "em_producao" | "recebido" | "concluido";
  produto: string;
  cor: string;
  observacoes?: string;
}

export interface Movimentacao {
  id: number;
  ficha_id: number;
  data: string | Date;
  tipo: "Entrada" | "Saída" | "Retorno" | "Conclusão";
  quantidade: number;
  descricao: string;
  responsavel: string;
}

export const fichasService = {
  async listarFichas(): Promise<Ficha[]> {
    const response = await axios.get(`${API_URL}/fichas`);
    return response.data;
  },

  async buscarFicha(id: string): Promise<Ficha> {
    const response = await axios.get(`${API_URL}/fichas/${id}`);
    return response.data;
  },

  async criarFicha(ficha: Omit<Ficha, 'id'>): Promise<Ficha> {
    const response = await axios.post(`${API_URL}/fichas`, ficha);
    return response.data.data;
  },

  async atualizarFicha(ficha: Ficha): Promise<Ficha> {
    const response = await axios.put(`${API_URL}/fichas/${ficha.id}`, ficha);
    return response.data.data;
  },

  async excluirFicha(id: string): Promise<void> {
    await axios.delete(`${API_URL}/fichas/${id}`);
  },

  async concluirFicha(id: string): Promise<Ficha> {
    const response = await axios.post(`${API_URL}/fichas/${id}/concluir`);
    return response.data.data;
  },

  async registrarMovimentacao(
    id: string, 
    tipo: "Entrada" | "Saída" | "Retorno" | "Conclusão", 
    quantidade: number, 
    descricao: string, 
    responsavel?: string
  ): Promise<Ficha> {
    const response = await axios.post(`${API_URL}/fichas/${id}/movimentacao`, {
      tipo,
      quantidade,
      descricao,
      responsavel
    });
    return response.data.data;
  },

  async buscarMovimentacoes(id: string): Promise<Movimentacao[]> {
    const response = await axios.get(`${API_URL}/fichas/${id}/movimentacoes`);
    return response.data;
  }
}; 