const Net = require('net');
//const Http = require('http');
//const WebSocket = require('ws');
//const {fork} = require('child_process');
const cluster = require('cluster');

interface TransportOptions
{
    permanent?: boolean;
    port?: number;
    host?: string;
}

class Transport
{
    isPermanentConnection:boolean = false;
    port:number;
    host:string;

    constructor(options: TransportOptions)
    {
        this.isPermanentConnection = !!options.permanent;
        this.port = options.port || '3000';
        this.host = options.host || 'localhost';
    }
}

interface ServiceOptions
{
    transport: object;
    cluster?: object;
}

class Service
{
    isMaster: boolean = false;
    transport: Transport;
    isClusterMode: boolean;
    clusterOptions: object;

    constructor(options: ServiceOptions)
    {
        this.transport = options.transport;
        this.isClusterMode = !!options.cluster;
        if (this.isClusterMode) {
            this.clusterOptions = options.cluster;
        }
    }

    async start()
    {
        if (this.isClusterMode) {
            //if (this.isMaster) {
            if (cluster.isMaster) {
                await this.startCluster();
                if (this.transport.isPermanentConnection) {
                    await this.startTransport();
                }
            } else {
                await this.startWorker();
                if (!this.transport.isPermanentConnection) {
                    await this.startTransport();
                }
            }
        } else {
            await this.startWorker();
            await this.startTransport();
        }
    }

    async startTransport()
    {
        const instance = new Net.createConnection({
            port: this.transport.port,
            host: this.transport.host,
        });
        instance.on('connect', () => {
            console.log('Transport sent message to the server.');
            instance.write('Transport message.');
        });
        instance.on('data', (data) => {
            console.log('Transport received message from the server: ', data.toString());
            instance.end();
        });
        instance.on('end', () => {
            console.log('Transport disconnected.');
        });
    }

    async startWorker()
    {
        const server = Net.createServer((socket) => {
            socket.on('data', (data) => {
              console.log('Worker received message from the client: ', data.toString());
            });
        });
        server.on('connection', socket => {
            console.log('Transport connected to the server.');
            socket.write('Worker message');
            console.log('Worker sent message to the client.');
        });
        server.on('end', () => {
            console.log('Worker: Server closed connection.');
        });
        server.on('error', (err) => {
            console.log("Worker: Server connection error: " + err);
        });
        console.log(`Worker started. Pid: ${process.pid}`);
        const port = process.env.PORT || 3000;
        server.listen({port:port, hostname: 'localhost'});
    }

    async startCluster()
    {
        for(let i = 0; i < this.clusterOptions.workers; i++){
            await this.clusterFork(require.main.filename);
        }
    }

    async clusterFork(modulePath)
    {
        // const forked = fork(modulePath);
        // forked.on('exit', () => {
        //     console.log(`Worker stopped working. PID: ${forked.pid}`);
        //     //this.forkCluster(modulePath); // recreate worker
        // });
        const worker = cluster.fork(modulePath);
        worker.on('exit', () => {
            console.log(`Worker stopped. Pid: ${worker.process.pid}`);
            this.clusterFork(modulePath); // recreate worker
        });
    }
}

module.exports = {Transport: Transport, Service: Service };