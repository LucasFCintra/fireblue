import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

// Obtém o endereço do servidor a partir de variáveis de ambiente ou usa um IP específico
// Substitua pelo IP da máquina na rede interna ou use window.location.hostname para detectar automaticamente
const getServerUrl = () => {
  // Pode-se usar window.location.hostname para pegar o host atual
  const hostname = window.location.hostname;
  // Se estiver em localhost, usar localhost, caso contrário usar o hostname detectado
  return `http://${hostname === 'localhost' ? 'localhost' : hostname}:8687`;
};

export const useSocketIO = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Inicializar a conexão com o Socket.IO usando o URL dinâmico
    const API_URL = getServerUrl();
    console.log('Conectando ao Socket.IO em:', API_URL);
    
    const socketInstance = io(API_URL, {
      transports: ['websocket', 'polling'], // Forçar WebSocket primeiro, depois polling como fallback
      reconnection: true,                   // Habilitar reconexão automática
      reconnectionAttempts: Infinity,       // Tentar reconectar indefinidamente
      reconnectionDelay: 1000,              // Tempo inicial entre tentativas de reconexão (1 segundo)
      reconnectionDelayMax: 5000,           // Tempo máximo entre tentativas (5 segundos)
      timeout: 20000                        // Timeout da conexão (20 segundos)
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

  return { socket, connected };
}; 