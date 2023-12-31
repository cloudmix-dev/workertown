import { type fetch as CFFetch } from "@cloudflare/workers-types";
import { type DeepPartial } from "@workertown/internal-types";
import {
  JSONWebKeySet,
  JWTPayload,
  KeyLike,
  createLocalJWKSet,
  jwtVerify,
} from "jose";
import merge from "lodash.merge";

import { type MiddlewareHandler } from "../router.js";
import { type User } from "../types.js";

interface JwtOptions {
  audience?: string;
  env: {
    jwksUrl: string;
    secret: string;
    issuer: string;
    audience: string;
  };
  getCredentials: (req: Request) => string | null | undefined;
  issuer?: string;
  jwks?: {
    url?: string;
    cacheTtl?: number | false;
  };
  secret?: string;
  verifyCredentials?: (jwt: JWTPayload) => boolean | Promise<boolean>;
}

export type JwtOptionsOptional = DeepPartial<JwtOptions>;

const DEFAULT_OPTIONS: JwtOptions = {
  env: {
    jwksUrl: "AUTH_JWKS",
    secret: "AUTH_JWT_SECRET",
    issuer: "AUTH_JWT_ISSUER",
    audience: "AUTH_JWT_AUDIENCE",
  },
  getCredentials: (req) => {
    const authHeader = req.headers.get("Authorization");

    if (typeof authHeader === "string") {
      const [type, credentials] = authHeader.split(" ");

      if (type === "Bearer" && credentials) {
        return credentials;
      }
    }
  },
  jwks: {
    cacheTtl: 86400,
  },
};

export function jwt(options?: JwtOptionsOptional) {
  const {
    audience: optionsAudience,
    env: {
      jwksUrl: jwksUrlEnvKey,
      secret: secretEnvKey,
      issuer: issuerEnvKey,
      audience: audienceEnvKey,
    },
    issuer: optionsIssuer,
    getCredentials,
    jwks: optionsJwks,
    secret: optionsSecret,
    verifyCredentials,
  } = merge({}, DEFAULT_OPTIONS, options);
  // biome-ignore lint/suspicious/noExplicitAny: We're overriding the default type of ctx here
  const handler: MiddlewareHandler<any> = async (ctx, next) => {
    const jwks = (optionsJwks?.url ?? ctx.env?.[jwksUrlEnvKey]) as string;
    const secret = (optionsSecret ?? ctx.env?.[secretEnvKey]) as string;
    const issuer = (optionsIssuer ?? ctx.env?.[issuerEnvKey]) as
      | string
      | undefined;
    const audience = (optionsAudience ?? ctx.env?.[audienceEnvKey]) as
      | string
      | undefined;
    const user: User | null = ctx.get("user") ?? null;

    if (user === null && (secret || jwks)) {
      const authHeader = ctx.req.headers.get("Authorization");

      if (typeof authHeader === "string") {
        const credentials = getCredentials(ctx.req as unknown as Request);
        let signingCredentials: (() => Promise<KeyLike>) | string = secret;

        if (credentials) {
          if (typeof signingCredentials !== "string") {
            if (!signingCredentials) {
              try {
                const jwksRes = await (fetch as unknown as typeof CFFetch)(
                  jwks,
                  {
                    cf:
                      optionsJwks?.cacheTtl !== false
                        ? {
                            cacheTtlByStatus: {
                              "200-299":
                                typeof optionsJwks?.cacheTtl === "number"
                                  ? optionsJwks?.cacheTtl
                                  : 86400,
                              "400-599": 0,
                            },
                          }
                        : undefined,
                  },
                );

                if (jwksRes.ok) {
                  const jwksJson = await jwksRes.json<JSONWebKeySet>();

                  signingCredentials = await createLocalJWKSet(jwksJson);
                }
              } catch (_) {}
            }
          }

          try {
            const { payload } = await jwtVerify(
              credentials as string,
              typeof signingCredentials === "string"
                ? new TextEncoder().encode(signingCredentials)
                : (signingCredentials as unknown as KeyLike),
              { issuer, audience },
            );
            let allowed = true;

            if (typeof verifyCredentials === "function") {
              allowed = await verifyCredentials(payload);
            }

            if (allowed) {
              ctx.set("user", {
                id: payload.sub,
                strategy: "jwt",
                claims: { ...payload },
              } as User);
            }
          } catch (_) {}
        }
      }
    }

    return next();
  };

  return handler;
}
