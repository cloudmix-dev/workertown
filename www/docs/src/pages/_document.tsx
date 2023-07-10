import { Head, Html, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html className="antialiased [font-feature-settings:'ss01']" lang="en">
      <Head />
      <body className="bg-white dark:bg-zinc-900">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
