export const NETWORKS = {
  SOLANA: {
    RPC_URL: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    WSS_URL: process.env.SOLANA_WSS_URL,
    CHAIN_ID: 'mainnet-beta'
  },
  BSC: {
    RPC_URL: process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org',
    WSS_URL: process.env.BSC_WSS_URL,
    CHAIN_ID: 56
  },
  ETH: {
    RPC_URL: process.env.ETH_RPC_URL || 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
    WSS_URL: process.env.ETH_WSS_URL,
    CHAIN_ID: 1
  }
};

export const DEFAULT_GAS_LIMIT = 300000;
export const DEFAULT_GAS_PRICE = '5000000000'; // 5 gwei