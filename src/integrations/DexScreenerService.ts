import { DexScreenerAPI } from './DexScreenerAPI';
import { logger } from '../utils/logger';
import { EventEmitter } from 'events';

export class DexScreenerService extends EventEmitter {
  private readonly api: DexScreenerAPI;
  private readonly updateInterval: number;
  private watchedTokens: Set<string> = new Set();
  private intervalId?: NodeJS.Timeout;

  constructor(apiKey: string, updateInterval: number = 10000) {
    super();
    this.api = new DexScreenerAPI(apiKey);
    this.updateInterval = updateInterval;
  }

  async startMonitoring(tokens: string[]): Promise<void> {
    tokens.forEach(token => this.watchedTokens.add(token));
    
    if (!this.intervalId) {
      await this.updatePrices();
      this.intervalId = setInterval(() => this.updatePrices(), this.updateInterval);
    }
  }

  async stopMonitoring(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = undefined;
    }
    this.watchedTokens.clear();
  }

  private async updatePrices(): Promise<void> {
    try {
      const updates = await Promise.all(
        Array.from(this.watchedTokens).map(async (token) => {
          try {
            const data = await this.api.getTokenInfo(token, 'all');
            return { token, ...data };
          } catch (error) {
            logger.error(`Failed to fetch price for token ${token}:`, error);
            return null;
          }
        })
      );

      const validUpdates = updates.filter(update => update !== null);
      
      if (validUpdates.length > 0) {
        this.emit('priceUpdates', validUpdates);
        
        // Emit alerts for significant price changes
        validUpdates.forEach(update => {
          if (update && Math.abs(update.priceChange24h) > 10) {
            this.emit('priceAlert', {
              token: update.token,
              change: update.priceChange24h,
              price: update.price
            });
          }
        });
      }
    } catch (error) {
      logger.error('Failed to update prices:', error);
    }
  }

  async addToken(token: string): Promise<void> {
    this.watchedTokens.add(token);
  }

  async removeToken(token: string): Promise<void> {
    this.watchedTokens.delete(token);
  }

  async getTopTokens(limit: number = 100): Promise<any[]> {
    try {
      return await this.api.getTopTokens('all', limit);
    } catch (error) {
      logger.error('Failed to fetch top tokens:', error);
      return [];
    }
  }

  async getPairInfo(pairAddress: string): Promise<any> {
    try {
      return await this.api.getPairInfo(pairAddress);
    } catch (error) {
      logger.error('Failed to fetch pair info:', error);
      throw error;
    }
  }
}