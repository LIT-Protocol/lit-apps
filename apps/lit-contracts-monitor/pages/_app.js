import Head from "next/head";
import "./globals.css";
import { MantineProvider } from "@mantine/core";
import "@getlit/ui/theme.purple.css";

export default function App(props) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>Lit Protocol:: Contracts</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />

        <meta
          name="description"
          content="Get the latest Lit Protocol contracts and ABIs"
        />
      </Head>

      <MantineProvider
        withGlobalStyles
        withNormalizeCSS
        theme={{
          /** Put your mantine theme override here */
          colorScheme: "dark",
        }}
      >
        <Component {...pageProps} />
      </MantineProvider>
    </>
  );
}
