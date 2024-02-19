const dgram = require('dgram');

const serverURLs = ['pfmsqosprod2-0.centralus.cloudapp.azure.com'
, 'pfmsqosprod2-0.brazilsouth.cloudapp.azure.com'
, 'pfmsqosprod2-0.westus.cloudapp.azure.com'];

const port = 3075;
const message = Buffer.from([0xFF, 0xFF]); // Message content must start with 0xFFFF

function pingServer(serverUrl) {
    return new Promise((resolve, reject) => {
        const client = dgram.createSocket('udp4');

        client.on('error', (err) => {
            client.close();
            reject(err);
        });

        client.on('message', (msg) => {
            client.close();
            const responseTime = process.hrtime.bigint() - startTime;
            resolve(Number(responseTime) / 1000000); // Convert nanoseconds to milliseconds
        });

        const startTime = process.hrtime.bigint();
        client.send(message, port, serverUrl, (err) => {
            if (err) {
                client.close();
                reject(err);
            }
        });
    });
}

async function measureLatency() {
    for (const serverUrl of serverURLs) {
        try {
            const latency = await pingServer(serverUrl);
            console.log(`Response time from ${serverUrl}: ${latency} milliseconds`);
        } catch (error) {
            console.error(`Error while pinging ${serverUrl}: ${error}`);
        }
    }
}

// Measure latency for all servers in the list
measureLatency();
