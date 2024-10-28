import { ethers } from 'ethers';
import { SolanaWalletService } from './SolanaWalletService';
import { BSCWalletService } from './BSCWalletService';
import { logger } from '../utils/logger';

export class WalletService {
  private solanaService: SolanaWalletService;
  private bscService: BSCWalletService;
  private ethProvider: ethers.JsonRpcProvider;

  constructor(config?: {
    solanaRpc?: string;
    bscRpc?: string;
    ethRpc?: string;
  }) {
    this.solanaService = new SolanaWalletService(config?.solanaRpc);
    this.bscService = new BSCWalletService(config?.bscRpc);
    this.ethProvider = new ethers.JsonRpcProvider(
      config?.ethRpc || 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID'
    );
  }

  async connectWallet(network: string, privateKey: string): Promise<{
    address: string;
    balance: string;
  }> {
    try {
      switch (network) {
        case 'SOLANA':
          return await this.solanaService.connectWallet(privateKey);
        case 'BSC':
          return await this.bscService.connectWallet(privateKey);
        case 'ETH': {
          const formattedKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
          const wallet = new ethers.Wallet(formattedKey, this.ethProvider);
          const address = await wallet.getAddress();
          const balance = await this.ethProvider.getBalance(address);
          return {
            address,
            balance: ethers.formatEther(balance)
          };
        }
        default:
          throw new Error(`Unsupported network: ${network}`);
      }
    } catch (error) {
      logger.error(`Failed to connect ${network} wallet:`, error);
      throw error;
    }
  }

  async getBalance(network: string, address: string): Promise<string> {
    try {
      switch (network) {
        case 'SOLANA':
          return await this.solanaService.getBalance(address);
        case 'BSC':
          return await this.bscService.getBalance(address);
        case 'ETH': {
          const balance = await this.ethProvider.getBalance(address);
          return ethers.formatEther(balance);
        }
        default:
          throw new Error(`Unsupported network: ${network}`);
      }
    } catch (error) {
      logger.error(`Failed to get ${network} balance:`, error);
      throw error;
    }
  }

  validatePrivateKey(network: string, privateKey: string): boolean {
    switch (network) {
      case 'SOLANA':
        return this.solanaService.validatePrivateKey(privateKey);
      case 'BSC':
        return this.bscService.validatePrivateKey(privateKey);
      case 'ETH': {
        try {
          const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
          return /^[0-9a-fA-F]{64}$/.test(cleanKey);
        } catch {
          return false;
        }
      }
      default:
        return false;
    }
  }

  getExplorerUrl(network: string, address: string): string {
    switch (network) {
      case 'ETH':
        return `https://etherscan.io/address/${address}`;
      case 'BSC':
        return `https://bscscan.com/address/${address}`;
      case 'SOLANA':
        return `https://solscan.io/account/${address}`;
      default:
        return '';
    }
  }

  getNetworkSymbol(network: string): string {
    switch (network) {
      case 'ETH':
        return 'ETH';
      case 'BSC':
        return 'BNB';
      case 'SOLANA':
        return 'SOL';
      default:
        return '';
    }
  }
}