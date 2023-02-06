import { WagmiConfig, createClient } from "wagmi";
import { getDefaultProvider } from "ethers";

const client = createClient({
  autoConnect: true,
  provider: getDefaultProvider(),
});

export const Web3Auth = ({ children }: { children: any }) => {
  return <WagmiConfig client={client}>{children}</WagmiConfig>;
};
