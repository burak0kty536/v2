import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { logger } from '../utils/logger';

export class WebSocketManager extends EventEmitter {
  private connections: Map<string, WebSocket> = new Map();
  private reconnectAttempts: Map<string, number> = new Map();
  private readonly maxReconnectAttempts = 5;

  constructor(private readonly endpoints: { [key: string]: string }) {
    super();
  }

  connect(network: string): void {
    if (!this.endpoints[network]) {
      throw new Error(`No WebSocket endpoint configured for network: ${network}`);
    }

    const ws = new WebSocket(this.endpoints[network]);
    
    ws.on('open', () => {
      logger.info(`WebSocket connected for ${network}`);
      this.reconnectAttempts.set(network, 0);
      this.emit('connected', network);
    });

    ws.on('message', (data: WebSocket.Data) => {
      try {
        const parsedData = JSON.parse(data.toString());
        this.emit('message', { network, data: parsedData });
      } catch (error) {
        logger.error('WebSocket message parse error:', error);
      }
    });

    ws.on('close', () => {
      logger.warn(`WebSocket disconnected for ${network}`);
      this.handleReconnect(network);
    });

    ws.on('error', (error) => {
      logger.error(`WebSocket error for ${network}:`, error);
    });

    this.connections.set(network, ws);
  }

  private handleReconnect(network: string): void {
    const attempts = this.reconnectAttempts.get(network) || 0;
    
    if (attempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        logger.info(`Attempting to reconnect to ${network} (${attempts + 1}/${this.maxReconnectAttempts})`);
        this.reconnectAttempts.set(network, attempts + 1);
        this.connect(network);
      }, Math.min(1000 * Math.pow(2, attempts), 30000));
    } else {
      logger.error(`Max reconnection attempts reached for ${network}`);
      this.emit('max-reconnect-attempts', network);
    }
  }

  subscribe(network: string, channel: string, params: any = {}): void {
    const ws = this.connections.get(network);
    if (!ws) return;

    const message = {
      type: 'subscribe',
      channel,
      ...params
    };

    ws.send(JSON.stringify(message));
  }

  unsubscribe(network: string, channel: string): void {
    const ws = this.connections.get(network);
    if (!ws) return;

    const message = {
      type: 'unsubscribe',
      channel
    };

    ws.send(JSON.stringify(message));
  }

  disconnect(network: string): void {
    const ws = this.connections.get(network);
    if (ws) {
      ws.close();
      this.connections.delete(network);
      this.reconnectAttempts.delete(network);
    }
  }

  disconnectAll(): void {
    for (const network of this.connections.keys()) {
      this.disconnect(network);
    }
  }
}