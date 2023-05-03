import { jsx as _jsx } from "react/jsx-runtime";
import { WagmiConfig, createClient } from "wagmi";
import { getDefaultProvider } from "ethers";
const client = createClient({
    autoConnect: true,
    provider: getDefaultProvider(),
});
export const Web3Auth = ({ children }) => {
    return _jsx(WagmiConfig, Object.assign({ client: client }, { children: children }));
};
