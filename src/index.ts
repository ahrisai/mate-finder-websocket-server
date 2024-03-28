import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JwtUser } from './queryTypes.js';
import { secretKey } from './config.js';
import { compareSync } from 'bcrypt';
import { addUser } from './users.js';
import { Message } from './types/Message.js';
import { Chat } from './types/Chat.js';
import Player from './types/Player.js';
// import { addUser, findUser, getRoomUsers, removeUser } from './users.js';

const io = new Server(8080, {
  cors: {
    credentials: true,
    origin: 'http://localhost:5173',
  },
});

const chatRooms = new Map();
const messages = [];

io.on('connection', (socket) => {
  console.log('новый сокет подключен');
  socket.emit('connection');
  socket.on('join', (room) => {
    socket.join(room);
  });

  socket.on('firstMessage', ({ chat, partner }) => {
    socket.join(chat.id);
    //кладу все в бд
    io.sockets.emit('firstMessage', { chat: { ...chat, partner }, playerId: (chat.partner as Player).id });
    io.in(chat.id).emit('getMessage', chat.messages[0]);
  });

  socket.on('sendMessage', (message: Message) => {
    console.log(message);
    const room = io.sockets.adapter.rooms.get(message.chatId);
    console.log(room);
    if (room) {
      const users = Array.from(room);
      console.log('Пользователи в комнате', users);
    } else {
      console.log('Комната не найдена');
    }
    console.log('Все сокеты:', Array.from(io.sockets.sockets).length);
    io.in(message.chatId).emit('getMessage', message);
  });

  socket.on('leftRoom', ({ params }) => {});

  io.on('disconnect', () => {
    console.log('Disconnect');
  });
});

console.log('working');
