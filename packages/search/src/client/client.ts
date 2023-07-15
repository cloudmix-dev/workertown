import { type WorkertownHono } from "@workertown/hono";
import { type DeepPartial } from "@workertown/internal-types";
import { hc } from "hono/client";
import merge from "lodash.merge";
import { type MatchInfo, type Suggestion } from "minisearch";

import { type Context } from "../types.js";

interface ClientOptions {
  fetch?: typeof fetch;
  prefixes: {
    admin: string;
    items: string;
    public: string;
    search: string;
    suggest: string;
    tags: string;
  };
}

type ClientOptionsOptional = DeepPartial<ClientOptions>;

const DEFAULT_OPTIONS: ClientOptions = {
  prefixes: {
    admin: "/v1/admin",
    items: "/v1/items",
    public: "/",
    search: "/v1/search",
    suggest: "/v1/suggest",
    tags: "/v1/tags",
  },
};

export class SearchClient {
  private readonly _options: ClientOptions;

  private readonly _url: string;

  constructor(url: string, options?: ClientOptionsOptional) {
    this._url = url.replace(/\/$/, "");
    this._options = merge(DEFAULT_OPTIONS, options);
  }

  private _createClient<T extends WorkertownHono<Context>>(route: string) {
    const formattedUrl = this._url.endsWith("/") ? this._url : `${this._url}/`;
    const formattedRoute = route.startsWith("/") ? route.slice(1) : route;

    return hc<T>(`${formattedUrl}${formattedRoute}`, {
      fetch: this._options.fetch ?? fetch,
    });
  }

  get admin() {
    return {
      getInfo: async () => {
        const client = this._createClient(this._options.prefixes.admin);
        const res = await (client as any).info.$get();
        const { data } = await res.json();

        return data;
      },
      runMigrations: async () => {
        const client = this._createClient(this._options.prefixes.admin);
        const res = await (client as any).migrate.$post();
        const { data } = await res.json();

        return data;
      },
    };
  }

  get public() {
    return {
      openApi: async () => {
        const client = this._createClient(this._options.prefixes.public);
        const res = await (client as any)["open-api.json"].$get();
        const result = await res.json();

        return result;
      },
      health: async () => {
        const client = this._createClient(this._options.prefixes.public);
        const res = await (client as any).health.$get();
        const result = await res.json();

        return result;
      },
    };
  }

  get items() {
    return {
      deleteItem: async (id: string) => {
        const client = this._createClient(this._options.prefixes.items);
        const res = await (client as any)[":id"].$delete({ param: { id } });
        const { data } = await res.json();

        return data;
      },
      getItem: async (id: string) => {
        const client = this._createClient(this._options.prefixes.items);
        const res = await (client as any)[":id"].$get({ param: { id } });
        const { data } = await res.json();

        return data;
      },
      indexItem: async (
        id: string,
        item: {
          data: Record<string, unknown>;
          index: string;
          tenant: string;
          tags?: string[];
        }
      ) => {
        const client = this._createClient(this._options.prefixes.items);
        const res = await (client as any)[":id"].$put({
          param: { id },
          json: item,
        });
        const { data } = await res.json();

        return data;
      },
    };
  }

  get search() {
    return {
      search: async (
        term: string,
        options: {
          tenant: string;
          index?: string;
          fields?: string[];
          tags?: [];
        }
      ) => {
        const { tenant, index, fields, tags } = options;
        const client = this._createClient(this._options.prefixes.search);
        // TODO: Fix this `any` when Hono fixes type inference
        const res = await (client as any)[":tenant"][":index?"].$get({
          param: { tenant, index },
          query: {
            term,
            fields: fields?.join(","),
            tags: tags?.join(","),
          },
        });
        const { data } = await res.json();

        // TODO: remove this hard coded typing when above is fixed
        return data as {
          id: any;
          item: any;
          score: number;
          terms: string[];
          match: MatchInfo;
        }[];
      },
    };
  }

  get suggest() {
    return {
      suggest: async (
        term: string,
        options: {
          tenant: string;
          index?: string;
          fields?: string[];
          tags?: [];
        }
      ) => {
        const { tenant, index, fields, tags } = options;
        const client = this._createClient(this._options.prefixes.suggest);
        // TODO: Fix this `any` when Hono fixes type inference
        const res = await (client as any)[":tenant"][":index?"].$get({
          param: { tenant, index },
          query: {
            term,
            fields: fields?.join(","),
            tags: tags?.join(","),
          },
        });
        const { data } = await res.json();

        // TODO: remove this hard coded typing when above is fixed
        return data as Suggestion[];
      },
    };
  }

  get tags() {
    return {
      getTags: async () => {
        const client = this._createClient(this._options.prefixes.tags);
        const res = await (client as any).index.$get();
        const { data } = await res.json();

        return data;
      },
    };
  }
}

export function createSearchClient(
  url: string,
  options?: ClientOptionsOptional
) {
  return new SearchClient(url, options);
}
