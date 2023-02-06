import type { AppProps } from "next/app";
import Head from "next/head";
import "ui/theme.a.css";
import { PKPConnectedProvider, ThemeA, Web3Auth } from "ui";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps | any) {
  return (
    <Web3Auth>
      <PKPConnectedProvider>
        <Toaster />
        <Head>
          <title>Lit Actions Event Listener</title>
        </Head>
        <ThemeA className="app" data-lit-theme="purple">
          <Component {...pageProps} />
        </ThemeA>
      </PKPConnectedProvider>
    </Web3Auth>
  );
}
