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

io.on('connection', (socket) => {
  console.log('новый сокет подключен');
  socket.emit('connection');

  socket.on('joinRooms', (rooms: Chat[]) => {
    rooms.forEach((room) => {
      socket.join(room.roomId);
    });
  });

  socket.on('join', (room) => {
    socket.join(room);
  });

  socket.on('firstMessage', async (chat: Chat) => {
    socket.join(chat.roomId);

    // Создаем запись в таблице Chat для userId
    await prisma.chat.create({
      data: {
        roomId: chat.roomId,
        members: { connect: chat.members.map((member) => ({ id: member.id })) },
      },
    });

    await prisma.message.createMany({ data: chat.messages });
    const newChat = await prisma.chat.findFirst({ where: { roomId: chat.roomId }, include: { messages: true, members: true } });
    if (newChat) {
      io.sockets.emit('firstMessage', {
        chat: newChat,
        playerId: newChat.members.find((member) => member.nickname !== chat.members[1].nickname)?.id,
      });
      socket.emit('getMessage', newChat.messages[0]);
    }
  });

  socket.on('sendMessage', async (message: Message) => {
    const room = io.sockets.adapter.rooms.get(message.roomId);
    if (room) {
      const isSocketInRoom = room.has(socket.id);
      if (!isSocketInRoom) {
        socket.join(message.roomId);
      }
    }

    await prisma.message.create({ data: message });
    const newMessage = await prisma.message.findFirst({
      where: { nickname: message.nickname, roomId: message.roomId, time: message.time },
    });
    io.in(message.roomId).emit('getMessage', newMessage);
  });

  socket.on('readMessage', async (message: Message) => {
    await prisma.message.update({ where: { id: message.id }, data: { checked: true } });
    socket.emit('readMessage', { ...message, checked: true });
    socket.broadcast.to(message.roomId).emit('readMessage', { ...message, checked: true });
  });

  socket.on('checkWholeChat', async (messages: Message[]) => {
    const roomId = messages[0].roomId;
    const nickname = messages[0].nickname;

    await prisma.message.updateMany({
      where: { id: { in: messages.map((message) => message.id) } },
      data: { checked: true },
    });
    const checkedMessages = await prisma.message.findMany({ where: { roomId: roomId, nickname: nickname } });
    socket.emit('checkWholeChat', checkedMessages);

    socket.broadcast.to(roomId).emit('checkWholeChat', checkedMessages);
  });

  socket.on('leftRooms', () => {});

  io.on('disconnect', () => {
    console.log('Disconnect');
  });
});

console.log('working');
