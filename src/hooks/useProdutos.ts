import { useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';

interface Produto {
  id?: string;
  nome_produto: string;
  sku: string;
  categoria?: string;
  valor_unitario: string | number;
  quantidade: number;
  estoque_minimo: number;
  localizacao?: string;
  unidade_medida: string;
  imagem?: string | null;
  codigo_barras?: string | null;
  fornecedor?: string | null;
  descricao?: string;
}
const url = 'http://192.168.100.134:8687' 
export function useProdutos() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatarProduto = (produto: Produto) => {
    return {
      ...produto,
      valor_unitario: produto.valor_unitario ? parseFloat(produto.valor_unitario.toString()) : 0,
      quantidade: produto.quantidade || 0,
      estoque_minimo: produto.estoque_minimo || 0,
      imagem: produto.imagem || null,
      codigo_barras: produto.codigo_barras || null,
      fornecedor: produto.fornecedor || null,
      descricao: produto.descricao || ''
    };
  };

  const listar = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(url+'/api/produtos');
      return response.data;
    } catch (err) {
      setError('Erro ao listar produtos');
      toast.error('Erro ao listar produtos');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const buscar = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(url+`/api/produtos/${id}`);
      return response.data;
    } catch (err) {
      setError('Erro ao buscar produto');
      toast.error('Erro ao buscar produto');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const criar = async (produto: Produto) => {
    setIsLoading(true);
    setError(null);
    try {
      const produtoFormatado = formatarProduto(produto);
      const response = await axios.post(url+'/api/produtos', produtoFormatado);
      toast.success('Produto criado com sucesso!');
      return response.data;
    } catch (err: any) {
      const mensagem = err.response?.data?.error || 'Erro ao criar produto';
      setError(mensagem);
      toast.error(mensagem);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const atualizar = async (id: string, produto: Produto) => {
    setIsLoading(true);
    setError(null);
    try {
      const produtoFormatado = formatarProduto(produto);
      const response = await axios.put(url+`/api/produtos/${id}`, produtoFormatado);
      toast.success('Produto atualizado com sucesso!');
      return response.data;
    } catch (err: any) {
      const mensagem = err.response?.data?.error || 'Erro ao atualizar produto';
      setError(mensagem);
      toast.error(mensagem);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const excluir = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.delete(url+`/api/produtos/${id}`);
      toast.success('Produto excluído com sucesso!');
      return response.data;
    } catch (err: any) {
      const mensagem = err.response?.data?.error || 'Erro ao excluir produto';
      setError(mensagem);
      toast.error(mensagem);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const pesquisar = async (termo: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(url+`/api/produtos/search?termo=${encodeURIComponent(termo)}`);
      return response.data;
    } catch (err) {
      setError('Erro ao pesquisar produtos');
      toast.error('Erro ao pesquisar produtos');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const ajustarEstoque = async (id: string, dadosAjuste: any) => {
    setIsLoading(true);
    setError(null);
    try {
      console.log("Hook: Iniciando ajuste de estoque para ID:", id);
      console.log("Hook: Dados do ajuste:", dadosAjuste);
      
      const response = await axios.post(url+`/api/produtos/${id}/ajustar-estoque`, dadosAjuste);
      
      console.log("Hook: Resposta do servidor:", response.data);
      
      toast.success('Estoque ajustado com sucesso!');
      return response.data;
    } catch (err: any) {
      console.error("Hook: Erro detalhado:", err);
      const mensagem = err.response?.data?.error || 'Erro ao ajustar estoque';
      setError(mensagem);
      toast.error(mensagem);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const uploadImagem = async (file: File): Promise<string> => {
    setIsLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('imagem', file);

      const response = await axios.post(url + '/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload realizado com sucesso:', response.data);
      return response.data.url;
    } catch (err: any) {
      const mensagem = err.response?.data?.error || 'Erro ao fazer upload da imagem';
      setError(mensagem);
      toast.error(mensagem);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    listar,
    buscar,
    criar,
    atualizar,
    excluir,
    pesquisar,
    ajustarEstoque,
    uploadImagem
  };
} 