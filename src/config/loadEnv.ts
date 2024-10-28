import { config } from 'dotenv';
import { logger } from '../utils/logger';

export interface NetworkConfig {
  rpcUrl: string;
  wssUrl: string;
  privateKey: string;
  minProfit: number;
  maxLoss: number;
  takeProfit: number;
  stopLoss: number;
  trailingStop: number;
  maxPositions: number;
  checkInterval: number;
  minLiquidity: number;
  maxPriceImpact: number;
  gasMultiplier: number;
}

export interface DexConfig {
  uniswapV2Router: string;
  uniswapV3Router: string;
  pancakeV2Router: string;
  pancakeV3Router: string;
  raydiumRouter: string;
  jupiterRouter: string;
}

export interface SecurityConfig {
  checkInterval: number;
  minHoldersCount: number;
  maxCreatorTokensPercent: number;
  contractVerificationRequired: boolean;
  honeypotCheckEnabled: boolean;
  mintFunctionCheck: boolean;
  blacklistCheck: boolean;
  rugPullCheck: boolean;
  mevProtection: boolean;
}

export interface TradingConfig {
  autoTradingEnabled: boolean;
  autoSellEnabled: boolean;
  useTrailingStop: boolean;
  trailingStopPercent: number;
  positionSizePercent: number;
  maxTradesPerToken: number;
}

export interface Config {
  environment: string;
  logLevel: string;
  maxConcurrentTrades: number;
  globalMinLiquidity: number;
  globalMaxSlippage: number;
  networks: {
    solana: NetworkConfig;
    ethereum: NetworkConfig;
    bsc: NetworkConfig;
  };
  dex: DexConfig;
  security: SecurityConfig;
  trading: TradingConfig;
}

export function loadConfig(): Config {
  config();

  try {
    return {
      environment: process.env.ENVIRONMENT || 'production',
      logLevel: process.env.LOG_LEVEL || 'info',
      maxConcurrentTrades: parseInt(process.env.MAX_CONCURRENT_TRADES || '10'),
      globalMinLiquidity: parseFloat(process.env.GLOBAL_MIN_LIQUIDITY_USD || '10000'),
      globalMaxSlippage: parseFloat(process.env.GLOBAL_MAX_SLIPPAGE || '3'),
      
      networks: {
        solana: {
          rpcUrl: process.env.SOLANA_RPC_URL!,
          wssUrl: process.env.SOLANA_WSS_URL!,
          privateKey: process.env.SOLANA_PRIVATE_KEY!,
          minProfit: parseFloat(process.env.SOLANA_MIN_PROFIT || '2.5'),
          maxLoss: parseFloat(process.env.SOLANA_MAX_LOSS || '1.0'),
          takeProfit: parseFloat(process.env.SOLANA_TAKE_PROFIT || '3.0'),
          stopLoss: parseFloat(process.env.SOLANA_STOP_LOSS || '1.5'),
          trailingStop: parseFloat(process.env.SOLANA_TRAILING_STOP || '1.0'),
          maxPositions: parseInt(process.env.SOLANA_MAX_POSITIONS || '5'),
          checkInterval: parseInt(process.env.SOLANA_CHECK_INTERVAL || '5000'),
          minLiquidity: parseFloat(process.env.SOLANA_MIN_LIQUIDITY || '5000'),
          maxPriceImpact: parseFloat(process.env.SOLANA_MAX_PRICE_IMPACT || '1.0'),
          gasMultiplier: parseFloat(process.env.SOLANA_GAS_MULTIPLIER || '1.2')
        },
        ethereum: {
          rpcUrl: process.env.ETH_RPC_URL!,
          wssUrl: process.env.ETH_WSS_URL!,
          privateKey: process.env.ETH_PRIVATE_KEY!,
          minProfit: parseFloat(process.env.ETH_MIN_PROFIT || '1.5'),
          maxLoss: parseFloat(process.env.ETH_MAX_LOSS || '0.8'),
          takeProfit: parseFloat(process.env.ETH_TAKE_PROFIT || '2.5'),
          stopLoss: parseFloat(process.env.ETH_STOP_LOSS || '1.2'),
          trailingStop: parseFloat(process.env.ETH_TRAILING_STOP || '0.8'),
          maxPositions: parseInt(process.env.ETH_MAX_POSITIONS || '5'),
          checkInterval: parseInt(process.env.ETH_CHECK_INTERVAL || '3000'),
          minLiquidity: parseFloat(process.env.ETH_MIN_LIQUIDITY || '10000'),
          maxPriceImpact: parseFloat(process.env.ETH_MAX_PRICE_IMPACT || '0.5'),
          gasMultiplier: parseFloat(process.env.ETH_GAS_MULTIPLIER || '1.5')
        },
        bsc: {
          rpcUrl: process.env.BSC_RPC_URL!,
          wssUrl: process.env.BSC_WSS_URL!,
          privateKey: process.env.BSC_PRIVATE_KEY!,
          minProfit: parseFloat(process.env.BSC_MIN_PROFIT || '2.0'),
          maxLoss: parseFloat(process.env.BSC_MAX_LOSS || '1.2'),
          takeProfit: parseFloat(process.env.BSC_TAKE_PROFIT || '3.0'),
          stopLoss: parseFloat(process.env.BSC_STOP_LOSS || '1.8'),
          trailingStop: parseFloat(process.env.BSC_TRAILING_STOP || '1.2'),
          maxPositions: parseInt(process.env.BSC_MAX_POSITIONS || '5'),
          checkInterval: parseInt(process.env.BSC_CHECK_INTERVAL || '4000'),
          minLiquidity: parseFloat(process.env.BSC_MIN_LIQUIDITY || '7500'),
          maxPriceImpact: parseFloat(process.env.BSC_MAX_PRICE_IMPACT || '0.8'),
          gasMultiplier: parseFloat(process.env.BSC_GAS_MULTIPLIER || '1.3')
        }
      },
      
      dex: {
        uniswapV2Router: process.env.UNISWAP_V2_ROUTER!,
        uniswapV3Router: process.env.UNISWAP_V3_ROUTER!,
        pancakeV2Router: process.env.PANCAKE_V2_ROUTER!,
        pancakeV3Router: process.env.PANCAKE_V3_ROUTER!,
        raydiumRouter: process.env.RAYDIUM_ROUTER!,
        jupiterRouter: process.env.JUPITER_ROUTER!
      },
      
      security: {
        checkInterval: parseInt(process.env.SECURITY_CHECK_INTERVAL || '2000'),
        minHoldersCount: parseInt(process.env.MIN_HOLDERS_COUNT || '50'),
        maxCreatorTokensPercent: parseFloat(process.env.MAX_CREATOR_TOKENS_PERCENT || '20'),
        contractVerificationRequired: process.env.CONTRACT_VERIFICATION_REQUIRED === 'true',
        honeypotCheckEnabled: process.env.HONEYPOT_CHECK_ENABLED === 'true',
        mintFunctionCheck: process.env.MINT_FUNCTION_CHECK === 'true',
        blacklistCheck: process.env.BLACKLIST_CHECK === 'true',
        rugPullCheck: process.env.RUG_PULL_CHECK === 'true',
        mevProtection: process.env.MEV_PROTECTION === 'true'
      },
      
      trading: {
        autoTradingEnabled: process.env.AUTO_TRADING_ENABLED === 'true',
        autoSellEnabled: process.env.AUTO_SELL_ENABLED === 'true',
        useTrailingStop: process.env.USE_TRAILING_STOP === 'true',
        trailingStopPercent: parseFloat(process.env.TRAILING_STOP_PERCENT || '1.5'),
        positionSizePercent: parseFloat(process.env.POSITION_SIZE_PERCENT || '5'),
        maxTradesPerToken: parseInt(process.env.MAX_TRADES_PER_TOKEN || '3')
      }
    };
  } catch (error) {
    logger.error('Failed to load configuration:', error);
    throw error;
  }
}