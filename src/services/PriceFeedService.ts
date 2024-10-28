import { EventEmitter } from '../utils/EventEmitter';
import { logger } from '../utils/logger';

interface PriceUpdate {
  token: string;
  network: string;
  price: number;
  timestamp: number;
}

export class PriceFeedService extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectInterval = 5000;
  private isConnected = false;

  constructor(
    private readonly wsUrl: string,
    private readonly apiKey: string
  ) {
    super();
  }

  async connect(): Promise<void> {
    if (this.isConnected) return;

    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.authenticate();
        logger.info('Connected to price feed');
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          logger.error('Error parsing price feed message:', error);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        logger.warn('Price feed connection closed');
        this.handleReconnect();
      };

      this.ws.onerror = (error) => {
        logger.error('Price feed websocket error:', error);
      };
    } catch (error) {
      logger.error('Failed to connect to price feed:', error);
      throw error;
    }
  }

  private authenticate(): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const authMessage = {
      type: 'auth',
      apiKey: this.apiKey
    };

    this.ws.send(JSON.stringify(authMessage));
  }

  private handleMessage(data: any): void {
    if (data.type === 'price') {
      const update: PriceUpdate = {
        token: data.token,
        network: data.network,
        price: data.price,
        timestamp: Date.now()
      };

      this.emit('priceUpdate', update);
    }
  }

  private handleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached');
      return;
    }

    this.reconnectAttempts++;
    setTimeout(() => {
      logger.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      this.connect();
    }, this.reconnectInterval * this.reconnectAttempts);
  }

  subscribe(token: string, network: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const subscribeMessage = {
      type: 'subscribe',
      token,
      network
    };

    this.ws.send(JSON.stringify(subscribeMessage));
  }

  unsubscribe(token: string, network: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const unsubscribeMessage = {
      type: 'unsubscribe',
      token,
      network
    };

    this.ws.send(JSON.stringify(unsubscribeMessage));
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.isConnected = false;
  }

  isConnectedToPriceFeed(): boolean {
    return this.isConnected;
  }
}