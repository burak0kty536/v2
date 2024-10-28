import { config } from 'dotenv';
import { logger } from '../utils/logger';

export interface WalletConfig {
  privateKey: string;
  address: string;
  maxTradeAmount: number;
  enabled: boolean;
}

export interface NetworkWallets {
  ethereum: WalletConfig[];
  bsc: WalletConfig[];
  solana: WalletConfig[];
}

export function loadWalletConfigurations(): NetworkWallets {
  config();

  try {
    const wallets: NetworkWallets = {
      ethereum: [],
      bsc: [],
      solana: []
    };

    // Load Ethereum wallets
    let walletIndex = 1;
    while (process.env[`ETH_WALLET_${walletIndex}_PRIVATE_KEY`]) {
      wallets.ethereum.push({
        privateKey: process.env[`ETH_WALLET_${walletIndex}_PRIVATE_KEY`]!,
        address: process.env[`ETH_WALLET_${walletIndex}_ADDRESS`]!,
        maxTradeAmount: parseFloat(process.env[`ETH_WALLET_${walletIndex}_MAX_TRADE_AMOUNT`] || '0'),
        enabled: process.env[`ETH_WALLET_${walletIndex}_ENABLED`] === 'true'
      });
      walletIndex++;
    }

    // Load BSC wallets
    walletIndex = 1;
    while (process.env[`BSC_WALLET_${walletIndex}_PRIVATE_KEY`]) {
      wallets.bsc.push({
        privateKey: process.env[`BSC_WALLET_${walletIndex}_PRIVATE_KEY`]!,
        address: process.env[`BSC_WALLET_${walletIndex}_ADDRESS`]!,
        maxTradeAmount: parseFloat(process.env[`BSC_WALLET_${walletIndex}_MAX_TRADE_AMOUNT`] || '0'),
        enabled: process.env[`BSC_WALLET_${walletIndex}_ENABLED`] === 'true'
      });
      walletIndex++;
    }

    // Load Solana wallets
    walletIndex = 1;
    while (process.env[`SOLANA_WALLET_${walletIndex}_PRIVATE_KEY`]) {
      wallets.solana.push({
        privateKey: process.env[`SOLANA_WALLET_${walletIndex}_PRIVATE_KEY`]!,
        address: process.env[`SOLANA_WALLET_${walletIndex}_ADDRESS`]!,
        maxTradeAmount: parseFloat(process.env[`SOLANA_WALLET_${walletIndex}_MAX_TRADE_AMOUNT`] || '0'),
        enabled: process.env[`SOLANA_WALLET_${walletIndex}_ENABLED`] === 'true'
      });
      walletIndex++;
    }

    // Validate wallet configurations
    validateWalletConfigurations(wallets);

    return wallets;
  } catch (error) {
    logger.error('Failed to load wallet configurations:', error);
    throw error;
  }
}

function validateWalletConfigurations(wallets: NetworkWallets): void {
  const maxWalletsPerNetwork = parseInt(process.env.MAX_CONCURRENT_WALLETS_PER_NETWORK || '3');

  // Validate Ethereum wallets
  if (wallets.ethereum.length > maxWalletsPerNetwork) {
    logger.warn(`Number of Ethereum wallets (${wallets.ethereum.length}) exceeds maximum allowed (${maxWalletsPerNetwork})`);
  }

  // Validate BSC wallets
  if (wallets.bsc.length > maxWalletsPerNetwork) {
    logger.warn(`Number of BSC wallets (${wallets.bsc.length}) exceeds maximum allowed (${maxWalletsPerNetwork})`);
  }

  // Validate Solana wallets
  if (wallets.solana.length > maxWalletsPerNetwork) {
    logger.warn(`Number of Solana wallets (${wallets.solana.length}) exceeds maximum allowed (${maxWalletsPerNetwork})`);
  }

  // Validate each wallet has required fields
  for (const network of Object.keys(wallets) as Array<keyof NetworkWallets>) {
    wallets[network].forEach((wallet, index) => {
      if (!wallet.privateKey || !wallet.address) {
        throw new Error(`Invalid configuration for ${network} wallet ${index + 1}`);
      }
    });
  }
}