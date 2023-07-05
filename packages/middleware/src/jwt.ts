import { type KVNamespace } from "@cloudflare/workers-types";
import { type DeepPartial } from "@workertown/internal-types";
import { type MiddlewareHandler } from "hono";
import { JSONWebKeySet, KeyLike, createLocalJWKSet, jwtVerify } from "jose";
import merge from "lodash.merge";

const JWKS_CACHE_KEY = "wt_auth_jwks";

interface JwtOptions {
  jwksUrl?: string;
  secret?: string;
  issuer?: string;
  audience?: string;
  env: {
    jwksUrl: string;
    secret: string;
    issuer: string;
    audience: string;
    cache: string;
  };
}

export type JwtOptionsOptional = DeepPartial<JwtOptions>;

const DEFAULT_OPTIONS: JwtOptions = {
  env: {
    jwksUrl: "AUTH_JWKS",
    secret: "AUTH_JWT_SECRET",
    issuer: "AUTH_JWT_ISSUER",
    audience: "AUTH_JWT_AUDIENCE",
    cache: "AUTH_JWKS_CACHE",
  },
};

export function jwt(options?: JwtOptionsOptional) {
  const {
    jwksUrl: optionsJwksUrl,
    secret: optionsSecret,
    issuer: optionsIssuer,
    audience: optionsAudience,
    env: {
      jwksUrl: jwksUrlEnvKey,
      secret: secretEnvKey,
      issuer: issuerEnvKey,
      audience: audienceEnvKey,
      cache: cacheEnvKey,
    },
  } = merge(DEFAULT_OPTIONS, options);
  const handler: MiddlewareHandler = async (ctx, next) => {
    const jwks = (optionsJwksUrl ?? ctx.env[jwksUrlEnvKey]) as string;
    const secret = (optionsSecret ?? ctx.env[secretEnvKey]) as string;
    const issuer = (optionsIssuer ?? ctx.env[issuerEnvKey]) as
      | string
      | undefined;
    const audience = (optionsAudience ?? ctx.env[audienceEnvKey]) as
      | string
      | undefined;
    const cache = ctx.env[cacheEnvKey] as KVNamespace | undefined;
    const user = ctx.get("user") ?? null;

    if (user === null) {
      const authHeader = ctx.req.headers.get("Authorization");

      if (typeof authHeader === "string") {
        const credentials = authHeader.replace("Bearer ", "");
        let signingCredentials: (() => Promise<KeyLike>) | string = secret;

        if (typeof signingCredentials !== "string") {
          if (cache) {
            const cachedJwks = (await cache.get(
              JWKS_CACHE_KEY,
              "json"
            )) as JSONWebKeySet | null;

            if (cachedJwks) {
              signingCredentials = await createLocalJWKSet(cachedJwks);
            }
          }

          if (!signingCredentials) {
            try {
              const jwksRes = await fetch(jwks);

              if (jwksRes.ok) {
                const jwksJson = await jwksRes.json();

                if (cache) {
                  await cache.put(JWKS_CACHE_KEY, JSON.stringify(jwksJson), {
                    expirationTtl: 24 * 60 * 60,
                  });
                }

                signingCredentials = await createLocalJWKSet(jwksJson);
              }
            } catch (_) {}
          }
        }

        try {
          const { payload } = await jwtVerify(
            credentials,
            typeof signingCredentials === "string"
              ? new TextEncoder().encode(signingCredentials)
              : (signingCredentials as unknown as KeyLike),
            { issuer, audience }
          );

          ctx.set("user", { id: payload.sub as string });
        } catch (_) {}
      }
    }

    return next();
  };

  return handler;
}
