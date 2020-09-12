const http = require('http');
const pid = process.pid;

const hostname = '127.0.0.1';
const port = 3000;

const worker = http.createServer((req, res) =>
{
  res.end('Hi man');
});

worker.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/ with PID:${pid}`);
});