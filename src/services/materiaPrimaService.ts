import axios from 'axios';

const API_URL = 'http://192.168.100.129:8687';

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
  data_entrada: Date | string;
  status: "em_estoque" | "baixo_estoque" | "sem_estoque";
  codigo_barras?: string | null;
  codigoBarras?: string | null;
  observacoes?: string | null;
  criado_em?: string | Date;
  atualizado_em?: string | Date;
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
    console.log('bobina:', bobina);
    if (!bobina.id) {
      throw new Error('ID da bobina é obrigatório para atualização');
    }

    // Remove o ID do corpo da requisição
    const { id, ...dadosParaAtualizar } = bobina;

    const response = await axios.put(`${API_URL}/api/materia-prima/${id}`, dadosParaAtualizar, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return response.data;
  },

  async excluirBobina(id: string): Promise<void> {
    try {
      console.log('Excluindo bobina com ID:', id);
      const response = await axios.delete(`${API_URL}/api/materia-prima/${id}`);
      console.log('Resposta da exclusão:', response.data);
      
      if (!response.data.status && response.data.error) {
        throw new Error(response.data.error);
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao excluir bobina:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      } else if (error.message) {
        throw new Error(error.message);
      } else {
        throw new Error("Erro ao excluir bobina");
      }
    }
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
  },

  async buscarTiposTecido(): Promise<string[]> {
    const response = await axios.get(`${API_URL}/api/materia-prima/tipos-tecido`);
    return response.data;
  },

  async buscarCores(): Promise<string[]> {
    const response = await axios.get(`${API_URL}/api/materia-prima/cores`);
    return response.data;
  },

  async buscarCoresPorTipoTecido(tipoTecido: string): Promise<string[]> {
    const response = await axios.get(`${API_URL}/api/materia-prima/cores/${encodeURIComponent(tipoTecido)}`);
    return response.data;
  },

  async verificarCodigoBarras(codigoBarras: string): Promise<boolean> {
    try {
      const response = await axios.get(`${API_URL}/api/materia-prima/verificar-codigo-barras/${encodeURIComponent(codigoBarras)}`);
      return response.data.existe;
    } catch (error) {
      console.error('Erro ao verificar código de barras:', error);
      return false;
    }
  }
}; 