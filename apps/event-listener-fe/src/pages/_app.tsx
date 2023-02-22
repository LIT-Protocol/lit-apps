import type { AppProps } from "next/app";
import Head from "next/head";
import "ui/theme.purple.css";
import { LitHeaderV1, PKPConnectionContext, ThemeA, Web3Auth } from "ui";
import { Toaster } from "react-hot-toast";
import { hotjar } from "react-hotjar";
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps | any) {
  const appName = `Lit Actions Event Listener`;

  useEffect(() => {
    hotjar.initialize(3378726, 6);
  }, []);

  return (
    <Web3Auth>
      <PKPConnectionContext>
        <Toaster />
        <Head>
          <title>{appName}</title>
        </Head>
        <ThemeA className="app" data-lit-theme="purple">
          <LitHeaderV1 title={appName} />
          <Component {...pageProps} />
        </ThemeA>
      </PKPConnectionContext>
    </Web3Auth>
  );
}
