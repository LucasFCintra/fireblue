import { useState, useEffect } from "react";
import axios from "axios";
import { useSocketIO } from "./useSocketIO";
import { toast } from "@/components/ui/sonner";

const API_URL = 'http://26.203.75.236:8687';

export interface ItemInventario {
  id?: number;
  idInventario?: number;
  nome: string;
  quantidade: number;
  unidade?: string;
  categoria?: string;
  localizacao?: string;
  preco_unitario?: number;
  data_entrada?: string;
  data_validade?: string;
  codigo_barras?: string;
  fornecedor_id?: number;
  fornecedor?: string;
  observacoes?: string;
  status?: 'ativo' | 'inativo' | 'baixo';
  criado_em?: string;
  atualizado_em?: string;
}

export function useInventario() {
  const [inventario, setInventario] = useState<ItemInventario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { socket, connected } = useSocketIO();

  const fetchInventario = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/inventario`);
      const data = Array.isArray(response.data) 
        ? response.data 
        : (response.data.items || []);
      setInventario(data);
      setError(null);
    } catch (err) {
      setError("Erro ao carregar dados do inventário");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInventario();
  }, []);

  useEffect(() => {
    if (!socket) return;

    // Configurar ouvintes para os eventos do Socket.IO
    socket.on('inventario_item_criado', (novoItem: ItemInventario) => {
      console.log('Item de inventário criado:', novoItem);
      setInventario((prevItems) => [...prevItems, novoItem]);
      toast.success(`Item adicionado: ${novoItem.nome}`);
    });

    socket.on('inventario_item_atualizado', (itemAtualizado: ItemInventario) => {
      console.log('Item de inventário atualizado:', itemAtualizado);
      setInventario((prevItems) => 
        prevItems.map((item) => 
          (item.id === itemAtualizado.id || item.idInventario === itemAtualizado.idInventario) 
            ? itemAtualizado 
            : item
        )
      );
      toast.success(`Item atualizado: ${itemAtualizado.nome}`);
    });

    socket.on('inventario_item_excluido', (itemExcluido: ItemInventario) => {
      console.log('Item de inventário excluído:', itemExcluido);
      setInventario((prevItems) => 
        prevItems.filter((item) => 
          item.id !== itemExcluido.id && item.idInventario !== itemExcluido.idInventario
        )
      );
      toast.success(`Item removido: ${itemExcluido.nome}`);
    });

    // Limpar ouvintes ao desmontar o componente
    return () => {
      socket.off('inventario_item_criado');
      socket.off('inventario_item_atualizado');
      socket.off('inventario_item_excluido');
    };
  }, [socket]);

  const adicionarItem = async (item: ItemInventario) => {
    setIsLoading(true);
    try {
      const response = await axios.post(`${API_URL}/api/inventario`, item);
      setError(null);
      return response.data;
    } catch (err) {
      setError("Erro ao adicionar item ao inventário");
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const atualizarItem = async (id: number, item: Partial<ItemInventario>) => {
    setIsLoading(true);
    try {
      const response = await axios.put(`${API_URL}/api/inventario`, { ...item, id });
      setError(null);
      return response.data;
    } catch (err) {
      setError("Erro ao atualizar item do inventário");
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const excluirItem = async (id: number) => {
    setIsLoading(true);
    try {
      const response = await axios.delete(`${API_URL}/api/inventario/${id}`);
      setError(null);
      return response.data;
    } catch (err) {
      setError("Erro ao excluir item do inventário");
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    inventario, 
    isLoading, 
    error, 
    adicionarItem, 
    atualizarItem, 
    excluirItem,
    recarregarInventario: fetchInventario,
    socketConnected: connected
  };
} 