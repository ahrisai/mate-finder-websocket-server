import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { JwtUser } from './queryTypes.js';
import { secretKey } from './config.js';
import { compareSync } from 'bcrypt';
import { addUser } from './users.js';
import { Message } from './types/Message.js';
import { Chat } from './types/Chat.js';
import Player from './types/Player.js';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
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

  socket.on('firstMessage', async ({ chat, partner, userId }) => {
    socket.join(chat.id);
    const partnerChat = await prisma.chat.create({
      data: {
        roomId: chat.id,
        user: {
          connect: {
            id: partner.id,
          },
        },
        messages: { create: { ...chat.messages[0], chatId: undefined } },
      },
    });

    // Создаем запись в таблице Chat для userId
    const userChat = await prisma.chat.create({
      data: {
        roomId: chat.id,
        user: {
          connect: {
            id: userId,
          },
        },
      },
    });
    io.sockets.emit('firstMessage', { chat: { ...chat, partner }, playerId: (chat.partner as Player).id });
    io.in(chat.id).emit('getMessage', chat.messages[0]);
  });

  socket.on('sendMessage', async (message: Message) => {
    const chat = await prisma.chat.findFirst({
      where: {
        roomId: message.chatId,
      },
      select: {
        id: true,
      },
    });
    if (chat) {
      const chatId = chat.id;
      const newMessage = await prisma.message.create({
        data: {
          text: message.text,
          time: message.time,
          checked: message.checked,
          nickname: message.nickname,
          chatId: chatId,
        },
      });

      io.in(message.chatId).emit('getMessage', message);
    }
  });
  socket.on('getChats', async (userId: number) => {
    const chats = await prisma.chat.findMany({ where: { userId: userId }, include: { messages: true } });
    socket.emit('getChats', chats);
  });

  socket.on('leftRoom', ({ params }) => {});

  io.on('disconnect', () => {
    console.log('Disconnect');
  });
});

console.log('working');
