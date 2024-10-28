import { ethers } from 'ethers';
import { PublicKey } from '@solana/web3.js';
import { SolanaWallet } from './solana/SolanaWallet';
import { logger } from './logger';

export interface WalletConnection {
  address: string;
  balance: string;
  network: string;
}

export const validatePrivateKey = async (network: string, privateKey: string): Promise<boolean> => {
  try {
    if (!privateKey?.trim()) return false;

    switch (network) {
      case 'ETH':
      case 'BSC': {
        const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
        if (!/^[0-9a-fA-F]{64}$/.test(cleanKey)) return false;
        
        // Verify wallet creation
        const wallet = new ethers.Wallet(cleanKey);
        return Boolean(wallet.address);
      }
      case 'SOLANA': {
        try {
          const wallet = new SolanaWallet(privateKey);
          const address = wallet.getPublicKey();
          return Boolean(new PublicKey(address));
        } catch {
          return false;
        }
      }
      default:
        return false;
    }
  } catch {
    return false;
  }
};

export const connectWallet = async (network: string, privateKey: string): Promise<WalletConnection> => {
  try {
    if (!await validatePrivateKey(network, privateKey)) {
      throw new Error(`Invalid ${network} private key format`);
    }

    switch (network) {
      case 'ETH': {
        const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR-PROJECT-ID');
        const wallet = new ethers.Wallet(privateKey, provider);
        const balance = await provider.getBalance(wallet.address);
        return {
          address: wallet.address,
          balance: ethers.formatEther(balance),
          network: 'ETH'
        };
      }
      case 'BSC': {
        const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org');
        const wallet = new ethers.Wallet(privateKey, provider);
        const balance = await provider.getBalance(wallet.address);
        return {
          address: wallet.address,
          balance: ethers.formatEther(balance),
          network: 'BSC'
        };
      }
      case 'SOLANA': {
        const wallet = new SolanaWallet(privateKey);
        const balance = await wallet.getBalance();
        return {
          address: wallet.getPublicKey(),
          balance,
          network: 'SOLANA'
        };
      }
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  } catch (error) {
    logger.error(`Failed to connect ${network} wallet:`, error);
    throw new Error(`Failed to connect ${network} wallet: ${error.message}`);
  }
};

export const formatAddress = (address: string): string => {
  if (!address?.trim()) return '';
  return address.length > 12 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
};

export const getExplorerUrl = (network: string, address: string): string => {
  if (!address?.trim()) return '';
  
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
};

export const getWalletBalance = async (network: string, address: string): Promise<string> => {
  if (!address?.trim()) {
    throw new Error('Address cannot be empty');
  }

  try {
    switch (network) {
      case 'ETH': {
        const provider = new ethers.JsonRpcProvider('https://mainnet.infura.io/v3/YOUR-PROJECT-ID');
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
      }
      case 'BSC': {
        const provider = new ethers.JsonRpcProvider('https://bsc-dataseed.binance.org');
        const balance = await provider.getBalance(address);
        return ethers.formatEther(balance);
      }
      case 'SOLANA': {
        return await SolanaWallet.getAddressBalance(address);
      }
      default:
        throw new Error(`Unsupported network: ${network}`);
    }
  } catch (error) {
    logger.error(`Failed to get ${network} balance:`, error);
    throw new Error(`Failed to get ${network} balance`);
  }
};

export const getNetworkSymbol = (network: string): string => {
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
};