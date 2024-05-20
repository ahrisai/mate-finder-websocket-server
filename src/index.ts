import { Server } from 'socket.io';
import { Message } from './types/Message.js';
import { Chat } from './types/Chat.js';
import { PrismaClient } from '@prisma/client';
import Team from './types/Team.js';
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
  socket.emit('connection');
  socket.on('connected', (userId: number) => {
    console.log(userId);
    socket.join(`TI-${userId}`);
    socket.join(`${userId}`);
  });

  socket.on('teamRequest', async (teamInvite: TeamRequest) => {
    const roomId = `TI-${teamInvite.toUserId}`;

    const req = await prisma.teamRequest.create({
      data: {
        roleId: teamInvite.roleId as number,
        teamId: teamInvite.teamId as number,
        toUserId: teamInvite.toUserId,
        isFromTeam: teamInvite.isFromTeam,
      },
      include: {
        team: true,
        role: true,
        user: { select: { nickname: true, user_avatar: true, id: true, cs2_data: { select: { lvlImg: true } } } },
      },
    });
    if (teamInvite.isFromTeam) {
      socket.join(roomId);
      io.to(roomId).emit('teamRequest', req);
    } else {
      socket.emit('teamRequest', req);
      io.to(req.team.userId.toString()).emit('teamRequest', req);
    }
  });

  socket.on('teamRequestToFriends', (teamInvites: TeamRequest[]) => {
    teamInvites.forEach((req) => {
      socket.join(`TI-${req.toUserId}`);
      socket.broadcast.to(`TI-${req.toUserId}`).emit('teamRequestToFriends', req);
    });
  });

  socket.on('answerTeamRequest', async (req: { accept: boolean; req: TeamRequest }) => {
    if (req.accept) {
      await prisma.team.update({
        where: { id: req.req.teamId },
        data: {
          teamRequests: { delete: { id: req.req.id } },
          neededRoles: { disconnect: { id: req.req.roleId } },
          chat: { update: { members: { connect: { id: req.req.toUserId } } } },
        },
      });
      const newMember = await prisma.memberShip.create({
        data: { roleId: req.req.roleId, toUserId: req.req.toUserId, teamId: req.req.teamId as number },
        include: {
          role: true,
          user: true,
          team: {
            include: {
              chat: { include: { members: true, messages: { include: { checked: true } }, team: true } },
              members: { include: { role: true, user: true } },
            },
          },
        },
      });
      socket.emit('answerTeamRequest', { req: newMember, accept: true });
      socket.broadcast.to(`TI-${newMember.toUserId}`).emit('answerTeamRequest', { req: newMember, accept: true });
    } else {
      await prisma.team.update({
        where: { id: req.req.teamId },
        data: {
          teamRequests: { delete: { id: req.req.id } },
          neededRoles: { connect: { id: req.req.roleId } },
        },
      });
      socket.emit('answerTeamRequest', req);

      socket.broadcast.to(`TI-${req.req.toUserId}`).emit('answerTeamRequest', req);
    }
  });

  socket.on('cancelTeamRequest', async (req: TeamRequest) => {
    const deletedReq = await prisma.teamRequest.delete({ where: { id: req.id }, include: { team: true, role: true } });

    socket.emit('cancelTeamRequest', deletedReq);
    if (deletedReq.isFromTeam) {
      socket.broadcast.to(`TI-${req.toUserId}`).emit('cancelTeamRequest', req);
    } else {
      socket.broadcast.to(`${req.team?.userId}`).emit('cancelTeamRequest', req);
    }
  });

  socket.on('leaveTeam', async ({ team, userId, byOwner }: { team: Team; userId: number; byOwner: boolean }) => {
    const membership = await prisma.memberShip.findFirst({ where: { teamId: team.id, toUserId: userId } });
    if (membership) {
      await prisma.team.update({
        where: { id: team.id },
        data: {
          members: {
            delete: {
              id: membership.id,
            },
          },
          neededRoles: {
            connect: {
              id: membership.roleId,
            },
          },
        },
      });

      await prisma.chat.update({
        where: { id: team.chat.id },
        data: {
          members: {
            disconnect: {
              id: userId,
            },
          },
        },
      });
      socket.emit('leaveTeam', { team, userId, byOwner });
      console.log('@@@@@@@@@@@@@@');
      if (byOwner) {
        socket.broadcast.to(`${userId}`).emit('leaveTeam', { team, userId: userId, byOwner });
      } else {
        socket.broadcast.to(`${team.userId}`).emit('leaveTeam', { team, userId: userId, byOwner });
      }
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
    const newMessage = chat.messages[0];
    const otherMembers = chat.members.filter((member) => member.id !== newMessage.userId);
    await prisma.message.create({
      data: {
        text: newMessage.text,
        time: newMessage.time,
        roomId: newMessage.roomId,
        userId: newMessage.userId,
        checked: {
          createMany: {
            data: otherMembers.map((member) => ({ isChecked: false, userId: member.id })),
          },
        },
      },
    });
    const newChat = await prisma.chat.findFirst({
      where: { roomId: chat.roomId },
      include: { messages: { include: { checked: true, user: true } }, members: true },
    });
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

    const newMessage = await prisma.message.create({
      data: {
        text: message.text,
        time: message.time,
        roomId: message.roomId,
        checked: {
          createMany: { data: message.checked.map((checked) => ({ isChecked: false, userId: checked.userId })) },
        },
        userId: message.userId,
      },
      include: {
        user: { select: { id: true, user_avatar: true, nickname: true } },
        checked: { include: { user: { select: { id: true, nickname: true } } } },
      },
    });
    io.in(message.roomId).emit('getMessage', newMessage);
  });

  socket.on('readMessage', async ({ message, userId }: { message: Message; userId: number }) => {
    console.log(message);
    const checkedId = message.checked.find((checked) => checked.userId === userId)?.id;
    const checkedMessage = await prisma.message.update({
      where: { id: message.id },
      data: { checked: { update: { where: { id: checkedId }, data: { isChecked: true } } } },
      include: {
        user: { select: { id: true, user_avatar: true, nickname: true } },
        checked: { include: { user: { select: { id: true, nickname: true } } } },
      },
    });
    socket.emit('readMessage', checkedMessage);
    socket.broadcast.to(message.roomId).emit('readMessage', checkedMessage);
  });

  socket.on('checkWholeChat', async ({ messages, userId, userIds }: { messages: Message[]; userId: number; userIds: number[] }) => {
    const roomId = messages[0].roomId;

    const allCheckedMessages = messages.map((message) => message.checked).flat();

    await prisma.checkedBy.updateMany({
      where: { id: { in: allCheckedMessages.map((checkedMessage) => checkedMessage.id as number) }, AND: { userId } },
      data: { isChecked: true },
    });

    const checkedMessages = await prisma.message.findMany({
      where: { roomId: roomId, userId: { in: userIds } },
      include: {
        user: { select: { id: true, user_avatar: true, nickname: true } },
        checked: { include: { user: { select: { id: true, nickname: true } } } },
      },
    });
    socket.emit('checkWholeChat', checkedMessages);
    socket.broadcast.to(roomId).emit('checkWholeChat', checkedMessages);
  });

  socket.on('friendRequest', async ({ fromUserId, toUserId }) => {
    try {
      const friendRequest = await prisma.friendRequest.create({
        data: {
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
  socket.on('disconnect', () => {
    console.log('Клиент отключился');
  });

  socket.on('leaveAllRooms', function () {
    for (var room in socket.rooms) {
      socket.leave(room);
    }
    console.log('Вышел');
  });

  io.on('disconnect', () => {
    console.log('Disconnect');
  });
});

console.log('working');
