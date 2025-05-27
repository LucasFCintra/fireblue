import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const API_URL = 'http://localhost:8687';

export const useSocketIO = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    // Inicializar a conexão com o Socket.IO
    const socketInstance = io(API_URL);

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