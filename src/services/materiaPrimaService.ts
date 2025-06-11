import axios from 'axios';

const API_URL = 'http://26.203.75.236:8687';

export interface Bobina {
  id: string;
  tipo_tecido: string;
  cor: string;
  lote: string;
  fornecedor: string;
  quantidade_total: number;
  quantidade_disponivel: number;
  unidade: string;
  localizacao: string;
  data_entrada: Date;
  status: "Em Estoque" | "Baixo Estoque" | "Sem Estoque";
  codigo_barras: string;
  observacoes?: string;
}

export interface Movimentacao {
  id: string;
  bobinaId: string;
  data: Date;
  tipo: "Entrada" | "Corte" | "Ajuste";
  quantidade_total: number;
  ordemProducao?: string;
  responsavel: string;
}
export interface Estoque {
  semEstoque: Bobina[];
  baixoEstoque: Bobina[];
  emEstoque: Bobina[];
} 

export const materiaPrimaService = {
  async listarBobinas(): Promise<Bobina[]> {
    const response = await axios.get(`${API_URL}/api/materia-prima`);
    return response.data;
  },

  async retornaEstoque(): Promise<Estoque> {
    const response = await axios.get(`${API_URL}/api/materia-prima/estoque`);
    return response.data;
  },

  async buscarBobina(id: string): Promise<Bobina> {
    const response = await axios.get(`${API_URL}/api/materia-prima/${id}`);
    return response.data;
  },

  async criarBobina(bobina: Omit<Bobina, 'id'>): Promise<Bobina> {
    const response = await axios.post(`${API_URL}/api/materia-prima`, bobina);
    return response.data.data;
  },

  async atualizarBobina(bobina: Bobina): Promise<Bobina> {
    const response = await axios.put(`${API_URL}/api/materia-prima`, bobina);
    return response.data.data;
  },

  async excluirBobina(id: string): Promise<void> {
    await axios.delete(`${API_URL}/api/materia-prima/${id}`);
  },

  async registrarCorte(id: string, quantidade: number, ordemProducao?: string, responsavel?: string): Promise<Bobina> {
    const response = await axios.post(`${API_URL}/api/materia-prima/${id}/corte`, {
      quantidade,
      ordemProducao,
      responsavel
    });
    console.log('Resposta do corte:', response.data);
    return response.data.data;
  },

  async buscarHistorico(id: string): Promise<Movimentacao[]> {
    const response = await axios.get(`${API_URL}/api/materia-prima/${id}/historico`);
    return response.data;
  }
}; 