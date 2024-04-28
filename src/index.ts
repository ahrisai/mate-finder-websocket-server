import { Server } from 'socket.io';
import { Message } from './types/Message.js';
import { Chat } from './types/Chat.js';
import { PrismaClient } from '@prisma/client';
import { TeamRequest } from './types/TeamRequest.js';
const prisma = new PrismaClient();

const io = new Server(8080, {
  cors: {
    credentials: true,
    origin: 'http://localhost:5173',
  },
});
io.setMaxListeners(30);
io.on('connection', (socket) => {
  console.log('новый сокет подключен');

  socket.on('connected', (userId: number) => {
    socket.join(`TI-${userId}`);
  });

  socket.on('teamRequestToUser', async (teamInvite: TeamRequest) => {
    const roomId = `TI-${teamInvite.toUserId}`;

    socket.join(roomId);
    const req = await prisma.teamRequest.create({
      data: { roleId: teamInvite.roleId as number, teamId: teamInvite.teamId as number, toUserId: teamInvite.toUserId },
      include: { team: true, role: true },
    });
    io.to(roomId).emit('teamRequest', req);
  });

  socket.on('teamRequestToFriends', (teamInvites: TeamRequest[]) => {
    teamInvites.forEach((req) => {
      socket.join(`TI-${req.toUserId}`);
      socket.broadcast.to(`TI-${req.toUserId}`).emit('teamRequestToFriends', req);
    });
  });

  socket.on('answerTeamRequest', async (req: { accept: boolean; req: TeamRequest }) => {
    if (req.accept) {
      const newMember = await prisma.memberShip.create({
        data: { roleId: req.req.roleId, toUserId: req.req.toUserId, teamId: req.req.teamId as number },
        include: {
          role: true,
          user: true,
          team: true,
        },
      });

      await prisma.team.update({
        where: { id: req.req.teamId },
        data: {
          teamRequests: { delete: { id: req.req.id } },
        },
      });
      socket.emit('answerTeamRequest', { req: newMember, accept: true });
      socket.broadcast.to(`TI-${newMember.toUserId}`).emit('answerTeamRequest', { req: newMember, accept: true });
    } else {
      await prisma.team.update({
        where: { id: req.req.teamId },
        data: {
          teamRequests: { delete: { id: req.req.id } },
        },
      });
      socket.emit('answerTeamRequest', req);

      socket.broadcast.to(`TI-${req.req.toUserId}`).emit('answerTeamRequest', req);
    }
  });

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

  socket.on('friendRequest', async ({ fromUserId, toUserId }) => {
    try {
      const response = await prisma.friendRequest.create({
        data: {
          fromUserId,
          toUserId,
        },
      });
      const friendRequest = await prisma.friendRequest.findFirst({
        where: {
          fromUserId,
          toUserId,
        },
        include: {
          fromUser: true,
          toUser: true,
        },
      });
      socket.emit('friendRequest', friendRequest);
      io.emit('friendRequestToUser', friendRequest);
    } catch (error) {
      console.log(error);
    }
  });

  socket.on('friendRequestAction', async ({ accept, requestId }) => {
    if (accept) {
      try {
        const friendRequest = await prisma.friendRequest.findFirst({ where: { id: requestId } });
        if (friendRequest) {
          const fromUser = await prisma.user.findUnique({ where: { id: friendRequest.fromUserId } });
          const toUser = await prisma.user.findUnique({ where: { id: friendRequest.toUserId } });

          if (fromUser && toUser) {
            await prisma.user.update({
              where: { id: friendRequest.fromUserId },
              data: {
                friends: {
                  connect: { id: friendRequest.toUserId },
                },
              },
            });

            await prisma.user.update({
              where: { id: friendRequest.toUserId },
              data: {
                friends: {
                  connect: { id: friendRequest.fromUserId },
                },
              },
            });

            await prisma.friendRequest.delete({
              where: { id: requestId },
            });
            const userFriend1 = await prisma.user.findFirst({
              where: { id: friendRequest.fromUserId },
              include: { cs2_data: { select: { elo: true, kd: true, lvlImg: true } } },
            });
            const userFriend2 = await prisma.user.findFirst({
              where: { id: friendRequest.toUserId },
              include: { cs2_data: { select: { elo: true, kd: true, lvlImg: true } } },
            });

            socket.emit('friendRequestAction', { req: friendRequest, friend: { ...userFriend1, password: undefined, email: undefined } });
            io.emit('friendRequestActionToUser', { req: friendRequest, friend: { ...userFriend2, password: undefined, email: undefined } });
          }
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const friendRequest = await prisma.friendRequest.findFirst({ where: { id: requestId } });

        await prisma.friendRequest.delete({
          where: { id: requestId },
        });
        socket.emit('friendRequestAction', { req: friendRequest });
        io.emit('friendRequestActionToUser', { req: friendRequest });
      } catch (error) {
        console.log(error);
      }
    }
  });

  socket.on('leftRooms', () => {});

  io.on('disconnect', () => {
    console.log('Disconnect');
  });
});

console.log('working');
