import type { AppProps } from "next/app";
import Head from "next/head";
import { ThemeA } from "ui";

export default function App({ Component, pageProps }: AppProps | any) {
  return (
    <>
      <Head>
        <title>Lit Actions Event Listener</title>
      </Head>
      <ThemeA>
        <main className="app">
          <Component {...pageProps} />
        </main>
      </ThemeA>
    </>
  );
}
