import axios from 'axios';

const API_URL = 'http://192.168.100.134:8687/api';

export interface Produto {
  id: string;
  nome_produto: string;
  sku: string;
  categoria?: string;
  valor_unitario: number;
  quantidade: number;
  estoque_minimo: number;
  localizacao?: string;
  unidade_medida: string;
  imagem?: string | null;
  codigo_barras?: string | null;
  fornecedor?: string | null;
  descricao?: string;
}

export const produtosService = {
  async listarProdutos(): Promise<Produto[]> {
    try {
      const response = await axios.get(`${API_URL}/produtos`);
      console.log(response)
      return response.data;
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  },

  async buscarProduto(id: string): Promise<Produto> {
    const response = await axios.get(`${API_URL}/produtos/${id}`);
    return response.data;
  },

  async criarProduto(produto: Omit<Produto, 'id'>): Promise<Produto> {
    const response = await axios.post(`${API_URL}/produtos`, produto);
    return response.data;
  },

  async atualizarProduto(produto: Produto): Promise<Produto> {
    const response = await axios.put(`${API_URL}/produtos/${produto.id}`, produto);
    return response.data;
  },

  async excluirProduto(id: string): Promise<void> {
    await axios.delete(`${API_URL}/produtos/${id}`);
  }
}; 