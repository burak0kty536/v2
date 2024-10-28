import { Keypair, PublicKey, Transaction, SendOptions } from '@solana/web3.js';
import { decode } from 'bs58';
import { SolanaConnection } from './SolanaConnection';
import { logger } from '../logger';

export class SolanaWallet {
  private keypair: Keypair;
  private connection: SolanaConnection;
  private balanceCache: { value: string; timestamp: number } | null = null;
  private readonly balanceCacheDuration = 10000; // 10 seconds

  constructor(privateKey: string) {
    this.validatePrivateKey(privateKey);
    const secretKey = decode(privateKey);
    this.keypair = Keypair.fromSecretKey(secretKey);
    this.connection = SolanaConnection.getInstance();
  }

  private validatePrivateKey(privateKey: string): void {
    if (!privateKey?.trim()) {
      throw new Error('Private key cannot be empty');
    }

    if (!privateKey.match(/^[1-9A-HJ-NP-Za-km-z]{87,88}$/)) {
      throw new Error('Invalid private key format');
    }

    try {
      const secretKey = decode(privateKey);
      if (secretKey.length !== 64) {
        throw new Error('Invalid private key length');
      }
      
      // Verify keypair creation
      Keypair.fromSecretKey(secretKey);
    } catch (error) {
      throw new Error('Invalid private key');
    }
  }

  async getBalance(): Promise<string> {
    try {
      // Check cache
      if (this.balanceCache && Date.now() - this.balanceCache.timestamp < this.balanceCacheDuration) {
        return this.balanceCache.value;
      }

      const conn = await this.connection.getConnection();
      let balance: number | null = null;
      let error: Error | null = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          balance = await conn.getBalance(this.keypair.publicKey, 'confirmed');
          break;
        } catch (err) {
          error = err as Error;
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        }
      }

      if (balance === null) {
        throw error || new Error('Failed to get balance after retries');
      }

      const balanceStr = (balance / 1e9).toFixed(9);
      this.balanceCache = { value: balanceStr, timestamp: Date.now() };
      return balanceStr;
    } catch (error) {
      logger.error('Failed to get Solana wallet balance:', error);
      throw new Error('Failed to get wallet balance');
    }
  }

  getPublicKey(): string {
    return this.keypair.publicKey.toString();
  }

  async signTransaction(transaction: Transaction): Promise<Transaction> {
    try {
      transaction.feePayer = this.keypair.publicKey;
      transaction.recentBlockhash = (
        await (await this.connection.getConnection()).getLatestBlockhash()
      ).blockhash;
      
      return transaction.sign(this.keypair);
    } catch (error) {
      logger.error('Failed to sign transaction:', error);
      throw new Error('Transaction signing failed');
    }
  }

  static async getAddressBalance(address: string): Promise<string> {
    if (!address?.trim()) {
      throw new Error('Address cannot be empty');
    }

    try {
      // Validate address format
      const pubKey = new PublicKey(address);
      
      const connection = await SolanaConnection.getInstance().getConnection();
      let balance: number | null = null;
      let error: Error | null = null;

      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          balance = await connection.getBalance(pubKey, 'confirmed');
          break;
        } catch (err) {
          error = err as Error;
          if (attempt < 2) {
            await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
          }
        }
      }

      if (balance === null) {
        throw error || new Error('Failed to get balance after retries');
      }

      return (balance / 1e9).toFixed(9);
    } catch (error) {
      logger.error('Failed to get Solana address balance:', error);
      throw new Error('Failed to get address balance');
    }
  }

  async validateAddress(address: string): Promise<boolean> {
    try {
      new PublicKey(address);
      return true;
    } catch {
      return false;
    }
  }
}