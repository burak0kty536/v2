import { Connection, PublicKey, Keypair, clusterApiUrl } from '@solana/web3.js';
import { decode } from 'bs58';
import { logger } from '../utils/logger';

export class SolanaWalletService {
  private connection: Connection;
  private readonly defaultEndpoint = 'https://api.mainnet-beta.solana.com';
  private readonly backupEndpoints = [
    'https://solana-api.projectserum.com',
    clusterApiUrl('mainnet-beta'),
    'https://rpc.ankr.com/solana'
  ];
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 3;

  constructor(rpcUrl?: string) {
    this.connection = this.createConnection(rpcUrl || this.defaultEndpoint);
    this.setupConnectionMonitoring();
  }

  private createConnection(endpoint: string): Connection {
    return new Connection(endpoint, {
      commitment: 'confirmed',
      wsEndpoint: endpoint.replace('https://', 'wss://'),
      confirmTransactionInitialTimeout: 60000
    });
  }

  private setupConnectionMonitoring() {
    setInterval(async () => {
      try {
        await this.validateConnection();
      } catch (error) {
        await this.handleConnectionError();
      }
    }, 30000); // Check every 30 seconds
  }

  private async handleConnectionError() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      logger.error('Max reconnection attempts reached for Solana');
      return;
    }

    this.reconnectAttempts++;
    for (const endpoint of this.backupEndpoints) {
      try {
        const newConnection = this.createConnection(endpoint);
        await newConnection.getVersion();
        this.connection = newConnection;
        logger.info('Switched to backup Solana endpoint:', endpoint);
        this.reconnectAttempts = 0;
        return;
      } catch (error) {
        logger.error('Failed to connect to backup Solana endpoint:', error);
      }
    }
  }

  async connectWallet(privateKey: string): Promise<{
    address: string;
    balance: string;
    keypair: Keypair;
  }> {
    try {
      if (!await this.validateConnection()) {
        throw new Error('Solana connection is not available');
      }

      if (!this.validatePrivateKey(privateKey)) {
        throw new Error('Invalid Solana private key format');
      }

      const decodedKey = decode(privateKey);
      const keypair = Keypair.fromSecretKey(decodedKey);
      const publicKey = keypair.publicKey;

      const balance = await this.connection.getBalance(publicKey);
      if (balance === undefined || balance === null) {
        throw new Error('Failed to retrieve balance');
      }

      return {
        address: publicKey.toString(),
        balance: (balance / 1e9).toString(),
        keypair
      };
    } catch (error) {
      logger.error('Solana wallet connection error:', error);
      throw new Error(`Failed to connect Solana wallet: ${error.message}`);
    }
  }

  validatePrivateKey(privateKey: string): boolean {
    try {
      if (!privateKey?.trim()) return false;
      const decoded = decode(privateKey);
      if (decoded.length !== 64) {
        throw new Error('Invalid private key length');
      }
      // Verify we can create a valid keypair
      Keypair.fromSecretKey(decoded);
      return true;
    } catch {
      return false;
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      if (!await this.validateConnection()) {
        throw new Error('Solana connection is not available');
      }

      const publicKey = new PublicKey(address);
      const balance = await this.connection.getBalance(publicKey);
      return (balance / 1e9).toString();
    } catch (error) {
      logger.error('Failed to get Solana balance:', error);
      throw error;
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const version = await this.connection.getVersion();
      return !!version;
    } catch (error) {
      logger.error('Solana connection validation failed:', error);
      return false;
    }
  }

  getConnection(): Connection {
    return this.connection;
  }
}