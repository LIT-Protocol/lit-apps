import { Contract, ethers } from "ethers";

export class ERC20 {
  // get decimals
  static async getDecimals(
    tokenAddress: string,
    provider: ethers.providers.JsonRpcProvider
  ): Promise<number> {
    const contract = new Contract(
      tokenAddress,
      ["function decimals() view returns (uint8)"],
      provider
    );

    const decimals = await contract.decimals();

    return decimals;
  }

  static async getBalance(
    tokenAddress: string,
    provider: ethers.providers.JsonRpcProvider,
    address: string
  ): Promise<string> {
    const contract = new Contract(
      tokenAddress,
      ["function balanceOf(address) view returns (uint256)"],
      provider
    );

    const balance = await contract.balanceOf(address);

    return balance;
  }

  static async getValue(
    tokenAddress: string,
    provider: ethers.providers.JsonRpcProvider
  ): Promise<string> {
    const contract = new Contract(
      tokenAddress,
      "function getPair(address tokenA, address tokenB) external view returns (address pair)",
      provider
    );
    const price = await contract.kLast();

    return price;
  }
}
