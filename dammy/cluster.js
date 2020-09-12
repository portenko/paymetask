const cluster = require('cluster');
const os = require('os');
const pid = process.pid;

if(cluster.isMaster){
    const cpusCount = os.cpus().length;
    console.log(`CPUs: ${cpusCount}`);
    for(let i = 0; i < cpusCount-1; i++){ // оставляем 1 ядро для мастера, все остальные ядра для воркеров
        const worker = cluster.fork();
        worker.on('exit', () => {
            console.log(`Worker stopped. PID: ${worker.process.pid}`);
            cluster.fork();
        });
        worker.send('Hi worker!');
        worker.on('message', (msg) => {
           console.log(`Message from worker: ${msg}. PID: ${worker.process.pid}`);
        });
    }
}
else // worker
{
    require('./worker.js');
    const proc = process;
    proc.on('message', (msg) => {
        console.log(`Message from master: ${msg}`);
        proc.send(`Message for server from worker PID: ${pid}`);
    });
}