import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { PingPongStrategy } from './PingPongStrategy';
import { ArbitrageStrategy } from './ArbitrageStrategy';
import { MEVProtector } from '../security/MEVProtector';

export class AdvancedStrategyManager extends EventEmitter {
  private activeStrategies: Map<string, any> = new Map();
  private mevProtector: MEVProtector;

  constructor(private readonly config: {
    maxConcurrentStrategies: number;
    defaultGasMultiplier: number;
    mevProtection: boolean;
  }) {
    super();
    this.mevProtector = new MEVProtector({
      maxGasPrice: '150000000000', // 150 gwei
      minPriorityFee: '2000000000', // 2 gwei
      flashbotsEnabled: true
    });
  }

  async startStrategy(params: {
    type: 'pingpong' | 'arbitrage' | 'sniper';
    config: any;
    network: string;
  }): Promise<boolean> {
    try {
      if (this.activeStrategies.size >= this.config.maxConcurrentStrategies) {
        throw new Error('Maximum concurrent strategies reached');
      }

      const strategyId = `${params.type}-${Date.now()}`;
      let strategy;

      switch (params.type) {
        case 'pingpong':
          strategy = new PingPongStrategy(params.config);
          break;
        case 'arbitrage':
          strategy = new ArbitrageStrategy(params.config);
          break;
        default:
          throw new Error(`Unsupported strategy type: ${params.type}`);
      }

      if (this.config.mevProtection) {
        strategy = this.mevProtector.wrapStrategy(strategy);
      }

      await strategy.init();
      this.activeStrategies.set(strategyId, strategy);

      strategy.on('trade', (data) => this.emit('trade', { strategyId, ...data }));
      strategy.on('error', (error) => this.emit('error', { strategyId, error }));

      logger.info(`Started strategy ${strategyId}`);
      return true;
    } catch (error) {
      logger.error('Failed to start strategy:', error);
      return false;
    }
  }

  async stopStrategy(strategyId: string): Promise<boolean> {
    try {
      const strategy = this.activeStrategies.get(strategyId);
      if (!strategy) {
        return false;
      }

      await strategy.stop();
      this.activeStrategies.delete(strategyId);
      logger.info(`Stopped strategy ${strategyId}`);
      return true;
    } catch (error) {
      logger.error(`Failed to stop strategy ${strategyId}:`, error);
      return false;
    }
  }

  async stopAll(): Promise<void> {
    const promises = Array.from(this.activeStrategies.entries()).map(
      ([id]) => this.stopStrategy(id)
    );
    await Promise.all(promises);
  }

  getActiveStrategies(): Array<{
    id: string;
    type: string;
    status: string;
    performance: any;
  }> {
    return Array.from(this.activeStrategies.entries()).map(([id, strategy]) => ({
      id,
      type: strategy.type,
      status: strategy.status,
      performance: strategy.getPerformanceMetrics()
    }));
  }
}