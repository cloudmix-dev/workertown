import Image from "next/image";
import Link from "next/link";
import { type Language } from "prism-react-renderer";

import blurCyanImage from "../../images/blur-cyan.png";
import blurIndigoImage from "../../images/blur-indigo.png";
import { Button } from "../atoms/button";
import { CodeBlock } from "../atoms/code-block";
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
    "start": "wrangler dev",
    "publish": "wrangler publish"
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
main = "worker.ts"

[[kv_namespaces]]
binding = "SEARCH_CACHE"
id = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

[[d1_databases]]
binding = "SEARCH_DB"
database_name = "search-example"
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
              <div className="relative">
                <div>
                  <h1 className="font-display text-4xl font-black uppercase leading-none sm:text-6xl xl:text-7xl">
                    <span className="bg-gradient-to-br from-zinc-100 via-zinc-100 to-zinc-400 bg-clip-text text-transparent">
                      Workertown
                    </span>
                  </h1>
                  <span className="uppercase leading-none text-zinc-100 sm:ml-[19.5rem] sm:text-lg xl:ml-[23.8rem] xl:text-xl">
                    {" "}
                    from &nbsp;
                    <Link
                      href="https://cloudmix.dev"
                      target="_blank"
                      className="font-display font-extrabold"
                    >
                      Cloudmix
                    </Link>
                  </span>
                </div>
                <div className="absolute left-[80%] top-0 flex h-full w-full">
                  <div className="h-full w-36 bg-gradient-to-r from-transparent to-zinc-900"></div>
                  <div className="h-full flex-grow :bg-zinc-900"></div>
                </div>
              </div>
              <p className="mt-3 text-lg tracking-tight text-zinc-400 md:text-xl">
                Out-of-the-box, edge runtime compatible services for scalable,
                modern architectures.
              </p>
              <div className="mt-8 flex gap-4 md:justify-center lg:justify-start">
                <Button
                  asChild
                  className="bg-zinc-50 text-zinc-900 hover:bg-zinc-50/90"
                >
                  <Link href="/#quick-start">Get started</Link>
                </Button>
                <Button
                  variant="secondary"
                  asChild
                  className="bg-zinc-800 text-zinc-50 hover:bg-zinc-800/80"
                >
                  <Link
                    href="https://github.com/cloudmix-dev/workertown"
                    target="_blank"
                  >
                    View on Github
                  </Link>
                </Button>
              </div>
            </div>
          </div>
          <div className="relative z-10 lg:static xl:pl-10">
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
                    <TabsList className="flex justify-start space-x-2 mt-4 p-0 bg-transparent text-xs dark:bg-transparent">
                      {tabs.map((tab) => (
                        <TabsTrigger
                          key={tab.name}
                          value={tab.name}
                          className="ring-offset-zinc-950 focus-visible:ring-zinc-800 data-[state=active]:bg-indigo-950 data-[state=active]:text-indigo-50 hover:bg-zinc-900 dark:data-[state=active]:bg-indigo-950 dark:data-[state=active]:text-indigo-50"
                        >
                          {tab.name}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                    {tabs.map((tab) => (
                      <TabsContent
                        key={tab.name}
                        value={tab.name}
                        className="m-0"
                      >
                        <div className="mt-4 lg:mt-6">
                          <CodeBlock
                            code={tab.content}
                            language={tab.language as Language}
                          />
                        </div>
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
