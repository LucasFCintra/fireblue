import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

/**
 * Hook para gerenciar a conexão Socket.IO com o servidor para comunicação em tempo real.
 * 
 * Este hook permite:
 * 1. Estabelecer conexão com o servidor Socket.IO
 * 2. Receber eventos em tempo real quando dados são alterados no servidor
 * 3. Atualizar a interface automaticamente sem necessidade de recarregar a página
 * 
 * Exemplos de uso:
 * 
 * ```tsx
 * // Em um componente React:
 * const { socket, connected } = useSocketIO();
 * 
 * useEffect(() => {
 *   if (!socket) return;
 *   
 *   // Escutar por eventos específicos
 *   socket.on('cliente_criado', (novoCliente) => {
 *     // Atualizar estado local com o novo cliente
 *     setClientes(prev => [...prev, novoCliente]);
 *   });
 *   
 *   // Limpar listeners ao desmontar
 *   return () => {
 *     socket.off('cliente_criado');
 *   };
 * }, [socket]);
 * ```
 * 
 * Para mais exemplos, veja os hooks: useClientes, useFornecedores, useInventario, etc.
 */

// Obtém o endereço do servidor a partir de variáveis de ambiente ou usa um IP específico
// Para redes locais ou VPN (como Radmin), use um IP fixo que seja acessível por todas as máquinas
const getServerUrl = () => {
  // Verificar se estamos em produção (Vercel)
  const isProduction = window.location.hostname.includes('vercel.app') || 
                       window.location.hostname.includes('fireblue.vercel.app');
  
  // Usar IP fixo do servidor (substituir pelo IP real da máquina que está rodando o backend)
  // Se o IP estiver armazenado no localStorage, use-o em vez do valor padrão
  const storedServerIp = localStorage.getItem('serverIp');
  
  // Se o hostname for 192.168.100.134, use 192.168.100.134
  const hostname = window.location.hostname;
  if (hostname === '192.168.100.134' || hostname === '127.0.0.1') {
    return `http://192.168.100.134:8687`;
  }
  
  // Se houver um IP armazenado, use-o
  if (storedServerIp) {
    return `http://${storedServerIp}:8687`;
  }
  
  // Se estamos em produção (Vercel), usamos o IP do servidor externo
  if (isProduction) {
    // Se não houver IP armazenado para produção, usar o fallback
    const productionServerIp = localStorage.getItem('productionServerIp') || '26.30.247.237';
    return `http://${productionServerIp}:8687`;
  }
  
  // Use o hostname atual como fallback
  return `http://${hostname}:8687`;
};

// Função para salvar o IP do servidor no localStorage
export const setServerIp = (ip: string) => {
  // Verifica se estamos em produção (Vercel)
  const isProduction = window.location.hostname.includes('vercel.app');
  
  if (isProduction) {
    localStorage.setItem('productionServerIp', ip);
  } else {
    localStorage.setItem('serverIp', ip);
  }
  
  // Recarregar a página para aplicar a nova configuração
  window.location.reload();
};

// Função para obter o IP do servidor atual
export const getServerIp = () => {
  // Verifica se estamos em produção (Vercel)
  const isProduction = window.location.hostname.includes('vercel.app');
  
  if (isProduction) {
    return localStorage.getItem('productionServerIp') || '';
  }
  
  return localStorage.getItem('serverIp') || window.location.hostname;
};

export const useSocketIO = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connectionUrl, setConnectionUrl] = useState('');

  useEffect(() => {
    // Inicializar a conexão com o Socket.IO usando o URL dinâmico
    const API_URL = getServerUrl();
    setConnectionUrl(API_URL);
    console.log('Conectando ao Socket.IO em:', API_URL);
    
    const socketInstance = io(API_URL, {
      transports: ['websocket', 'polling'], // Forçar WebSocket primeiro, depois polling como fallback
      reconnection: true,                   // Habilitar reconexão automática
      reconnectionAttempts: Infinity,       // Tentar reconectar indefinidamente
      reconnectionDelay: 1000,              // Tempo inicial entre tentativas de reconexão (1 segundo)
      reconnectionDelayMax: 5000,           // Tempo máximo entre tentativas (5 segundos)
      timeout: 20000,                       // Timeout da conexão (20 segundos)
      forceNew: true,                       // Forçar nova conexão
      autoConnect: true                     // Conectar automaticamente
    });

    // Definir callbacks para os eventos de conexão
    socketInstance.on('connect', () => {
      console.log('Conectado ao servidor Socket.IO');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Desconectado do servidor Socket.IO');
      setConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Erro na conexão Socket.IO:', error);
      setConnected(false);
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      console.log(`Tentativa de reconexão #${attemptNumber}`);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      console.log(`Reconectado após ${attemptNumber} tentativas`);
      setConnected(true);
    });

    // Guardar a instância do socket no estado
    setSocket(socketInstance);

    // Limpar ao desmontar o componente
    return () => {
      console.log('Fechando conexão Socket.IO');
      socketInstance.disconnect();
    };
  }, []);

  return { socket, connected, connectionUrl };
}; 