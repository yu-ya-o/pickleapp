#!/usr/bin/env node
import { startWebSocketServer } from './websocket';

const WEBSOCKET_PORT = parseInt(process.env.WEBSOCKET_PORT || '3002');

console.log('Starting PickleHub WebSocket server...');
startWebSocketServer(WEBSOCKET_PORT);
