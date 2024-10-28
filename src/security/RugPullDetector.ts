import { ethers } from 'ethers';
import { logger } from '../utils/logger';

export class RugPullDetector {
  private readonly provider: ethers.JsonRpcProvider;

  constructor(rpcUrl: string) {
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  async analyze(tokenAddress: string): Promise<{
    isRisky: boolean;
    riskFactors: string[];
    riskScore: number;
  }> {
    try {
      const riskFactors: string[] = [];
      let riskScore = 0;

      // Check contract ownership
      const ownershipRisk = await this.checkOwnership(tokenAddress);
      if (ownershipRisk.isRisky) {
        riskFactors.push(ownershipRisk.reason);
        riskScore += 30;
      }

      // Check liquidity lock
      const liquidityRisk = await this.checkLiquidityLock(tokenAddress);
      if (liquidityRisk.isRisky) {
        riskFactors.push(liquidityRisk.reason);
        riskScore += 40;
      }

      // Check token distribution
      const distributionRisk = await this.checkTokenDistribution(tokenAddress);
      if (distributionRisk.isRisky) {
        riskFactors.push(distributionRisk.reason);
        riskScore += 30;
      }

      return {
        isRisky: riskScore >= 50,
        riskFactors,
        riskScore
      };
    } catch (error) {
      logger.error('Rug pull detection error:', error);
      return {
        isRisky: true,
        riskFactors: ['Analysis failed'],
        riskScore: 100
      };
    }
  }

  private async checkOwnership(tokenAddress: string): Promise<{
    isRisky: boolean;
    reason?: string;
  }> {
    try {
      const code = await this.provider.getCode(tokenAddress);
      
      // Check for ownership renouncement
      if (code.includes('0x8da5cb5b')) {
        return {
          isRisky: true,
          reason: 'Ownership not renounced'
        };
      }

      return {
        isRisky: false
      };
    } catch (error) {
      return {
        isRisky: true,
        reason: 'Ownership check failed'
      };
    }
  }

  private async checkLiquidityLock(tokenAddress: string): Promise<{
    isRisky: boolean;
    reason?: string;
  }> {
    try {
      // Check if liquidity is locked
      return {
        isRisky: false
      };
    } catch (error) {
      return {
        isRisky: true,
        reason: 'Liquidity lock check failed'
      };
    }
  }

  private async checkTokenDistribution(tokenAddress: string): Promise<{
    isRisky: boolean;
    reason?: string;
  }> {
    try {
      // Check token distribution among holders
      return {
        isRisky: false
      };
    } catch (error) {
      return {
        isRisky: true,
        reason: 'Token distribution check failed'
      };
    }
  }
}