const net = require('net');
let buffered = '';
const socket = net.createConnection({ port: 8000, host: 'localhost' });
socket.on('connect', () => {
  socket.on('data', data => {
    console.log(data.length);
    buffered += data;
    processReceived();
  });
});
function processReceived() {
  var received = buffered.split('\n');
  while (received.length > 1) {
    console.log(received[0]);
    buffered = received.slice(1).join('\n');
    received = buffered.split('\n');
  }
}