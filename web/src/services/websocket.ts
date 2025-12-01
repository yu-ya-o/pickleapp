import { config } from '@/lib/config';
import type { Message, TeamMessage } from '@/types';

type MessageHandler = (message: Message | TeamMessage) => void;
type ConnectionHandler = () => void;

class WebSocketClient {
  private ws: WebSocket | null = null;
  private chatRoomId: string | null = null;
  private token: string | null = null;
  private messageHandlers: Set<MessageHandler> = new Set();
  private connectionHandlers: Set<ConnectionHandler> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(chatRoomId: string, token: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.disconnect();
    }

    this.chatRoomId = chatRoomId;
    this.token = token;

    try {
      this.ws = new WebSocket(config.websocketUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.joinRoom();
        this.connectionHandlers.forEach((handler) => handler());
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }

  private joinRoom() {
    if (this.ws?.readyState === WebSocket.OPEN && this.chatRoomId && this.token) {
      this.ws.send(
        JSON.stringify({
          type: 'join',
          chatRoomId: this.chatRoomId,
          token: this.token,
        })
      );
    }
  }

  private handleMessage(data: { type: string; data?: Message | TeamMessage }) {
    switch (data.type) {
      case 'message':
      case 'new_message':
        if (data.data) {
          this.messageHandlers.forEach((handler) => handler(data.data!));
        }
        break;
      case 'user_joined':
        console.log('User joined chat');
        break;
      case 'user_left':
        console.log('User left chat');
        break;
      case 'error':
        console.error('WebSocket error:', data);
        break;
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.chatRoomId && this.token) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      setTimeout(() => {
        if (this.chatRoomId && this.token) {
          this.connect(this.chatRoomId, this.token);
        }
      }, this.reconnectDelay * this.reconnectAttempts);
    }
  }

  sendMessage(content: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(
        JSON.stringify({
          type: 'message',
          content,
        })
      );
    } else {
      console.error('WebSocket is not connected');
    }
  }

  disconnect() {
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'leave' }));
      }
      this.ws.close();
      this.ws = null;
    }
    this.chatRoomId = null;
    this.token = null;
  }

  onMessage(handler: MessageHandler) {
    this.messageHandlers.add(handler);
    return () => {
      this.messageHandlers.delete(handler);
    };
  }

  onConnect(handler: ConnectionHandler) {
    this.connectionHandlers.add(handler);
    return () => {
      this.connectionHandlers.delete(handler);
    };
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }
}

export const wsClient = new WebSocketClient();
