# Lit x WalletConnect V2 Example ⚡️

Discover how to build a decentralized self-custody wallet without the complexity of private key management using Lit and WalletConnect V2 SDKs. Dive into this example to learn how to deliver a secure and seamless wallet experience for users.

> ⚠️ **Important**
>
> Please only use this for reference and development purposes, otherwise you are at risk of losing your funds.

# Useful links

🔗 Live dapp to test against - https://react-app.walletconnect.com <br />
📚 Lit Protocol docs - https://developer.litprotocol.com/ <br />
📚 WalletConnect docs - https://docs.walletconnect.com/2.0

## Getting started

This example is built atop of [WalletConnect's Web3Wallet Next.js example](https://github.com/WalletConnect/web-examples/tree/main/wallets/react-web3wallet). Follow the steps below to set up your local environment.

1. Go to [WalletConnect Cloud](https://cloud.walletconnect.com/sign-in) and obtain a project id

2. Add your project details in [WalletConnectUtil.ts](https://github.com/WalletConnect/web-examples/blob/main/wallets/react-wallet-v2/src/utils/WalletConnectUtil.ts) file

3. Install dependencies `yarn install` or `npm install`

4. Setup your environment variables

```bash
cp .env.local.example .env.local
```

Your `.env.local` now contains the following environment variables:

- `NEXT_PUBLIC_PROJECT_ID` (placeholder) - You can generate your own ProjectId at https://cloud.walletconnect.com
- `NEXT_PUBLIC_RELAY_URL` (already set)

5. Run `yarn dev` or `npm run dev` to start local development