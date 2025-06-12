var bodyParser = require('body-parser')
var express = require("express");
var cors = require('cors')
var app = express()
var router = require("./routes/routes")
// Importando módulos de Socket.IO
var http = require('http');
var server = http.createServer(app);

// Obter endereço IP local (útil para debug)
const getLocalIpAddresses = () => {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  const results = {};

  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Ignorar endereços de loopback e não IPv4
      if (net.family === 'IPv4' && !net.internal) {
        if (!results[name]) {
          results[name] = [];
        }
        results[name].push(net.address);
      }
    }
  }
  return results;
};

// Configurações do Socket.IO
var io = require('socket.io')(server, {
  cors: {
    origin: "*",  // Permitir conexões de qualquer origem
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["*"],
    credentials: true
  },
  transports: ['websocket', 'polling'],  // Usar WebSocket primeiro, depois polling
  pingTimeout: 60000,    // Tempo para considerar cliente desconectado após último ping (60s)
  pingInterval: 25000,   // Intervalo entre pings (25s)
  connectTimeout: 30000, // Timeout para conexão inicial (30s)
  allowEIO3: true,       // Permitir Engine.IO versão 3 para compatibilidade
  serveClient: false     // Não servir cliente Socket.IO
});

// Objeto global para armazenar as conexões de socket
// Este objeto permite que os controllers e models enviem eventos para todos os clientes conectados
// É acessado nos controllers/models via global.io.emit('nome_do_evento', dados)
global.io = io;

try{
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// View engine
app.set('view engine','ejs');

// Configuração de CORS - importante para conexões de outras máquinas
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json())

// Middleware para logging de requisições
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use("/",router);

// Rota para verificar o status do servidor
app.get('/api/server-status', (req, res) => {
  const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    socketConnections: Object.keys(io.sockets.sockets).length,
    clientIp: clientIp
  });
});

// Configuração do Socket.IO para comunicação em tempo real
io.on('connection', (socket) => {
    console.log('Novo cliente conectado:', socket.id);
    
    // Log de informações sobre o cliente conectado
    const clientInfo = {
      id: socket.id,
      address: socket.handshake.address,
      headers: socket.handshake.headers,
      time: new Date().toISOString()
    };
    console.log('Informações do cliente:', JSON.stringify(clientInfo));
    
    // Enviar evento de boas-vindas para o cliente que acabou de conectar
    socket.emit('welcome', { message: 'Conectado ao servidor com sucesso!', time: new Date().toISOString() });
    
    // Broadcast para todos os clientes que um novo cliente se conectou
    socket.broadcast.emit('client_connected', { id: socket.id, time: new Date().toISOString() });
    
    // Monitorar desconexão
    socket.on('disconnect', (reason) => {
        console.log(`Cliente desconectado (${socket.id}): ${reason}`);
        
        // Notificar outros clientes sobre a desconexão
        socket.broadcast.emit('client_disconnected', { id: socket.id, reason, time: new Date().toISOString() });
    });
    
    // Endpoint para teste de ping/pong
    socket.on('ping_server', (data) => {
        console.log(`Ping recebido de ${socket.id}:`, data);
        socket.emit('pong_server', { 
            receivedAt: new Date().toISOString(),
            clientTimestamp: data.timestamp,
            message: 'Pong do servidor!' 
        });
    });
    
    // Eventos emitidos automaticamente pelos controllers e models quando há alterações:
    // - cliente_criado, cliente_atualizado, cliente_excluido
    // - fornecedor_criado, fornecedor_atualizado, fornecedor_excluido
    // - produto_criado, produto_atualizado, produto_excluido
    // - venda_criada, venda_atualizada, venda_excluida
    // - compra_criada, compra_atualizada, compra_excluida
    // - inventario_item_criado, inventario_item_atualizado, inventario_item_excluido
    // - materias_primas_criada, materias_primas_atualizada, materias_primas_excluida
    // - terceiro_criado, terceiro_atualizado, terceiro_excluido
});

// Usar o server em vez do app para o listen
const PORT = process.env.PORT || 8687;
const HOST = '0.0.0.0'; // Escutar em todas as interfaces de rede

server.listen(PORT, HOST, () => {
    const addressInfo = server.address();
    const localIps = getLocalIpAddresses();
    
    console.log(`===== API ON com suporte a Socket.IO =====`);
    console.log(`Porta: ${addressInfo.port}, Bind IP: ${addressInfo.address}`);
    console.log(`Endereços IP disponíveis na rede:`, JSON.stringify(localIps, null, 2));
    console.log(`Socket.IO disponível em: http://${HOST}:${PORT}`);
    console.log('=======================================');
});

}catch(err){
    console.log('index err?: '+ err)
} 