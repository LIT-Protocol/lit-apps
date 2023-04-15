const { ethers } = require("ethers");

async function getEthereumPrice() {
  const provider = new ethers.providers.InfuraProvider(
    "mainnet",
    "https://eth.llamarpc.com"
  );
  const abi = ["function getLatestETHPrice() external view returns (uint256)"];
  const address = "0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419"; // Aggregator contract address for ETH/USD pair on Chainlink
  const aggregator = new ethers.Contract(address, abi, provider);
  const latestPrice = await aggregator.getLatestETHPrice();
  return parseFloat(ethers.utils.formatUnits(latestPrice, 8));
}
(async () => {
  const price = await getEthereumPrice();

  console.log(price);
})();
