import { EventEmitter } from 'events';
import { WebSocketManager } from '../websocket/WebSocketManager';
import { DexScreenerService } from '../integrations/DexScreenerService';
import { logger } from '../utils/logger';

export class CrossChainMonitor extends EventEmitter {
  private wsManager: WebSocketManager;
  private dexScreener: DexScreenerService;
  private watchedTokens: Map<string, Set<string>> = new Map(); // network -> tokens
  private priceFeeds: Map<string, number> = new Map(); // tokenAddress -> price

  constructor(
    private readonly config: {
      networks: string[];
      updateInterval: number;
      priceThreshold: number;
    }
  ) {
    super();
    this.wsManager = new WebSocketManager({});
    this.dexScreener = new DexScreenerService('YOUR_API_KEY', config.updateInterval);
  }

  async start(): Promise<void> {
    try {
      // Initialize WebSocket connections for each network
      for (const network of this.config.networks) {
        await this.wsManager.connect(network);
        this.watchedTokens.set(network, new Set());
      }

      // Set up price feed monitoring
      this.dexScreener.on('priceUpdates', (updates) => {
        for (const update of updates) {
          const oldPrice = this.priceFeeds.get(update.token) || 0;
          const priceChange = ((update.price - oldPrice) / oldPrice) * 100;

          if (Math.abs(priceChange) >= this.config.priceThreshold) {
            this.emit('significantPriceChange', {
              token: update.token,
              oldPrice,
              newPrice: update.price,
              changePercent: priceChange
            });
          }

          this.priceFeeds.set(update.token, update.price);
        }
      });

      // Monitor for arbitrage opportunities
      this.startArbitrageMonitoring();

      logger.info('Cross-chain monitor started');
    } catch (error) {
      logger.error('Failed to start cross-chain monitor:', error);
      throw error;
    }
  }

  private async startArbitrageMonitoring(): Promise<void> {
    setInterval(async () => {
      try {
        const opportunities = await this.findArbitrageOpportunities();
        if (opportunities.length > 0) {
          this.emit('arbitrageOpportunity', opportunities);
        }
      } catch (error) {
        logger.error('Error monitoring arbitrage opportunities:', error);
      }
    }, this.config.updateInterval);
  }

  private async findArbitrageOpportunities(): Promise<Array<{
    token: string;
    sourceNetwork: string;
    targetNetwork: string;
    profitPercent: number;
    estimatedProfit: number;
  }>> {
    const opportunities = [];

    for (const [network, tokens] of this.watchedTokens.entries()) {
      for (const token of tokens) {
        const prices = await this.getPricesAcrossNetworks(token);
        const arbitrageOps = this.calculateArbitrageOpportunities(token, prices);
        opportunities.push(...arbitrageOps);
      }
    }

    return opportunities;
  }

  private async getPricesAcrossNetworks(token: string): Promise<Map<string, number>> {
    const prices = new Map();

    for (const network of this.config.networks) {
      try {
        const price = await this.dexScreener.getTokenPrice(token, network);
        prices.set(network, price);
      } catch (error) {
        logger.error(`Failed to get price for ${token} on ${network}:`, error);
      }
    }

    return prices;
  }

  private calculateArbitrageOpportunities(
    token: string,
    prices: Map<string, number>
  ): Array<{
    token: string;
    sourceNetwork: string;
    targetNetwork: string;
    profitPercent: number;
    estimatedProfit: number;
  }> {
    const opportunities = [];
    const networks = Array.from(prices.keys());

    for (let i = 0; i < networks.length; i++) {
      for (let j = i + 1; j < networks.length; j++) {
        const sourceNetwork = networks[i];
        const targetNetwork = networks[j];
        const sourcePrice = prices.get(sourceNetwork)!;
        const targetPrice = prices.get(targetNetwork)!;

        const priceDiff = Math.abs(targetPrice - sourcePrice);
        const profitPercent = (priceDiff / sourcePrice) * 100;

        if (profitPercent >= this.config.priceThreshold) {
          opportunities.push({
            token,
            sourceNetwork,
            targetNetwork,
            profitPercent,
            estimatedProfit: priceDiff
          });
        }
      }
    }

    return opportunities;
  }

  async addToken(network: string, tokenAddress: string): Promise<void> {
    const tokens = this.watchedTokens.get(network);
    if (tokens) {
      tokens.add(tokenAddress);
      await this.dexScreener.addToken(tokenAddress);
    }
  }

  async removeToken(network: string, tokenAddress: string): Promise<void> {
    const tokens = this.watchedTokens.get(network);
    if (tokens) {
      tokens.delete(tokenAddress);
      await this.dexScreener.removeToken(tokenAddress);
    }
  }

  stop(): void {
    this.wsManager.disconnectAll();
    this.dexScreener.stopMonitoring();
  }
}