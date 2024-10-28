import { TechnicalIndicator } from '../indicators/TechnicalIndicators';
import { logger } from '../utils/logger';

export class AdvancedTradingStrategy {
  private indicators: TechnicalIndicator;
  private readonly config: {
    rsiOverbought: number;
    rsiOversold: number;
    macdThreshold: number;
    bollingerBandThreshold: number;
  };

  constructor(config = {
    rsiOverbought: 70,
    rsiOversold: 30,
    macdThreshold: 0,
    bollingerBandThreshold: 0.05
  }) {
    this.indicators = new TechnicalIndicator();
    this.config = config;
  }

  async analyzeMarket(prices: number[]): Promise<{
    shouldBuy: boolean;
    shouldSell: boolean;
    confidence: number;
    signals: string[];
  }> {
    try {
      const signals: string[] = [];
      let buySignals = 0;
      let sellSignals = 0;

      // RSI Analysis
      const rsi = this.indicators.calculateRSI(prices);
      const currentRSI = rsi[rsi.length - 1];

      if (currentRSI < this.config.rsiOversold) {
        buySignals++;
        signals.push(`RSI oversold (${currentRSI.toFixed(2)})`);
      } else if (currentRSI > this.config.rsiOverbought) {
        sellSignals++;
        signals.push(`RSI overbought (${currentRSI.toFixed(2)})`);
      }

      // MACD Analysis
      const macd = this.indicators.calculateMACD(prices);
      const currentMACD = macd.histogram[macd.histogram.length - 1];

      if (currentMACD > this.config.macdThreshold) {
        buySignals++;
        signals.push(`MACD bullish (${currentMACD.toFixed(2)})`);
      } else if (currentMACD < -this.config.macdThreshold) {
        sellSignals++;
        signals.push(`MACD bearish (${currentMACD.toFixed(2)})`);
      }

      // Bollinger Bands Analysis
      const bb = this.indicators.calculateBollingerBands(prices);
      const currentPrice = prices[prices.length - 1];
      const lowerBand = bb.lower[bb.lower.length - 1];
      const upperBand = bb.upper[bb.upper.length - 1];

      const bbDeviation = (currentPrice - lowerBand) / (upperBand - lowerBand);

      if (bbDeviation < this.config.bollingerBandThreshold) {
        buySignals++;
        signals.push('Price near lower Bollinger Band');
      } else if (bbDeviation > 1 - this.config.bollingerBandThreshold) {
        sellSignals++;
        signals.push('Price near upper Bollinger Band');
      }

      // Calculate confidence score (0-100)
      const totalSignals = 3; // RSI, MACD, BB
      const confidence = Math.max(buySignals, sellSignals) / totalSignals * 100;

      return {
        shouldBuy: buySignals > sellSignals && confidence >= 66,
        shouldSell: sellSignals > buySignals && confidence >= 66,
        confidence,
        signals
      };
    } catch (error) {
      logger.error('Market analysis error:', error);
      return {
        shouldBuy: false,
        shouldSell: false,
        confidence: 0,
        signals: ['Analysis failed']
      };
    }
  }

  async optimizeTradeSize(
    price: number,
    volatility: number,
    balance: number
  ): Promise<number> {
    try {
      // Kelly Criterion for position sizing
      const winRate = 0.55; // Historical win rate
      const profitRatio = 1.5; // Risk:Reward ratio
      
      const kellyPercentage = winRate - ((1 - winRate) / profitRatio);
      const adjustedKelly = kellyPercentage * 0.5; // Half Kelly for safety
      
      // Adjust position size based on volatility
      const volatilityAdjustment = Math.max(0.1, 1 - volatility);
      const positionSize = balance * adjustedKelly * volatilityAdjustment;

      return Math.min(positionSize, balance * 0.1); // Max 10% of balance
    } catch (error) {
      logger.error('Position size calculation error:', error);
      return 0;
    }
  }
}