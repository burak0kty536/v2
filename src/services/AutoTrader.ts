import { EventEmitter } from '../utils/EventEmitter';
import { logger } from '../utils/logger';
import { TokenDetector } from './TokenDetector';
import { SecurityChecker } from '../security/SecurityChecker';
import { PriceFeedService } from './PriceFeedService';

interface TradeConfig {
  network: string;
  minLiquidity: number;
  maxSlippage: number;
  takeProfit: number;
  stopLoss: number;
  gasMultiplier: number;
}

interface TradeResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

export class AutoTrader extends EventEmitter {
  private isActive: boolean = false;
  private readonly tokenDetector: TokenDetector;
  private readonly securityChecker: SecurityChecker;
  private readonly priceFeed: PriceFeedService;
  private activePositions: Map<string, any> = new Map();

  constructor(
    private readonly config: TradeConfig,
    tokenDetector: TokenDetector,
    securityChecker: SecurityChecker,
    priceFeed: PriceFeedService
  ) {
    super();
    this.tokenDetector = tokenDetector;
    this.securityChecker = securityChecker;
    this.priceFeed = priceFeed;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.tokenDetector.on('newToken', async (token) => {
      if (this.isActive) {
        await this.evaluateToken(token);
      }
    });

    this.priceFeed.on('priceUpdate', async (update) => {
      if (this.isActive) {
        await this.checkPositions(update);
      }
    });
  }

  async start(): Promise<void> {
    if (this.isActive) return;
    
    this.isActive = true;
    logger.info('AutoTrader started');
    
    await this.tokenDetector.start();
    await this.priceFeed.connect();
  }

  async stop(): Promise<void> {
    this.isActive = false;
    this.tokenDetector.stop();
    this.priceFeed.disconnect();
    logger.info('AutoTrader stopped');
  }

  private async evaluateToken(token: any): Promise<void> {
    try {
      // Security check
      const security = await this.securityChecker.analyzeToken(token.address);
      
      if (!security.safe) {
        logger.warn(`Token ${token.address} failed security check:`, security.risks);
        return;
      }

      // Liquidity check
      if (token.liquidity < this.config.minLiquidity) {
        logger.debug(`Token ${token.address} has insufficient liquidity`);
        return;
      }

      // Execute trade if all checks pass
      const result = await this.executeTrade(token);
      
      if (result.success) {
        this.emit('tradePlaced', {
          token: token.address,
          txHash: result.txHash,
          timestamp: Date.now()
        });
      } else {
        logger.error(`Trade failed for ${token.address}:`, result.error);
      }
    } catch (error) {
      logger.error(`Error evaluating token ${token.address}:`, error);
    }
  }

  private async executeTrade(token: any): Promise<TradeResult> {
    try {
      // Implement trade execution logic
      return {
        success: true,
        txHash: '0x...'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  private async checkPositions(priceUpdate: any): Promise<void> {
    try {
      for (const [tokenAddress, position] of this.activePositions.entries()) {
        const currentPrice = priceUpdate.price;
        
        if (this.shouldTakeProfit(position, currentPrice)) {
          await this.closePosition(tokenAddress, 'takeProfit');
        } else if (this.shouldStopLoss(position, currentPrice)) {
          await this.closePosition(tokenAddress, 'stopLoss');
        }
      }
    } catch (error) {
      logger.error('Error checking positions:', error);
    }
  }

  private shouldTakeProfit(position: any, currentPrice: number): boolean {
    const profitPercent = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;
    return profitPercent >= this.config.takeProfit;
  }

  private shouldStopLoss(position: any, currentPrice: number): boolean {
    const lossPercent = ((position.entryPrice - currentPrice) / position.entryPrice) * 100;
    return lossPercent >= Math.abs(this.config.stopLoss);
  }

  private async closePosition(tokenAddress: string, reason: 'takeProfit' | 'stopLoss'): Promise<void> {
    try {
      const position = this.activePositions.get(tokenAddress);
      if (!position) return;

      // Implement position closing logic
      
      this.activePositions.delete(tokenAddress);
      
      this.emit('positionClosed', {
        token: tokenAddress,
        reason,
        profit: 0, // Calculate actual profit
        timestamp: Date.now()
      });
    } catch (error) {
      logger.error(`Error closing position for ${tokenAddress}:`, error);
    }
  }

  getActivePositions(): any[] {
    return Array.from(this.activePositions.values());
  }
}