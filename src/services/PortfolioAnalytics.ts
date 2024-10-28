import { EventEmitter } from 'events';
import { DexScreenerService } from '../integrations/DexScreenerService';
import { logger } from '../utils/logger';

interface Position {
  token: string;
  network: string;
  amount: number;
  entryPrice: number;
  currentPrice: number;
}

export class PortfolioAnalytics extends EventEmitter {
  private positions: Map<string, Position> = new Map();
  private dexScreener: DexScreenerService;

  constructor(
    private readonly config: {
      updateInterval: number;
      profitThreshold: number;
      lossThreshold: number;
    }
  ) {
    super();
    this.dexScreener = new DexScreenerService('YOUR_API_KEY');
  }

  async start(): Promise<void> {
    setInterval(() => this.updatePositions(), this.config.updateInterval);
  }

  private async updatePositions(): Promise<void> {
    for (const [id, position] of this.positions.entries()) {
      try {
        const currentPrice = await this.dexScreener.getTokenPrice(
          position.token,
          position.network
        );

        const oldPrice = position.currentPrice;
        const priceChange = ((currentPrice - oldPrice) / oldPrice) * 100;
        const totalValue = position.amount * currentPrice;
        const pnl = ((currentPrice - position.entryPrice) / position.entryPrice) * 100;

        // Update position
        position.currentPrice = currentPrice;
        this.positions.set(id, position);

        // Emit events for significant changes
        if (Math.abs(priceChange) >= this.config.profitThreshold) {
          this.emit('significantPriceChange', {
            token: position.token,
            network: position.network,
            priceChange,
            totalValue
          });
        }

        if (pnl <= -this.config.lossThreshold) {
          this.emit('significantLoss', {
            token: position.token,
            network: position.network,
            pnl,
            totalValue
          });
        }
      } catch (error) {
        logger.error(`Failed to update position ${id}:`, error);
      }
    }
  }

  addPosition(
    token: string,
    network: string,
    amount: number,
    entryPrice: number
  ): void {
    const id = `${network}-${token}`;
    this.positions.set(id, {
      token,
      network,
      amount,
      entryPrice,
      currentPrice: entryPrice
    });
  }

  removePosition(token: string, network: string): void {
    const id = `${network}-${token}`;
    this.positions.delete(id);
  }

  getPortfolioStats(): {
    totalValue: number;
    totalPnL: number;
    positions: Position[];
  } {
    let totalValue = 0;
    let totalCost = 0;

    const positions = Array.from(this.positions.values());
    positions.forEach(position => {
      totalValue += position.amount * position.currentPrice;
      totalCost += position.amount * position.entryPrice;
    });

    const totalPnL = ((totalValue - totalCost) / totalCost) * 100;

    return {
      totalValue,
      totalPnL,
      positions
    };
  }

  stop(): void {
    this.removeAllListeners();
  }
}