const {Service, Transport } = require('./service');

let options = {};
const workers = 4;

// node app.js single
// node app.js stable
// node app.js unstable

switch (process.argv[2]) {
    case 'unstable':
        console.log('Clustering (transport is not permanent)');
        options = {
            transport: new Transport({permanent:false}),
            cluster: {'workers': workers}
        };
        break;
    case 'stable':
        console.log('Clustering (transport is permanent)');
        options = {
            transport: new Transport({permanent:true}),
            cluster: {'workers': workers}
        };
        break;
    default:
        console.log('Single process');
        options = {
            transport: new Transport({}),
        };
        break;
}

new Service(options)
    .start()
    .then(r => {
        //console.log(r);
    }
);






