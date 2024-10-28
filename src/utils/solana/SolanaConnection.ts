import { Connection, clusterApiUrl, Commitment } from '@solana/web3.js';
import { logger } from '../logger';

export class SolanaConnection {
  private static instance: SolanaConnection;
  private connection: Connection | null = null;
  private lastHealthCheck: number = 0;
  private readonly healthCheckInterval = 30000;
  private isInitializing = false;
  private connectionPromise: Promise<Connection> | null = null;
  private currentEndpointIndex = 0;
  private retryCount = 0;
  private readonly maxRetries = 3;
  private readonly retryDelay = 1000;

  private readonly endpoints = [
    'https://api.mainnet-beta.solana.com',
    'https://solana-api.projectserum.com',
    'https://rpc.ankr.com/solana',
    clusterApiUrl('mainnet-beta')
  ];

  private readonly config = {
    commitment: 'confirmed' as Commitment,
    confirmTransactionInitialTimeout: 60000,
    disableRetryOnRateLimit: false
  };

  private constructor() {}

  static getInstance(): SolanaConnection {
    if (!SolanaConnection.instance) {
      SolanaConnection.instance = new SolanaConnection();
    }
    return SolanaConnection.instance;
  }

  async getConnection(): Promise<Connection> {
    try {
      if (this.connectionPromise) {
        return await this.connectionPromise;
      }

      if (this.connection && await this.isConnectionHealthy()) {
        return this.connection;
      }

      if (this.isInitializing) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return this.getConnection();
      }

      this.isInitializing = true;
      this.connectionPromise = this.establishConnection();

      try {
        const connection = await this.connectionPromise;
        this.connection = connection;
        return connection;
      } finally {
        this.isInitializing = false;
        this.connectionPromise = null;
      }
    } catch (error) {
      logger.error('Failed to get Solana connection:', error);
      throw new Error('Unable to establish Solana connection');
    }
  }

  private async establishConnection(): Promise<Connection> {
    let lastError: Error | null = null;

    for (let retry = 0; retry <= this.maxRetries; retry++) {
      for (let i = 0; i < this.endpoints.length; i++) {
        const endpoint = this.endpoints[(this.currentEndpointIndex + i) % this.endpoints.length];
        
        try {
          const connection = new Connection(endpoint, this.config);
          
          // Verify connection with multiple checks
          const [version, slot, health] = await Promise.all([
            connection.getVersion().catch(() => null),
            connection.getSlot().catch(() => null),
            connection.getHealth().catch(() => null)
          ]);

          if (version && slot && health === 'ok') {
            logger.info(`Connected to Solana endpoint: ${endpoint}`);
            this.currentEndpointIndex = (this.currentEndpointIndex + i) % this.endpoints.length;
            this.retryCount = 0;
            this.lastHealthCheck = Date.now();
            return connection;
          }
        } catch (error) {
          lastError = error as Error;
          logger.warn(`Failed to connect to Solana endpoint ${endpoint}:`, error);
          continue;
        }
      }

      if (retry < this.maxRetries) {
        const delay = this.retryDelay * Math.pow(2, retry);
        logger.info(`Retrying Solana connection in ${delay}ms (attempt ${retry + 1}/${this.maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Failed to establish connection to any Solana endpoint');
  }

  private async isConnectionHealthy(): Promise<boolean> {
    if (!this.connection || Date.now() - this.lastHealthCheck > this.healthCheckInterval) {
      try {
        const [version, slot, health] = await Promise.all([
          this.connection?.getVersion().catch(() => null),
          this.connection?.getSlot().catch(() => null),
          this.connection?.getHealth().catch(() => null)
        ]);

        const isHealthy = Boolean(version && slot && health === 'ok');
        if (isHealthy) {
          this.lastHealthCheck = Date.now();
        }
        return isHealthy;
      } catch {
        return false;
      }
    }
    return true;
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      try {
        // Close any active subscriptions
        const subscriptionIds = await this.connection.getSlotSubscriptions();
        for (const id of subscriptionIds) {
          await this.connection.removeSlotSubscription(id);
        }
      } catch (error) {
        logger.warn('Error cleaning up Solana connection:', error);
      } finally {
        this.connection = null;
        this.lastHealthCheck = 0;
        this.isInitializing = false;
        this.connectionPromise = null;
      }
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const connection = await this.getConnection();
      const [version, slot, health] = await Promise.all([
        connection.getVersion().catch(() => null),
        connection.getSlot().catch(() => null),
        connection.getHealth().catch(() => null)
      ]);

      return Boolean(version && slot && health === 'ok');
    } catch (error) {
      logger.error('Solana connection validation failed:', error);
      return false;
    }
  }
}