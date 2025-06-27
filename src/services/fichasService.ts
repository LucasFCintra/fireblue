import axios from 'axios';
import { randomUUID } from 'crypto';

const API_URL = 'http://192.168.100.134:8687/api';

export type Ficha = {
  id: number;
  codigo: string;
  banca: string;
  data_entrada: Date | string;
  data_previsao: Date | string;
  quantidade: number;
  quantidade_recebida: number;
  quantidade_perdida: number;
  status: "aguardando_retirada" | "em_producao" | "concluido" | "recebido_parcialmente";
  produto: string;
  produto_id: string;
  cor: string;
  tamanho: "P" | "M" | "G" | "GG";
  observacoes: string;
};

export interface Movimentacao {
  id: number;
  ficha_id: number;
  data: string | Date;
  tipo: "Entrada" | "Saída" | "Retorno" | "Conclusão" | "Perda";
  quantidade: number;
  descricao: string;
  responsavel: string;
}

export const fichasService = {
  async listarFichas(): Promise<Ficha[]> {
    const response = await axios.get(`${API_URL}/fichas`);
    return response.data;
  },

  async buscarFicha(id: number): Promise<Ficha> {
    const response = await axios.get(`${API_URL}/fichas/${id}`);
    return response.data;
  },

  async criarFicha(ficha: Omit<Ficha, 'id'>): Promise<Ficha> {
    const response = await axios.post(`${API_URL}/fichas`, ficha);
    return response.data.data;
  },

  async atualizarFicha(ficha: Ficha): Promise<Ficha> {
    const fichaParaEnviar = {
      ...ficha,
      data_entrada: ficha.data_entrada instanceof Date ? ficha.data_entrada.toISOString() : ficha.data_entrada,
      data_previsao: ficha.data_previsao instanceof Date ? ficha.data_previsao.toISOString() : ficha.data_previsao
    };
    const response = await axios.put(`${API_URL}/fichas/${ficha.id}`, fichaParaEnviar);
    return response.data.data;
  },

  async excluirFicha(id: number): Promise<void> {
    await axios.delete(`${API_URL}/fichas/${id}`);
  },

  async concluirFicha(id: number): Promise<Ficha> {
    const response = await axios.post(`${API_URL}/fichas/${id}/concluir`);
    return response.data.data;
  },

  async registrarMovimentacao(
    id: number, 
    tipo:  "Entrada" | "Saída" | "Retorno" | "Conclusão" | "Perda", 
    quantidade: number, 
    descricao: string, 
    responsavel?: string
  ): Promise<Ficha> {
    try {
      // Primeiro, buscar a ficha atual
      const fichaAtual = await this.buscarFicha(id);
      
      // Calcular a nova quantidade recebida
      const novaQuantidadeRecebida = fichaAtual.quantidade_recebida + quantidade;
      
      // Atualizar a ficha com a nova quantidade recebida
      const fichaAtualizada = await this.atualizarFicha({
        ...fichaAtual,
        quantidade_recebida: novaQuantidadeRecebida,
        // Se a quantidade recebida for igual ou maior que a quantidade total, marcar como concluído
        status: novaQuantidadeRecebida >= fichaAtual.quantidade ? "concluido" : "recebido_parcialmente"
      });

      // Registrar a movimentação
      const response = await axios.post(`${API_URL}/fichas/${id}/movimentacao`, {
        tipo,
        quantidade,
        descricao,
        responsavel,
        data: new Date().toISOString()
      });

      console.log(response)

      return fichaAtualizada;
    } catch (error) {
      console.error("Erro ao registrar movimentação:", error);
      throw error;
    }
  },

  async buscarMovimentacoes(id: number): Promise<Movimentacao[]> {
    const response = await axios.get(`${API_URL}/fichas/${id}/movimentacoes`);
    return response.data;
  },

  async buscarRelatorio(dataInicio?: string, dataFim?: string): Promise<any> {
    try {
      let url = `${API_URL}/fichas/relatorio`;
      const params: any = {};
      
      if (dataInicio && dataFim) {
        params.dataInicio = dataInicio;
        params.dataFim = dataFim;
      } else if (dataInicio) {
        params.dataInicio = dataInicio;
      } else if (dataFim) {
        params.dataFim = dataFim;
      }
      
      console.log('FichasService - URL:', url);
      console.log('FichasService - Params:', params);
      
      const response = await axios.get(url, { params });
      
      console.log('FichasService - Response status:', response.status);
      console.log('FichasService - Response data:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('FichasService - Erro ao buscar relatório:', error);
      console.error('FichasService - Error response:', error.response?.data);
      throw error;
    }
  },

  async buscarDadosSemanais(dataInicio: string, dataFim: string): Promise<any> {
    const response = await axios.get(`${API_URL}/fichas/relatorio`, {
      params: {
        dataInicio,
        dataFim
      }
    });
    return response.data;
  },

  async buscarRecebidosUltimosMeses(dataInicio?: string, dataFim?: string): Promise<any[]> {
    const params: any = {};
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;
    
    const response = await axios.get(`${API_URL}/fichas/recebidos/ultimos-meses`, { params });
    return response.data;
  },

  async buscarPerdidasUltimosMeses(dataInicio?: string, dataFim?: string): Promise<any[]> {
    const params: any = {};
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;
    
    const response = await axios.get(`${API_URL}/fichas/perdidas/ultimos-meses`, { params });
    return response.data;
  },

  async buscarCortadasUltimosMeses(dataInicio?: string, dataFim?: string): Promise<any[]> {
    const params: any = {};
    if (dataInicio) params.dataInicio = dataInicio;
    if (dataFim) params.dataFim = dataFim;
    
    const response = await axios.get(`${API_URL}/fichas/cortadas/ultimos-meses`, { params });
    return response.data;
  }
}; 