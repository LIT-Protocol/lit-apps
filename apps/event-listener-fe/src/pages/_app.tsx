import type { AppProps } from "next/app";
import Head from "next/head";
import "ui/theme.a.css";
import { PKPConnectionContext, ThemeA, Web3Auth } from "ui";
import { Toaster } from "react-hot-toast";

export default function App({ Component, pageProps }: AppProps | any) {
  return (
    <Web3Auth>
      <PKPConnectionContext>
        <Toaster />
        <Head>
          <title>Lit Actions Event Listener</title>
        </Head>
        <ThemeA className="app" data-lit-theme="purple">
          <Component {...pageProps} />
        </ThemeA>
      </PKPConnectionContext>
    </Web3Auth>
  );
}
