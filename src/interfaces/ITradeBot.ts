export interface ITradeBot {
  network: string;
  walletKey: string;
  
  // Trading parameters
  maxBuyAmount: number;
  slippageTolerance: number;
  gasLimit?: number;
  gasPrice?: string;
  
  // Safety settings
  stopLoss: number;
  takeProfit: number;
  maxLossPercentage: number;
  
  // Monitoring settings
  priceCheckInterval: number;
  antiMEV: boolean;
  
  // Security checks
  checkRugPull: boolean;
  checkHoneypot: boolean;
  checkLiquidity: boolean;
  
  // Trading strategies
  usePingPong: boolean;
  useArbitrage: boolean;
  
  // Initialize bot
  init(): Promise<void>;
  
  // Core trading functions
  buy(tokenAddress: string, amount: number): Promise<boolean>;
  sell(tokenAddress: string, amount: number): Promise<boolean>;
  
  // Market analysis
  checkPrice(tokenAddress: string): Promise<number>;
  analyzeLiquidity(tokenAddress: string): Promise<boolean>;
  
  // Security checks
  checkTokenSecurity(tokenAddress: string): Promise<{
    isHoneypot: boolean;
    isRugPull: boolean;
    hasLiquidity: boolean;
  }>;
}