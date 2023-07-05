import { type DeepPartial } from "@workertown/internal-types";
import { Hono } from "hono";
import { hc } from "hono/client";
import merge from "lodash.merge";

import {
  type DeleteItemRoute,
  type GetItemRoute,
  type GetMigrationsRoute,
  type GetTagsRoute,
  type IndexItemRoute,
  type OpenApiRoute,
  type RunMigrationsRoute,
  type SearchRoute,
  type SuggestRoute,
} from "../routers";

interface ClientOptions {
  url: string;
  prefixes: {
    admin: string;
    items: string;
    search: string;
    suggest: string;
    tags: string;
  };
}

type ClientOptionsOptional = DeepPartial<ClientOptions>;

const DEFAULT_OPTIONS: ClientOptions = {
  url: "http://localhost:8787/",
  prefixes: {
    admin: "/v1/admin",
    items: "/v1/items",
    search: "/v1/search",
    suggest: "/v1/suggest",
    tags: "/v1/tags",
  },
};

export class SearchClient {
  private readonly _url: string;

  private readonly _options: ClientOptions;

  constructor(options?: ClientOptionsOptional) {
    this._options = merge(DEFAULT_OPTIONS, options);
    this._url = this._options.url.replace(/\/$/, "");
  }

  private _createClient<T extends Hono<any, any, any>>(route: string) {
    return hc<T>(`${this._url}${route}`);
  }

  get admin() {
    return {
      getMigrations: async () => {
        const client = this._createClient<GetMigrationsRoute>(
          this._options.prefixes.admin
        );
        const res = await client.migrate.$get();
        const { data } = await res.json();

        return data;
      },
      openApi: async () => {
        const client = this._createClient<OpenApiRoute>(
          this._options.prefixes.admin
        );
        const res = await client["open-api.json"].$get();
        const result = await res.json();

        return result;
      },
      runMigrations: async () => {
        const client = this._createClient<RunMigrationsRoute>(
          this._options.prefixes.admin
        );
        const res = await client.migrate.$post();
        const { data } = await res.json();

        return data;
      },
    };
  }

  get items() {
    return {
      deleteItem: async (id: string) => {
        const client = this._createClient<DeleteItemRoute>(
          this._options.prefixes.items
        );
        const res = await client[":id"].$delete({ param: { id } });
        const { data } = await res.json();

        return data;
      },
      getItem: async (id: string) => {
        const client = this._createClient<GetItemRoute>(
          this._options.prefixes.items
        );
        const res = await client[":id"].$get({ param: { id } });
        const { data } = await res.json();

        return data;
      },
      // indexItem: hc.put(this._options.prefixes.items + "/{id}"),
    };
  }

  // get search() {
  //   return {
  //     search: async (query: string) => {
  //       const client = this._createClient<SearchRoute>(
  //         this._options.prefixes.search
  //       );
  //       const res = await client.search.$get({ query: { query } });
  //       const { data } = await res.json();

  //       return data;
  //     },
  //   };
  // }

  // get suggest() {
  //   return {
  //     suggest: async (query: string) => {
  //       const client = this._createClient<SuggestRoute>(
  //         this._options.prefixes.suggest
  //       );
  //       const res = await client.suggest.$get({ query: { query } });
  //       const { data } = await res.json();

  //       return data;
  //     },
  //   };
  // }

  get tags() {
    return {
      getTags: async () => {
        const client = this._createClient<GetTagsRoute>(
          this._options.prefixes.tags
        );
        const res = await client.index.$get();
        const { data } = await res.json();

        return data;
      },
    };
  }
}

export function createSearchClient(options?: ClientOptionsOptional) {
  return new SearchClient(options);
}
