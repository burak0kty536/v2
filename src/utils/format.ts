export const formatAddress = (address: string): string => {
  if (!address) return '';
  return address.length > 12 ? `${address.slice(0, 6)}...${address.slice(-4)}` : address;
};

export const formatBalance = (balance: string, decimals: number = 4): string => {
  const num = parseFloat(balance);
  if (isNaN(num)) return '0';
  return num.toFixed(decimals);
};