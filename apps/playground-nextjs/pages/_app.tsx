import type { AppProps } from "next/app";
// import "@getlit/ui/theme.demo.css";
import PlausibleProvider from "next-plausible";
import { Web3Auth } from "@getlit/ui";

const DOMAIN = "demo.getlit.dev";

export default function App({ Component, pageProps }: AppProps | any) {
  return (
    <PlausibleProvider domain={DOMAIN}>
      <Component {...pageProps} />;
    </PlausibleProvider>
  );
}
