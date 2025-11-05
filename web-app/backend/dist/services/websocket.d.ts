import { WebSocketServer } from 'ws';
export declare function setupWebSocket(wss: WebSocketServer): void;
export declare function broadcastMessage(wss: WebSocketServer, message: any): void;
