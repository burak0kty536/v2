import { logger } from '../utils/logger';

export class PriceService {
  private static instance: PriceService;
  private prices: Map<string, number> = new Map();
  private lastUpdate: number = 0;
  private readonly updateInterval = 60000; // 1 minute

  private constructor() {
    this.updatePrices();
  }

  static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  async getPrice(network: string): Promise<number> {
    try {
      if (Date.now() - this.lastUpdate > this.updateInterval) {
        await this.updatePrices();
      }
      return this.prices.get(network) || 0;
    } catch (error) {
      logger.error('Failed to get price:', error);
      return 0;
    }
  }

  private async updatePrices() {
    try {
      // Fetch current prices from a reliable API
      const currentPrices = {
        ETH: 2000,
        BSC: 300,
        SOLANA: 40
      };

      Object.entries(currentPrices).forEach(([network, price]) => {
        this.prices.set(network, price);
      });

      this.lastUpdate = Date.now();
    } catch (error) {
      logger.error('Failed to update prices:', error);
    }
  }

  async getTokenPrice(tokenAddress: string, network: string): Promise<{
    price: number;
    change24h: number;
  }> {
    try {
      // Implement real price fetching from an API
      // For now, using placeholder data
      const prices = {
        ETH: {
          USDT: { price: 1.0, change24h: 0.0 },
          USDC: { price: 1.0, change24h: 0.0 }
        },
        BSC: {
          USDT: { price: 1.0, change24h: 0.0 },
          USDC: { price: 1.0, change24h: 0.0 }
        },
        SOLANA: {
          SOL: { price: 40.0, change24h: 2.5 }
        }
      };

      return prices[network]?.[tokenAddress] || { price: 0, change24h: 0 };
    } catch (error) {
      logger.error('Failed to get token price:', error);
      return { price: 0, change24h: 0 };
    }
  }
}