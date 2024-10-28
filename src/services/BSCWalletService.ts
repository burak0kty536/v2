import { ethers } from 'ethers';
import { logger } from '../utils/logger';

export class BSCWalletService {
  private provider: ethers.JsonRpcProvider;
  private readonly defaultRpcUrl = 'https://bsc-dataseed1.binance.org';
  private readonly backupRpcUrls = [
    'https://bsc-dataseed2.binance.org',
    'https://bsc-dataseed3.binance.org',
    'https://bsc-dataseed4.binance.org'
  ];

  constructor(rpcUrl?: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl || this.defaultRpcUrl);
    this.setupProviderErrorHandling();
  }

  private setupProviderErrorHandling() {
    this.provider.on('error', async (error) => {
      logger.error('BSC provider error:', error);
      await this.switchToBackupProvider();
    });
  }

  private async switchToBackupProvider() {
    for (const url of this.backupRpcUrls) {
      try {
        const newProvider = new ethers.JsonRpcProvider(url);
        await newProvider.getNetwork();
        this.provider = newProvider;
        logger.info('Switched to backup BSC provider:', url);
        return;
      } catch (error) {
        logger.error('Failed to connect to backup BSC provider:', error);
      }
    }
  }

  async connectWallet(privateKey: string): Promise<{
    address: string;
    balance: string;
    wallet: ethers.Wallet;
  }> {
    try {
      if (!this.validatePrivateKey(privateKey)) {
        throw new Error('Invalid BSC private key format');
      }

      const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
      const wallet = new ethers.Wallet(formattedKey, this.provider);
      const address = await wallet.getAddress();
      const balance = await this.provider.getBalance(address);

      return {
        address,
        balance: ethers.formatEther(balance),
        wallet
      };
    } catch (error) {
      logger.error('BSC wallet connection error:', error);
      throw new Error(`Failed to connect BSC wallet: ${error.message}`);
    }
  }

  validatePrivateKey(privateKey: string): boolean {
    try {
      if (!privateKey?.trim()) return false;
      const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
      return /^[0-9a-fA-F]{64}$/.test(cleanKey);
    } catch {
      return false;
    }
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.provider.getBalance(address);
      return ethers.formatEther(balance);
    } catch (error) {
      logger.error('Failed to get BSC balance:', error);
      await this.switchToBackupProvider();
      throw error;
    }
  }

  async validateConnection(): Promise<boolean> {
    try {
      const network = await this.provider.getNetwork();
      return network.chainId === 56n; // BSC Mainnet chainId
    } catch (error) {
      logger.error('BSC connection validation failed:', error);
      return false;
    }
  }
}