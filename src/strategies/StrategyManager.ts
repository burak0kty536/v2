import { MultiStrategyTrader } from './MultiStrategyTrader';
import { logger } from '../utils/logger';

export class StrategyManager {
  private readonly trader: MultiStrategyTrader;
  private activeStrategies: Map<string, any> = new Map();

  constructor(config: any) {
    this.trader = new MultiStrategyTrader(config, config.networks);
  }

  async deployStrategy(params: {
    type: string;
    token: string;
    network: string;
    config: any;
  }): Promise<void> {
    try {
      const { type, token, network, config } = params;
      
      // Validate strategy parameters
      this.validateStrategyParams(type, config);
      
      // Start strategy
      await this.trader.startStrategy(type, {
        token,
        network,
        ...config
      });
      
      // Store strategy configuration
      this.activeStrategies.set(`${type}-${token}-${network}`, {
        type,
        token,
        network,
        config,
        startTime: Date.now()
      });
      
      logger.info(`Deployed ${type} strategy for ${token} on ${network}`);
    } catch (error) {
      logger.error('Strategy deployment failed:', error);
      throw error;
    }
  }

  private validateStrategyParams(type: string, config: any): void {
    switch (type) {
      case 'grid':
        if (!config.upperPrice || !config.lowerPrice) {
          throw new Error('Grid strategy requires upperPrice and lowerPrice');
        }
        break;
      case 'momentum':
        if (!config.rsiPeriod || !config.macdFast || !config.macdSlow) {
          throw new Error('Momentum strategy requires RSI and MACD parameters');
        }
        break;
      case 'meanReversion':
        if (!config.period || !config.threshold) {
          throw new Error('Mean reversion strategy requires period and threshold');
        }
        break;
      case 'arbitrage':
        if (!config.minProfit || !config.maxSlippage) {
          throw new Error('Arbitrage strategy requires profit and slippage parameters');
        }
        break;
      default:
        throw new Error(`Unknown strategy type: ${type}`);
    }
  }

  getActiveStrategies(): Array<{
    type: string;
    token: string;
    network: string;
    startTime: number;
  }> {
    return Array.from(this.activeStrategies.values());
  }

  async stopStrategy(type: string, token: string, network: string): Promise<void> {
    const strategyId = `${type}-${token}-${network}`;
    if (this.activeStrategies.has(strategyId)) {
      await this.trader.stopStrategy(type);
      this.activeStrategies.delete(strategyId);
      logger.info(`Stopped ${type} strategy for ${token} on ${network}`);
    }
  }

  async stopAll(): Promise<void> {
    await this.trader.stopAll();
    this.activeStrategies.clear();
    logger.info('Stopped all trading strategies');
  }
}