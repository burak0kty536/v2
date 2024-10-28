import React, { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { DexScreenerService } from '../integrations/DexScreenerService';

Chart.register(...registerables);

interface PriceChartProps {
  tokenAddress: string;
  timeframe: '1h' | '24h' | '7d';
}

export const PriceChart: React.FC<PriceChartProps> = ({ tokenAddress, timeframe }) => {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    if (!chartRef.current) return;

    const ctx = chartRef.current.getContext('2d');
    if (!ctx) return;

    const createChart = (data: any) => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      chartInstance.current = new Chart(ctx, {
        type: 'line',
        data: {
          labels: data.timestamps,
          datasets: [{
            label: 'Price',
            data: data.prices,
            borderColor: 'rgb(59, 130, 246)',
            tension: 0.1,
            fill: false
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          },
          scales: {
            x: {
              display: true,
              title: {
                display: true,
                text: 'Time'
              }
            },
            y: {
              display: true,
              title: {
                display: true,
                text: 'Price (USD)'
              }
            }
          }
        }
      });
    };

    const loadChartData = async () => {
      try {
        const dexScreener = new DexScreenerService('YOUR_API_KEY');
        const tokenInfo = await dexScreener.getPairInfo(tokenAddress);
        
        // Transform data for chart
        const data = {
          timestamps: tokenInfo.priceHistory.map((p: any) => new Date(p.timestamp).toLocaleTimeString()),
          prices: tokenInfo.priceHistory.map((p: any) => p.price)
        };

        createChart(data);
      } catch (error) {
        console.error('Failed to load chart data:', error);
      }
    };

    loadChartData();

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [tokenAddress, timeframe]);

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <canvas ref={chartRef} />
    </div>
  );
};