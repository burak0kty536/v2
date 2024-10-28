import { Connection, PublicKey, Keypair, clusterApiUrl } from '@solana/web3.js';
import { decode } from 'bs58';
import { logger } from './logger';

const SOLANA_ENDPOINTS = [
  'https://api.mainnet-beta.solana.com',
  'https://solana-api.projectserum.com',
  clusterApiUrl('mainnet-beta')
];

class SolanaConnectionManager {
  private static instance: SolanaConnectionManager;
  private connections: Map<string, Connection> = new Map();
  private currentEndpointIndex = 0;

  private constructor() {}

  static getInstance(): SolanaConnectionManager {
    if (!SolanaConnectionManager.instance) {
      SolanaConnectionManager.instance = new SolanaConnectionManager();
    }
    return SolanaConnectionManager.instance;
  }

  async getConnection(): Promise<Connection> {
    const endpoint = SOLANA_ENDPOINTS[this.currentEndpointIndex];
    
    if (!this.connections.has(endpoint)) {
      const connection = new Connection(endpoint, 'confirmed');
      this.connections.set(endpoint, connection);
    }

    try {
      const connection = this.connections.get(endpoint)!;
      // Test connection
      await connection.getSlot();
      return connection;
    } catch (error) {
      logger.warn(`Connection failed for endpoint ${endpoint}, trying next...`);
      this.currentEndpointIndex = (this.currentEndpointIndex + 1) % SOLANA_ENDPOINTS.length;
      this.connections.delete(endpoint);
      return this.getConnection();
    }
  }
}

export const validateSolanaPrivateKey = (privateKey: string): boolean => {
  try {
    if (!privateKey?.trim()) return false;
    if (!privateKey.match(/^[1-9A-HJ-NP-Za-km-z]{87,88}$/)) return false;

    const decoded = decode(privateKey);
    if (decoded.length !== 64) return false;

    // Verify keypair creation
    Keypair.fromSecretKey(decoded);
    return true;
  } catch (error) {
    return false;
  }
};

export const connectSolanaWallet = async (privateKey: string) => {
  try {
    if (!validateSolanaPrivateKey(privateKey)) {
      throw new Error('Invalid Solana private key format');
    }

    const connection = await SolanaConnectionManager.getInstance().getConnection();
    const secretKey = decode(privateKey);
    const keypair = Keypair.fromSecretKey(secretKey);

    // Verify connection and get balance with retries
    let balance = 0;
    let retries = 3;
    
    while (retries > 0) {
      try {
        balance = await connection.getBalance(keypair.publicKey);
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return {
      address: keypair.publicKey.toString(),
      balance: (balance / 1e9).toString(),
      keypair,
      connection
    };
  } catch (error) {
    logger.error('Solana wallet connection error:', error);
    throw new Error(`Failed to connect Solana wallet: ${error.message}`);
  }
};

export const getSolanaBalance = async (publicKey: string): Promise<string> => {
  try {
    const connection = await SolanaConnectionManager.getInstance().getConnection();
    const pubKey = new PublicKey(publicKey);

    // Get balance with retries
    let retries = 3;
    while (retries > 0) {
      try {
        const balance = await connection.getBalance(pubKey);
        return (balance / 1e9).toString();
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error('Failed to get balance after retries');
  } catch (error) {
    logger.error('Failed to get Solana balance:', error);
    throw error;
  }
};