import { WebSocketManager } from './WebSocketManager';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

export class NetworkEventHandler extends EventEmitter {
  private readonly wsManager: WebSocketManager;

  constructor(endpoints: { [key: string]: string }) {
    super();
    this.wsManager = new WebSocketManager(endpoints);
  }

  async initializeNetwork(network: string): Promise<void> {
    try {
      this.wsManager.connect(network);
      
      this.wsManager.on('message', ({ network: net, data }) => {
        if (net === network) {
          this.handleNetworkMessage(network, data);
        }
      });

      this.wsManager.on('connected', (net) => {
        if (net === network) {
          logger.info(`Connected to ${network} websocket`);
          this.subscribeToEvents(network);
        }
      });
    } catch (error) {
      logger.error(`Failed to initialize ${network} websocket:`, error);
      throw error;
    }
  }

  private handleNetworkMessage(network: string, data: any): void {
    try {
      switch (data.type) {
        case 'newBlock':
          this.emit('newBlock', { network, ...data });
          break;
        case 'price':
          this.emit('priceUpdate', { network, ...data });
          break;
        case 'trade':
          this.emit('trade', { network, ...data });
          break;
        case 'liquidity':
          this.emit('liquidityUpdate', { network, ...data });
          break;
        default:
          logger.debug(`Unknown message type from ${network}:`, data);
      }
    } catch (error) {
      logger.error(`Error handling ${network} message:`, error);
    }
  }

  private subscribeToEvents(network: string): void {
    // Subscribe to relevant events based on network
    const channels = ['newBlocks', 'trades', 'liquidityUpdates'];
    
    channels.forEach(channel => {
      this.wsManager.subscribe(network, channel);
      logger.debug(`Subscribed to ${channel} on ${network}`);
    });
  }

  public disconnect(network: string): void {
    this.wsManager.disconnect(network);
  }

  public disconnectAll(): void {
    this.wsManager.disconnectAll();
  }
}