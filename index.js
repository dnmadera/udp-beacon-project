const dgram = require('dgram');

// Function to send UDP datagram to QoS server and measure response time
function sendUDPDatagram(serverUrl, numInvocations) {
    const client = dgram.createSocket('udp4');
    const message = Buffer.from('FFFF', 'hex'); // Message content (0xFFFF)
    let totalResponseTime = 0;

    for (let i = 0; i < numInvocations; i++) {
        const startTime = process.hrtime(); // Start time of sending the message

        client.send(message, 0, message.length, 3075, serverUrl, (err) => {
            if (err) {
                console.error('Error sending UDP datagram:', err);
                client.close();
            }
        });

        // Handling server response
        client.on('message', () => {
            const endTime = process.hrtime(startTime); // Elapsed time from start to receiving response
            const elapsedTime = endTime[0] * 1000 + endTime[1] / 1000000; // Convert time to milliseconds
            totalResponseTime += elapsedTime;

            if (i === numInvocations - 1) {
                const averageResponseTime = totalResponseTime / numInvocations;
                console.log(`Average response time for ${serverUrl}:`, averageResponseTime.toFixed(2), 'milliseconds');
                client.close(); // Close socket after receiving response
            }
        });
    }
}

// Parameters
const numInvocations = 5; // Number of invocations to calculate average response time

// Call function to send UDP datagram
sendUDPDatagram('pfmsqosprod2-0.centralus.cloudapp.azure.com', numInvocations);
sendUDPDatagram('pfmsqosprod2-0.brazilsouth.cloudapp.azure.com', numInvocations);
sendUDPDatagram('pfmsqosprod2-0.westus.cloudapp.azure.com', numInvocations);
