import { NetworkType } from '../types/NetworkTypes';

export const NETWORK_CONFIG = {
  ETH: {
    name: 'Ethereum',
    rpcUrls: [
      'https://eth-mainnet.g.alchemy.com/v2/YOUR-API-KEY',
      'https://mainnet.infura.io/v3/YOUR-API-KEY'
    ],
    dexes: {
      UNISWAP_V2: {
        router: '0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D',
        factory: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f'
      },
      UNISWAP_V3: {
        router: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
        factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984'
      },
      ONEINCH: {
        router: '0x1111111254fb6c44bAC0beD2854e76F90643097d'
      }
    },
    blockTime: 12,
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18
    }
  },
  BSC: {
    name: 'BNB Smart Chain',
    rpcUrls: [
      'https://bsc-dataseed.binance.org',
      'https://bsc-dataseed1.defibit.io'
    ],
    dexes: {
      PANCAKESWAP_V2: {
        router: '0x10ED43C718714eb63d5aA57B78B54704E256024E',
        factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73'
      },
      PANCAKESWAP_V3: {
        router: '0x13f4EA83D0bd40E75C8222255bc855a974568Dd4',
        factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865'
      }
    },
    blockTime: 3,
    nativeCurrency: {
      symbol: 'BNB',
      decimals: 18
    }
  },
  SOLANA: {
    name: 'Solana',
    rpcUrls: [
      'https://api.mainnet-beta.solana.com',
      'https://solana-api.projectserum.com'
    ],
    dexes: {
      RAYDIUM: {
        programId: '675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8'
      },
      JUPITER: {
        programId: 'JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB'
      }
    },
    blockTime: 0.4,
    nativeCurrency: {
      symbol: 'SOL',
      decimals: 9
    }
  }
} as const;

export const DEFAULT_SETTINGS = {
  maxSlippage: 3, // 3%
  maxGasPrice: {
    ETH: 150, // gwei
    BSC: 5,
    SOLANA: 0.000005 // lamports
  },
  minLiquidity: {
    ETH: 50000, // USD
    BSC: 10000,
    SOLANA: 5000
  },
  antiMEV: {
    enabled: true,
    maxPriorityFee: {
      ETH: 3, // gwei
      BSC: 1,
      SOLANA: 0.000001 // lamports
    }
  },
  security: {
    checkHoneypot: true,
    checkRugPull: true,
    checkSourceCode: true,
    minHolders: 50,
    maxOwnershipPercent: 5,
    requireLiquidityLock: true,
    minLiquidityLockTime: 180 * 24 * 60 * 60 // 180 days
  },
  trading: {
    maxPositions: 5,
    maxPositionSize: 0.1, // 10% of available balance
    takeProfit: 50, // 50%
    stopLoss: 20, // 20%
    trailingStop: {
      enabled: true,
      activation: 20, // Activate at 20% profit
      distance: 10 // 10% trailing distance
    }
  },
  monitoring: {
    newPairInterval: 1000, // 1 second
    priceCheckInterval: 3000, // 3 seconds
    balanceCheckInterval: 30000 // 30 seconds
  }
} as const;

export function getNetworkConfig(network: NetworkType) {
  return NETWORK_CONFIG[network];
}

export function getDefaultRpcUrl(network: NetworkType): string {
  return NETWORK_CONFIG[network].rpcUrls[0];
}

export function getSupportedDexes(network: NetworkType) {
  return Object.keys(NETWORK_CONFIG[network].dexes);
}