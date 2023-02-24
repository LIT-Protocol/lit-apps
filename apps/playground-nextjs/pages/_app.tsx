import type { AppProps } from "next/app";
import "ui/theme.demo.css";

export default function App({ Component, pageProps }: AppProps | any) {
  return <Component {...pageProps} />;
}
