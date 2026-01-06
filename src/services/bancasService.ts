import axios from 'axios';

const API_URL = 'http://192.168.100.129:8687/api';

export interface Banca {
  id: string;
  nome: string;
  cnpj?: string;
  contato: string;
  telefone: string;
  endereco?: string;
  valorPorPeca?: number;
  tipo: string;
}

export const bancasService = {
  async listarBancas(): Promise<Banca[]> {
    try {
      const response = await axios.get(`${API_URL}/terceiros?tipo=banca`);
      return response.data.filter((banca: Banca) => banca.tipo === 'banca');
    } catch (error) {
      console.error('Erro ao buscar bancas:', error);
      return [];
    }
  }
}; 