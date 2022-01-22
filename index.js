const cluster = require('cluster');
const express = require('express');
const {port} = require('./config');
const totalCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    console.log(`Number of CPUs is ${totalCPUs}`);
    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < totalCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker) => {
        console.log(`worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    const app = express();
    app.use(require('./routes'));
    app.listen(port, () => {
        console.log(`Walkme app listening at http://localhost:${port}`)
    });
}
