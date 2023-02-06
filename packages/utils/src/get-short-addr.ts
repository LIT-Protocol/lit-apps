export const getShortAddress = (
  address: string | undefined,
  start = 6,
  end = 4
) => {
  if (!address) {
    return `address is undefined`;
  }

  return address.slice(0, start) + "..." + address.slice(-end);
};
