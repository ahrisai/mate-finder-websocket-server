import { Server } from 'socket.io';

const io = new Server(8080, {
  cors: {
    credentials: true,
    origin: 'http://localhost:5173',
  },
});

io.on('connection', (socket) => {
  console.log('Client connected');

  socket.on('message', (message) => {
    console.log(message);
    socket.send('response', { privet: 'privet' });
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

console.log('Socket.IO server is running on port 8080');
