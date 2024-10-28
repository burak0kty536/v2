export const NETWORKS = {
  ETH: {
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR-PROJECT-ID',
    wssUrl: 'wss://mainnet.infura.io/ws/v3/YOUR-PROJECT-ID',
    chainId: 1,
    blockExplorer: 'https://etherscan.io',
    nativeCurrency: {
      symbol: 'ETH',
      decimals: 18
    }
  },
  BSC: {
    name: 'BNB Smart Chain',
    rpcUrl: 'https://bsc-dataseed.binance.org',
    wssUrl: 'wss://bsc-ws-node.nariox.org',
    chainId: 56,
    blockExplorer: 'https://bscscan.com',
    nativeCurrency: {
      symbol: 'BNB',
      decimals: 18
    }
  },
  SOLANA: {
    name: 'Solana',
    rpcUrl: 'https://api.mainnet-beta.solana.com',
    wssUrl: 'wss://api.mainnet-beta.solana.com',
    commitment: 'confirmed',
    blockExplorer: 'https://explorer.solana.com',
    nativeCurrency: {
      symbol: 'SOL',
      decimals: 9
    }
  }
} as const;

export const DEFAULT_GAS_LIMIT = 300000;
export const DEFAULT_GAS_PRICE = '5000000000'; // 5 gwei

export const getNetworkConfig = (network: keyof typeof NETWORKS) => {
  const config = NETWORKS[network];
  if (!config) {
    throw new Error(`Network ${network} not supported`);
  }
  return config;
};

export const isValidNetwork = (network: string): network is keyof typeof NETWORKS => {
  return network in NETWORKS;
};