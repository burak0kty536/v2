import { logger } from '../utils/logger';

export class TechnicalIndicator {
  calculateRSI(prices: number[], period: number = 14): number[] {
    try {
      const rsi: number[] = [];
      const gains: number[] = [];
      const losses: number[] = [];

      // Calculate price changes
      for (let i = 1; i < prices.length; i++) {
        const change = prices[i] - prices[i - 1];
        gains.push(change > 0 ? change : 0);
        losses.push(change < 0 ? Math.abs(change) : 0);
      }

      // Calculate average gains and losses
      let avgGain = gains.slice(0, period).reduce((a, b) => a + b) / period;
      let avgLoss = losses.slice(0, period).reduce((a, b) => a + b) / period;

      // Calculate RSI
      for (let i = period; i < prices.length; i++) {
        avgGain = (avgGain * (period - 1) + gains[i]) / period;
        avgLoss = (avgLoss * (period - 1) + losses[i]) / period;
        
        const rs = avgGain / avgLoss;
        rsi.push(100 - (100 / (1 + rs)));
      }

      return rsi;
    } catch (error) {
      logger.error('RSI calculation error:', error);
      return [];
    }
  }

  calculateMACD(prices: number[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): {
    macd: number[];
    signal: number[];
    histogram: number[];
  } {
    try {
      const fastEMA = this.calculateEMA(prices, fastPeriod);
      const slowEMA = this.calculateEMA(prices, slowPeriod);
      const macd: number[] = [];

      // Calculate MACD line
      for (let i = 0; i < prices.length; i++) {
        macd.push(fastEMA[i] - slowEMA[i]);
      }

      // Calculate signal line
      const signal = this.calculateEMA(macd, signalPeriod);

      // Calculate histogram
      const histogram = macd.map((value, index) => value - signal[index]);

      return { macd, signal, histogram };
    } catch (error) {
      logger.error('MACD calculation error:', error);
      return { macd: [], signal: [], histogram: [] };
    }
  }

  calculateBollingerBands(prices: number[], period: number = 20, stdDev: number = 2): {
    upper: number[];
    middle: number[];
    lower: number[];
  } {
    try {
      const middle = this.calculateSMA(prices, period);
      const upper: number[] = [];
      const lower: number[] = [];

      // Calculate standard deviation and bands
      for (let i = period - 1; i < prices.length; i++) {
        const slice = prices.slice(i - period + 1, i + 1);
        const std = this.calculateStandardDeviation(slice);
        upper.push(middle[i - period + 1] + (stdDev * std));
        lower.push(middle[i - period + 1] - (stdDev * std));
      }

      return { upper, middle, lower };
    } catch (error) {
      logger.error('Bollinger Bands calculation error:', error);
      return { upper: [], middle: [], lower: [] };
    }
  }

  private calculateEMA(prices: number[], period: number): number[] {
    const multiplier = 2 / (period + 1);
    const ema: number[] = [prices[0]];

    for (let i = 1; i < prices.length; i++) {
      ema.push((prices[i] - ema[i - 1]) * multiplier + ema[i - 1]);
    }

    return ema;
  }

  private calculateSMA(prices: number[], period: number): number[] {
    const sma: number[] = [];
    for (let i = period - 1; i < prices.length; i++) {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b);
      sma.push(sum / period);
    }
    return sma;
  }

  private calculateStandardDeviation(values: number[]): number {
    const mean = values.reduce((a, b) => a + b) / values.length;
    const squareDiffs = values.map(value => Math.pow(value - mean, 2));
    const avgSquareDiff = squareDiffs.reduce((a, b) => a + b) / values.length;
    return Math.sqrt(avgSquareDiff);
  }
}