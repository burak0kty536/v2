import { EventEmitter } from 'events';
import { TechnicalIndicator } from '../indicators/TechnicalIndicators';
import { logger } from '../utils/logger';

interface PortfolioMetrics {
  totalValue: number;
  pnl: number;
  pnlPercent: number;
  volatility: number;
  sharpeRatio: number;
  drawdown: number;
  winRate: number;
}

interface Position {
  token: string;
  network: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
}

export class PortfolioAnalyzer extends EventEmitter {
  private positions: Map<string, Position> = new Map();
  private historicalMetrics: PortfolioMetrics[] = [];
  private readonly technicalIndicator: TechnicalIndicator;

  constructor(
    private readonly config: {
      riskFreeRate: number;
      updateInterval: number;
      historyLength: number;
    }
  ) {
    super();
    this.technicalIndicator = new TechnicalIndicator();
  }

  async analyzePortfolio(): Promise<PortfolioMetrics> {
    try {
      const positions = Array.from(this.positions.values());
      const totalValue = positions.reduce(
        (sum, pos) => sum + pos.amount * pos.currentPrice,
        0
      );

      const pnl = positions.reduce(
        (sum, pos) => sum + pos.amount * (pos.currentPrice - pos.entryPrice),
        0
      );

      const totalCost = positions.reduce(
        (sum, pos) => sum + pos.amount * pos.entryPrice,
        0
      );

      const pnlPercent = (pnl / totalCost) * 100;

      // Calculate volatility using historical data
      const returns = this.calculateDailyReturns();
      const volatility = this.calculateVolatility(returns);

      // Calculate Sharpe Ratio
      const sharpeRatio = this.calculateSharpeRatio(returns, volatility);

      // Calculate Maximum Drawdown
      const drawdown = this.calculateMaxDrawdown();

      // Calculate Win Rate
      const winRate = this.calculateWinRate();

      const metrics: PortfolioMetrics = {
        totalValue,
        pnl,
        pnlPercent,
        volatility,
        sharpeRatio,
        drawdown,
        winRate
      };

      this.historicalMetrics.push(metrics);
      if (this.historicalMetrics.length > this.config.historyLength) {
        this.historicalMetrics.shift();
      }

      return metrics;
    } catch (error) {
      logger.error('Portfolio analysis error:', error);
      throw error;
    }
  }

  private calculateDailyReturns(): number[] {
    const returns: number[] = [];
    for (let i = 1; i < this.historicalMetrics.length; i++) {
      const prevValue = this.historicalMetrics[i - 1].totalValue;
      const currentValue = this.historicalMetrics[i].totalValue;
      returns.push((currentValue - prevValue) / prevValue);
    }
    return returns;
  }

  private calculateVolatility(returns: number[]): number {
    if (returns.length === 0) return 0;
    const mean = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const squaredDiffs = returns.map(r => Math.pow(r - mean, 2));
    const variance = squaredDiffs.reduce((sum, d) => sum + d, 0) / returns.length;
    return Math.sqrt(variance * 252); // Annualized volatility
  }

  private calculateSharpeRatio(returns: number[], volatility: number): number {
    if (returns.length === 0 || volatility === 0) return 0;
    const meanReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const excessReturn = meanReturn - this.config.riskFreeRate / 252;
    return (excessReturn * Math.sqrt(252)) / volatility;
  }

  private calculateMaxDrawdown(): number {
    if (this.historicalMetrics.length === 0) return 0;
    
    let maxDrawdown = 0;
    let peak = this.historicalMetrics[0].totalValue;

    for (const metrics of this.historicalMetrics) {
      if (metrics.totalValue > peak) {
        peak = metrics.totalValue;
      }
      const drawdown = (peak - metrics.totalValue) / peak;
      maxDrawdown = Math.max(maxDrawdown, drawdown);
    }

    return maxDrawdown * 100;
  }

  private calculateWinRate(): number {
    if (this.historicalMetrics.length < 2) return 0;
    
    let wins = 0;
    for (let i = 1; i < this.historicalMetrics.length; i++) {
      if (this.historicalMetrics[i].pnl > this.historicalMetrics[i - 1].pnl) {
        wins++;
      }
    }
    
    return (wins / (this.historicalMetrics.length - 1)) * 100;
  }

  addPosition(position: Position): void {
    const id = `${position.network}-${position.token}`;
    this.positions.set(id, position);
  }

  updatePosition(id: string, updates: Partial<Position>): void {
    const position = this.positions.get(id);
    if (position) {
      this.positions.set(id, { ...position, ...updates });
    }
  }

  removePosition(id: string): void {
    this.positions.delete(id);
  }

  getPositions(): Position[] {
    return Array.from(this.positions.values());
  }

  getHistoricalMetrics(): PortfolioMetrics[] {
    return this.historicalMetrics;
  }
}