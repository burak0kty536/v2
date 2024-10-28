import { NetworkType } from '../types/NetworkTypes';
import { logger } from '../utils/logger';

interface PriceUpdate {
  token: string;
  price: number;
  timestamp: number;
  volume24h: number;
  liquidity: number;
  priceChange24h: number;
}

export class PriceService {
  private prices: Map<string, PriceUpdate> = new Map();
  private subscribers: Map<string, Set<(update: PriceUpdate) => void>> = new Map();
  private wsConnections: Map<NetworkType, WebSocket> = new Map();

  constructor(private readonly config: {
    wsEndpoints: { [key in NetworkType]: string };
    apiKey: string;
    updateInterval: number;
  }) {
    this.initializeWebSockets();
  }

  private initializeWebSockets() {
    Object.entries(this.config.wsEndpoints).forEach(([network, endpoint]) => {
      try {
        const ws = new WebSocket(endpoint);
        
        ws.onopen = () => {
          logger.info(`WebSocket connected for ${network}`);
          this.authenticate(ws);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handlePriceUpdate(network as NetworkType, data);
          } catch (error) {
            logger.error(`Failed to parse WebSocket message for ${network}:`, error);
          }
        };

        ws.onerror = (error) => {
          logger.error(`WebSocket error for ${network}:`, error);
        };

        ws.onclose = () => {
          logger.warn(`WebSocket closed for ${network}, attempting to reconnect...`);
          setTimeout(() => this.initializeWebSockets(), 5000);
        };

        this.wsConnections.set(network as NetworkType, ws);
      } catch (error) {
        logger.error(`Failed to initialize WebSocket for ${network}:`, error);
      }
    });
  }

  private authenticate(ws: WebSocket) {
    ws.send(JSON.stringify({
      type: 'auth',
      apiKey: this.config.apiKey
    }));
  }

  private handlePriceUpdate(network: NetworkType, data: any) {
    if (data.type === 'price') {
      const update: PriceUpdate = {
        token: data.token,
        price: data.price,
        timestamp: Date.now(),
        volume24h: data.volume24h,
        liquidity: data.liquidity,
        priceChange24h: data.priceChange24h
      };

      const key = `${network}:${data.token}`;
      this.prices.set(key, update);

      // Notify subscribers
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.forEach(callback => callback(update));
      }
    }
  }

  subscribe(
    network: NetworkType,
    token: string,
    callback: (update: PriceUpdate) => void
  ): () => void {
    const key = `${network}:${token}`;
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, new Set());
    }
    this.subscribers.get(key)!.add(callback);

    // Subscribe to updates
    const ws = this.wsConnections.get(network);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'subscribe',
        token
      }));
    }

    // Return unsubscribe function
    return () => {
      const subscribers = this.subscribers.get(key);
      if (subscribers) {
        subscribers.delete(callback);
        if (subscribers.size === 0) {
          this.subscribers.delete(key);
          // Unsubscribe from updates
          const ws = this.wsConnections.get(network);
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
              type: 'unsubscribe',
              token
            }));
          }
        }
      }
    };
  }

  getPrice(network: NetworkType, token: string): PriceUpdate | undefined {
    return this.prices.get(`${network}:${token}`);
  }

  disconnect() {
    this.wsConnections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    });
    this.wsConnections.clear();
    this.subscribers.clear();
  }
}