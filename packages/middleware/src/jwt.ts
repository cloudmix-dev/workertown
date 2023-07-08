import { type fetch as CFFetch } from "@cloudflare/workers-types";
import { type DeepPartial } from "@workertown/internal-types";
import { type MiddlewareHandler } from "hono";
import { JSONWebKeySet, KeyLike, createLocalJWKSet, jwtVerify } from "jose";
import merge from "lodash.merge";

interface JwtOptions {
  audience?: string;
  claims?: {
    [x: string]: unknown;
  };
  env: {
    jwksUrl: string;
    secret: string;
    issuer: string;
    audience: string;
  };
  issuer?: string;
  jwksCacheTtl?: number | boolean;
  jwksUrl?: string;
  secret?: string;
}

export type JwtOptionsOptional = DeepPartial<JwtOptions>;

const DEFAULT_OPTIONS: JwtOptions = {
  jwksCacheTtl: 86400,
  env: {
    jwksUrl: "AUTH_JWKS",
    secret: "AUTH_JWT_SECRET",
    issuer: "AUTH_JWT_ISSUER",
    audience: "AUTH_JWT_AUDIENCE",
  },
};

export function jwt(options?: JwtOptionsOptional) {
  const {
    jwksUrl: optionsJwksUrl,
    jwksCacheTtl: optionsJwksCacheTtl,
    secret: optionsSecret,
    issuer: optionsIssuer,
    audience: optionsAudience,
    claims: optionsClaims,
    env: {
      jwksUrl: jwksUrlEnvKey,
      secret: secretEnvKey,
      issuer: issuerEnvKey,
      audience: audienceEnvKey,
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
    const user = ctx.get("user") ?? null;

    if (user === null) {
      const authHeader = ctx.req.headers.get("Authorization");

      if (typeof authHeader === "string") {
        const credentials = authHeader.replace("Bearer ", "");
        let signingCredentials: (() => Promise<KeyLike>) | string = secret;

        if (typeof signingCredentials !== "string") {
          if (!signingCredentials) {
            try {
              const jwksRes = await (fetch as unknown as typeof CFFetch)(jwks, {
                cf:
                  optionsJwksCacheTtl !== false
                    ? {
                        cacheTtlByStatus: {
                          "200-299":
                            typeof optionsJwksCacheTtl === "number"
                              ? optionsJwksCacheTtl
                              : 86400,
                          "400-599": 0,
                        },
                      }
                    : undefined,
              });

              if (jwksRes.ok) {
                const jwksJson = (await jwksRes.json()) as JSONWebKeySet;

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
          let allowed = true;

          if (optionsClaims) {
            for (const [key, value] of Object.entries(optionsClaims)) {
              if (payload[key] !== value) {
                allowed = false;

                break;
              }
            }
          }

          if (allowed) {
            ctx.set("user", { id: payload.sub as string });
          }
        } catch (_) {}
      }
    }

    return next();
  };

  return handler;
}
