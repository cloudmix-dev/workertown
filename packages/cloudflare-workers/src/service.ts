import {
  type CfProperties,
  type Fetcher,
  type RequestInfo,
  type RequestInit,
  type Response,
} from "@cloudflare/workers-types";

import { type Service } from "./types.js";

interface ServiceOptions {
  fetch?: Fetcher["fetch"];
}

export function service(
  url: string,
  fetcher?: Fetcher | null,
  options?: ServiceOptions,
) {
  const fetch = (fetcher?.fetch ??
    options?.fetch ??
    globalThis.fetch) as Fetcher["fetch"];
  const urlObj = new URL(url);

  return {
    fetch: (
      input: RequestInfo<unknown, CfProperties<unknown>> | URL,
      init?: RequestInit | undefined,
    ): Promise<Response> => {
      let url = new URL(urlObj);

      if (typeof input === "string") {
        if (!input.startsWith("http://") && !input.startsWith("https://")) {
          url.pathname = `${url.pathname}/${input.replace(/^\//, "")}`;
        } else {
          url = new URL(input);
        }
      } else if (input instanceof URL) {
        url = input;
      } else if (input instanceof Request) {
        url = new URL(input.url);
      }

      const request = new Request(
        url,
        input instanceof Request ? input : undefined,
      ) as unknown as RequestInfo<unknown, CfProperties<unknown>>;

      return fetch(request, init);
    },
  } as Service;
}
