import { EventEmitter } from '../utils/EventEmitter';
import { logger } from '../utils/logger';

interface NetworkStatus {
  network: string;
  isConnected: boolean;
  blockHeight: number;
  latency: number;
}

export class NetworkMonitor extends EventEmitter {
  private isRunning: boolean = false;
  private readonly networks: string[];
  private readonly checkInterval: number;
  private networkStatus: Map<string, NetworkStatus> = new Map();

  constructor(config: {
    networks: string[];
    checkInterval: number;
  }) {
    super();
    this.networks = config.networks;
    this.checkInterval = config.checkInterval;
  }

  async start(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;

    while (this.isRunning) {
      try {
        await this.checkNetworks();
        await new Promise(resolve => setTimeout(resolve, this.checkInterval));
      } catch (error) {
        logger.error('Error monitoring networks:', error);
      }
    }
  }

  stop(): void {
    this.isRunning = false;
  }

  private async checkNetworks(): Promise<void> {
    for (const network of this.networks) {
      try {
        const startTime = Date.now();
        const status = await this.checkNetworkStatus(network);
        const latency = Date.now() - startTime;

        const newStatus: NetworkStatus = {
          network,
          isConnected: status.isConnected,
          blockHeight: status.blockHeight,
          latency
        };

        const previousStatus = this.networkStatus.get(network);
        this.networkStatus.set(network, newStatus);

        if (this.hasStatusChanged(previousStatus, newStatus)) {
          this.emit('networkStatusChanged', newStatus);
        }
      } catch (error) {
        logger.error(`Error checking ${network} status:`, error);
      }
    }
  }

  private async checkNetworkStatus(network: string): Promise<{
    isConnected: boolean;
    blockHeight: number;
  }> {
    // Implementation will vary based on the network
    // This is a placeholder that should be implemented per network
    return {
      isConnected: true,
      blockHeight: 0
    };
  }

  private hasStatusChanged(
    previous: NetworkStatus | undefined,
    current: NetworkStatus
  ): boolean {
    if (!previous) return true;
    return (
      previous.isConnected !== current.isConnected ||
      previous.blockHeight !== current.blockHeight
    );
  }

  getNetworkStatus(network: string): NetworkStatus | undefined {
    return this.networkStatus.get(network);
  }

  getAllNetworkStatus(): NetworkStatus[] {
    return Array.from(this.networkStatus.values());
  }
}