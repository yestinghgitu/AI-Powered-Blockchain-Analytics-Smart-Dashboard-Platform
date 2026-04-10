const { io } = require('socket.io-client');

const socket = io('http://localhost:5000');

console.log('Connecting to Socket.io server...');

socket.on('connect', () => {
    console.log('Connected! ID:', socket.id);
});

socket.on('DATASET_PROCESSED', (data) => {
    console.log('RECEIVED: DATASET_PROCESSED', data);
});

socket.on('AI_FORECAST_READY', (data) => {
    console.log('RECEIVED: AI_FORECAST_READY', data.trend);
});

socket.on('AI_ANOMALIES_DETECTED', (data) => {
    console.log('RECEIVED: AI_ANOMALIES_DETECTED', data.anomalies.length);
});

socket.on('disconnect', () => {
    console.log('Disconnected');
});

// Exit after 20 seconds
setTimeout(() => {
    console.log('Test timeout reached. Exiting.');
    socket.disconnect();
    process.exit(0);
}, 20000);
