import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import Highlight, { type Language, defaultProps } from "prism-react-renderer";
import { Fragment } from "react";

import blurCyanImage from "../../images/blur-cyan.png";
import blurIndigoImage from "../../images/blur-indigo.png";
import { Button } from "../atoms/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../atoms/tabs";

const tabs = [
  {
    name: "worker.ts",
    content: `import { search } from "@workertown/search";

export default search();

// ⬆️ Production-ready search index REST API...
// It really is that simple!
`,
    language: "javascript",
  },
  {
    name: "package.json",
    content: `{
  "name": "search-example",
  "private": true,
  "scripts": {
    "start": "wrangler dev"
  },
  "dependencies": {
    "@workertown/search": "latest"
  },
  "devDependencies": {
    "wrangler": "latest"
  }
} 
`,
    language: "json",
  },
  {
    name: "wrangler.toml",
    content: `name = "search-example"
main = "src/worker.ts"
compatibility_date = "2023-07-01"

[[kv_namespaces]]
binding = "CACHE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[d1_databases]]
binding = "DB"
database_name = "search_example"
database_id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
`,
    language: "clike",
  },
];

interface TrafficLightsIconProps extends React.SVGProps<SVGSVGElement> {}

function TrafficLightsIcon(props: TrafficLightsIconProps) {
  return (
    <svg aria-hidden="true" viewBox="0 0 42 10" fill="none" {...props}>
      <circle cx="5" cy="5" r="4.5" fill="#ef4444" />
      <circle cx="21" cy="5" r="4.5" fill="#fbbf24" />
      <circle cx="37" cy="5" r="4.5" fill="#22c55e" />
    </svg>
  );
}

interface ExampleCodeProps {
  code: string;
  language: Language;
}

function ExampleCode({ code, language }: ExampleCodeProps) {
  return (
    <div className="mt-6 flex items-start px-1 text-sm">
      <div
        aria-hidden="true"
        className="select-none border-r border-zinc-300/5 pr-4 font-mono text-zinc-600"
      >
        {Array.from({
          length: code.split("\n").length,
        }).map((_, index) => (
          <Fragment key={index}>
            {(index + 1).toString().padStart(2, "0")}
            <br />
          </Fragment>
        ))}
      </div>
      <Highlight
        {...defaultProps}
        code={code}
        language={language}
        theme={undefined}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={clsx(className, "flex overflow-x-auto pb-6")}
            style={style}
          >
            <code className="px-4">
              {tokens.map((line, lineIndex) => (
                <div key={lineIndex} {...getLineProps({ line })}>
                  {line.map((token, tokenIndex) => (
                    <span key={tokenIndex} {...getTokenProps({ token })} />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}

export function Hero() {
  return (
    <div className="overflow-hidden bg-zinc-900 dark:-mb-32 dark:mt-[-4.5rem] dark:pb-32 dark:pt-[4.5rem] dark:lg:mt-[-4.75rem] dark:lg:pt-[4.75rem]">
      <div className="py-16 sm:px-2 lg:relative lg:px-0 lg:py-20">
        <div className="mx-auto grid max-w-2xl grid-cols-1  gap-x-8 gap-y-16 px-4 lg:max-w-8xl lg:grid-cols-2 lg:px-8 xl:gap-x-16 xl:px-12">
          <div className="relative z-10 md:text-center lg:text-left">
            <Image
              className="absolute bottom-full right-full -mb-56 -mr-72 opacity-50"
              src={blurCyanImage}
              alt=""
              width={530}
              height={530}
              unoptimized
              priority
            />
            <div className="relative">
              <p className="font-display text-5xl font-black uppercase leading-none text-zinc-50 sm:text-6xl xl:text-7xl">
                Workertown
              </p>
              <p className="mt-3 text-2xl tracking-tight text-zinc-400">
                Out-of-the-box, Cloudflare Worker compatible services for
                scalable, modern edge architecture.
              </p>
              <div className="mt-8 flex gap-4 md:justify-center lg:justify-start">
                <Button
                  asChild
                  className="bg-zinc-50 text-zinc-900 hover:bg-zinc-50/90"
                >
                  <Link href="/">Get started</Link>
                </Button>
                <Button
                  variant="secondary"
                  asChild
                  className="bg-zinc-800 text-zinc-50 hover:bg-zinc-800/80"
                >
                  <Link href="/">View on Github</Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="relative lg:static xl:pl-10">
            <div className="relative">
              <Image
                className="absolute -right-64 -top-64"
                src={blurCyanImage}
                alt=""
                width={530}
                height={530}
                unoptimized
                priority
              />
              <Image
                className="absolute -bottom-40 -right-44"
                src={blurIndigoImage}
                alt=""
                width={567}
                height={567}
                unoptimized
                priority
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-300 via-indigo-300/70 to-indigo-300 opacity-10 blur-lg" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-indigo-300 via-indigo-300/70 to-indigo-300 opacity-10" />
              <Tabs defaultValue="worker.ts">
                <div className="relative rounded-2xl bg-zinc-950/80 ring-1 ring-white/10 backdrop-blur">
                  <div className="absolute -top-px left-20 right-11 h-px bg-gradient-to-r from-indigo-300/0 via-indigo-300/70 to-indigo-300/0" />
                  <div className="absolute -bottom-px left-11 right-20 h-px bg-gradient-to-r from-indigo-400/0 via-indigo-400 to-indigo-400/0" />
                  <div className="px-4 pt-4">
                    <TrafficLightsIcon className="h-2.5 w-auto stroke-zinc-500/30" />
                    <TabsList className="mt-4 flex space-x-2 text-xs justify-start bg-transparent dark:bg-transparent">
                      {tabs.map((tab) => (
                        <TabsTrigger
                          key={tab.name}
                          value={tab.name}
                          className="border border-transparent ring-offset-zinc-950 focus-visible:ring-zinc-800 data-[state=active]:bg-zinc-950 data-[state=active]:text-zinc-50 data-[state=active]:border-indigo-500 hover:border-zinc-700"
                        >
                          {tab.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {tabs.map((tab) => (
                      <TabsContent key={tab.name} value={tab.name}>
                        <ExampleCode
                          code={tab.content}
                          language={tab.language as Language}
                        />
                      </TabsContent>
                    ))}
                  </div>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
