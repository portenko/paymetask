const net = require('net');
const server = net.createServer();
server.listen(8000);
server.on('connection', socket => {
  console.log('new client connected');
  socket.write('Test message for client');
  setTimeout(() => {
    socket.write('\n');
    socket.write('Test message for client after 5 sec');
  }, 5000);
});