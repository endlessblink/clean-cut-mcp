"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = setupWebSocket;
exports.broadcastMessage = broadcastMessage;
const ws_1 = require("ws");
function setupWebSocket(wss) {
    wss.on('connection', (ws) => {
        console.log('WebSocket client connected');
        // Send welcome message
        ws.send(JSON.stringify({
            type: 'connection',
            message: 'Connected to Clean Cut WebSocket server'
        }));
        // Handle incoming messages
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data.toString());
                handleMessage(ws, message);
            }
            catch (error) {
                console.error('Invalid WebSocket message:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    message: 'Invalid message format'
                }));
            }
        });
        // Handle disconnection
        ws.on('close', () => {
            console.log('WebSocket client disconnected');
        });
        // Handle errors
        ws.on('error', (error) => {
            console.error('WebSocket error:', error);
        });
    });
    // Periodic status updates
    setInterval(() => {
        const status = {
            type: 'status',
            timestamp: new Date().toISOString(),
            server: 'Clean Cut API',
            version: '1.0.0'
        };
        wss.clients.forEach((client) => {
            if (client.readyState === ws_1.WebSocket.OPEN) {
                client.send(JSON.stringify(status));
            }
        });
    }, 30000); // Every 30 seconds
}
function handleMessage(ws, message) {
    switch (message.type) {
        case 'ping':
            ws.send(JSON.stringify({
                type: 'pong',
                timestamp: new Date().toISOString()
            }));
            break;
        case 'subscribe':
            // Handle subscription to specific events
            ws.send(JSON.stringify({
                type: 'subscribed',
                channel: message.channel,
                message: `Subscribed to ${message.channel} updates`
            }));
            break;
        default:
            ws.send(JSON.stringify({
                type: 'error',
                message: `Unknown message type: ${message.type}`
            }));
    }
}
// Utility function to broadcast messages to all connected clients
function broadcastMessage(wss, message) {
    const data = JSON.stringify(message);
    wss.clients.forEach((client) => {
        if (client.readyState === ws_1.WebSocket.OPEN) {
            client.send(data);
        }
    });
}
