import { BaseTradingBot } from '../core/BaseTradingBot';
import { logger } from '../utils/logger';
import { DexScreenerAPI } from '../integrations/DexScreenerAPI';

export class ArbitrageStrategy {
  private isActive = false;
  private readonly minProfitPercent: number;
  private readonly dexScreener: DexScreenerAPI;

  constructor(
    private readonly sourceBot: BaseTradingBot,
    private readonly targetBot: BaseTradingBot,
    config: {
      minProfitPercent: number;
      checkInterval: number;
    }
  ) {
    this.minProfitPercent = config.minProfitPercent;
    this.dexScreener = new DexScreenerAPI();
  }

  async start(): Promise<void> {
    if (this.isActive) return;
    
    this.isActive = true;
    await this.monitorArbitrageOpportunities();
  }

  async stop(): Promise<void> {
    this.isActive = false;
  }

  private async monitorArbitrageOpportunities(): Promise<void> {
    while (this.isActive) {
      try {
        const opportunities = await this.findArbitrageOpportunities();
        
        for (const opportunity of opportunities) {
          if (opportunity.profitPercent >= this.minProfitPercent) {
            await this.executeArbitrageTrade(opportunity);
          }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        logger.error('Arbitrage monitoring error:', error);
      }
    }
  }

  private async findArbitrageOpportunities(): Promise<Array<{
    token: string;
    sourceDex: string;
    targetDex: string;
    sourcePrice: number;
    targetPrice: number;
    profitPercent: number;
  }>> {
    try {
      const opportunities = [];
      const tokens = await this.dexScreener.getTopTokens();

      for (const token of tokens) {
        const [sourcePrice, targetPrice] = await Promise.all([
          this.sourceBot.checkPrice(token.address),
          this.targetBot.checkPrice(token.address)
        ]);

        const priceDiff = targetPrice - sourcePrice;
        const profitPercent = (priceDiff / sourcePrice) * 100;

        if (profitPercent > 0) {
          opportunities.push({
            token: token.address,
            sourceDex: this.sourceBot.network,
            targetDex: this.targetBot.network,
            sourcePrice,
            targetPrice,
            profitPercent
          });
        }
      }

      return opportunities;
    } catch (error) {
      logger.error('Error finding arbitrage opportunities:', error);
      return [];
    }
  }

  private async executeArbitrageTrade(opportunity: any): Promise<void> {
    try {
      logger.info(`Executing arbitrage for ${opportunity.token}`);
      
      // Buy on source exchange
      const bought = await this.sourceBot.buy(
        opportunity.token,
        1 // Calculate optimal amount based on liquidity
      );

      if (bought) {
        // Sell on target exchange
        const sold = await this.targetBot.sell(
          opportunity.token,
          1 // Same amount as bought
        );

        if (sold) {
          logger.info(`Successful arbitrage: ${opportunity.profitPercent}% profit`);
        }
      }
    } catch (error) {
      logger.error('Arbitrage execution error:', error);
    }
  }
}