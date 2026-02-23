const net = require('net');

const socket = new net.Socket();
socket.setTimeout(5000);

socket.connect(5432, '127.0.0.1', () => {
  console.log('Connected to port 5432');
  socket.destroy();
});

socket.on('error', (err) => {
  console.error('Connection error:', err.message);
});

socket.on('timeout', () => {
  console.error('Connection timed out');
  socket.destroy();
});
