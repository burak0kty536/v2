export type NetworkType = 'ETH' | 'BSC' | 'SOLANA';

export interface NetworkInfo {
  name: string;
  rpcUrls: string[];
  dexes: {
    [key: string]: {
      router?: string;
      factory?: string;
      programId?: string;
    };
  };
  blockTime: number;
  nativeCurrency: {
    symbol: string;
    decimals: number;
  };
}

export interface WalletConfig {
  network: NetworkType;
  privateKey: string;
  address: string;
  active: boolean;
  maxTradeAmount: number;
  settings?: {
    slippage?: number;
    gasMultiplier?: number;
    priorityFee?: number;
  };
}

export interface TradeConfig {
  network: NetworkType;
  dex: string;
  tokenAddress: string;
  amount: number;
  slippage: number;
  maxGasPrice?: number;
  priorityFee?: number;
  deadline?: number;
}

export interface SecurityCheckResult {
  safe: boolean;
  risks: string[];
  details: {
    isHoneypot: boolean;
    isRugPull: boolean;
    hasLiquidity: boolean;
    liquidityLocked: boolean;
    sourceVerified: boolean;
    holderCount: number;
    topHolderPercent: number;
    mintable: boolean;
    burnable: boolean;
    pausable: boolean;
  };
}

export interface TokenInfo {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  totalSupply: string;
  network: NetworkType;
  price: number;
  priceChange24h: number;
  volume24h: number;
  liquidity: number;
  marketCap: number;
  holders: number;
  verified: boolean;
  createdAt: number;
}