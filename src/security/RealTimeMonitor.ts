import { EventEmitter } from 'events';
import { logger } from '../utils/logger';
import { DexScreenerService } from '../integrations/DexScreenerService';

export class RealTimeMonitor extends EventEmitter {
  private readonly dexScreener: DexScreenerService;
  private readonly monitoredTokens: Set<string> = new Set();
  private readonly alertThresholds: Map<string, {
    priceChange: number;
    volumeChange: number;
    liquidityChange: number;
  }> = new Map();

  constructor(
    private readonly config: {
      updateInterval: number;
      defaultPriceThreshold: number;
      defaultVolumeThreshold: number;
      defaultLiquidityThreshold: number;
    }
  ) {
    super();
    this.dexScreener = new DexScreenerService('YOUR_API_KEY');
  }

  async startMonitoring(token: string, customThresholds?: {
    priceChange?: number;
    volumeChange?: number;
    liquidityChange?: number;
  }): Promise<void> {
    this.monitoredTokens.add(token);
    this.alertThresholds.set(token, {
      priceChange: customThresholds?.priceChange || this.config.defaultPriceThreshold,
      volumeChange: customThresholds?.volumeChange || this.config.defaultVolumeThreshold,
      liquidityChange: customThresholds?.liquidityChange || this.config.defaultLiquidityThreshold
    });

    await this.dexScreener.addToken(token);
    this.setupListeners(token);
  }

  private setupListeners(token: string): void {
    this.dexScreener.on('priceUpdate', (update) => {
      if (update.token === token) {
        this.analyzePriceMovement(update);
      }
    });

    this.dexScreener.on('volumeUpdate', (update) => {
      if (update.token === token) {
        this.analyzeVolumeChange(update);
      }
    });

    this.dexScreener.on('liquidityUpdate', (update) => {
      if (update.token === token) {
        this.analyzeLiquidityChange(update);
      }
    });
  }

  private analyzePriceMovement(update: any): void {
    const thresholds = this.alertThresholds.get(update.token);
    if (!thresholds) return;

    const priceChange = ((update.currentPrice - update.previousPrice) / update.previousPrice) * 100;

    if (Math.abs(priceChange) >= thresholds.priceChange) {
      this.emit('significantPriceMove', {
        token: update.token,
        priceChange,
        currentPrice: update.currentPrice,
        previousPrice: update.previousPrice,
        timestamp: Date.now()
      });
    }
  }

  private analyzeVolumeChange(update: any): void {
    const thresholds = this.alertThresholds.get(update.token);
    if (!thresholds) return;

    const volumeChange = ((update.currentVolume - update.previousVolume) / update.previousVolume) * 100;

    if (Math.abs(volumeChange) >= thresholds.volumeChange) {
      this.emit('significantVolumeChange', {
        token: update.token,
        volumeChange,
        currentVolume: update.currentVolume,
        previousVolume: update.previousVolume,
        timestamp: Date.now()
      });
    }
  }

  private analyzeLiquidityChange(update: any): void {
    const thresholds = this.alertThresholds.get(update.token);
    if (!thresholds) return;

    const liquidityChange = ((update.currentLiquidity - update.previousLiquidity) / update.previousLiquidity) * 100;

    if (Math.abs(liquidityChange) >= thresholds.liquidityChange) {
      this.emit('significantLiquidityChange', {
        token: update.token,
        liquidityChange,
        currentLiquidity: update.currentLiquidity,
        previousLiquidity: update.previousLiquidity,
        timestamp: Date.now()
      });
    }
  }

  stopMonitoring(token: string): void {
    this.monitoredTokens.delete(token);
    this.alertThresholds.delete(token);
    this.dexScreener.removeToken(token);
  }

  stopAll(): void {
    this.monitoredTokens.clear();
    this.alertThresholds.clear();
    this.removeAllListeners();
  }
}</content>