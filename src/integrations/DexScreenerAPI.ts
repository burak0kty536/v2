import axios from 'axios';
import { logger } from '../utils/logger';

export class DexScreenerAPI {
  private readonly baseUrl = 'https://api.dexscreener.com/latest';
  private readonly apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }

  async getTokenInfo(
    tokenAddress: string,
    chainId: string
  ): Promise<{
    price: number;
    priceChange24h: number;
    liquidity: number;
    volume24h: number;
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/dex/tokens/${tokenAddress}`,
        {
          headers: this.apiKey ? { 'X-API-KEY': this.apiKey } : undefined
        }
      );

      const data = response.data.pairs[0];
      return {
        price: parseFloat(data.priceUsd),
        priceChange24h: parseFloat(data.priceChange24h),
        liquidity: parseFloat(data.liquidity.usd),
        volume24h: parseFloat(data.volume24h)
      };
    } catch (error) {
      logger.error('DexScreener API error:', error);
      throw error;
    }
  }

  async getTopTokens(
    chain: string = 'all',
    limit: number = 100
  ): Promise<Array<{
    address: string;
    symbol: string;
    price: number;
    volume24h: number;
  }>> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/dex/tokens/trending`,
        {
          params: { chain, limit },
          headers: this.apiKey ? { 'X-API-KEY': this.apiKey } : undefined
        }
      );

      return response.data.tokens.map((token: any) => ({
        address: token.address,
        symbol: token.symbol,
        price: parseFloat(token.priceUsd),
        volume24h: parseFloat(token.volume24h)
      }));
    } catch (error) {
      logger.error('Error fetching top tokens:', error);
      return [];
    }
  }

  async getPairInfo(
    pairAddress: string
  ): Promise<{
    baseToken: string;
    quoteToken: string;
    price: number;
    liquidity: number;
    volume24h: number;
  }> {
    try {
      const response = await axios.get(
        `${this.baseUrl}/dex/pairs/${pairAddress}`,
        {
          headers: this.apiKey ? { 'X-API-KEY': this.apiKey } : undefined
        }
      );

      const pair = response.data.pair;
      return {
        baseToken: pair.baseToken.address,
        quoteToken: pair.quoteToken.address,
        price: parseFloat(pair.priceUsd),
        liquidity: parseFloat(pair.liquidity.usd),
        volume24h: parseFloat(pair.volume24h)
      };
    } catch (error) {
      logger.error('Error fetching pair info:', error);
      throw error;
    }
  }
}