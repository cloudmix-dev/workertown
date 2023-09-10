import set from "lodash.set";

interface ExitOnSignalsOptions {
  code?: number;
  exit?: (code?: number) => never;
  // biome-ignore lint/suspicious/noExplicitAny: NodeJS needs these to be any for this to be types
  on?: (event: string | symbol, listener: (...args: any[]) => void) => any;
}

export function exitOnSignals(
  signals: string[] = ["SIGINT", "SIGTERM"],
  options: ExitOnSignalsOptions = {},
) {
  const {
    code = 1,
    exit = process.exit.bind(process),
    on = process.on.bind(process),
  } = options;

  function onExit() {
    exit(code);
  }

  for (const signal of signals) {
    on(signal, onExit);
  }
}

interface ParseOptionsFromEnvOptions {
  delimeter?: string;
  prefix?: string;
}

function parseFunction(func: string) {
  const funcRegExp = new RegExp(
    /\(([A-Za-z0-9-_ ,=\"\'\[\]\{\}\:]*)\) *(=> ?\{?|{)+((.|\s)*)\}?$/,
  );
  const match = func.match(funcRegExp);

  if (match) {
    const [, args, arrowOrBrace, rawBody, last] = match;
    let body = rawBody;

    if (last === "}") {
      body = rawBody?.slice(0, -1);
    }

    if (!arrowOrBrace?.endsWith("{")) {
      body = `return ${body}`;
    }

    return new Function(args as string, body as string);
  } else {
    throw new Error("SOMETHING WRONG DOG");
  }
}

export function parseOptionsFromEnv<T = Record<string, unknown>>(
  env = process.env,
  options: ParseOptionsFromEnvOptions = {},
) {
  const { delimeter = "_", prefix = "options" } = options;
  const parsedEnv = {};

  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith(`${prefix}${delimeter}`)) {
      continue;
    }

    let parsedValue: unknown = value;
    let parsed = false;

    if (!parsed && !Number.isNaN(parseInt(value as string, 10))) {
      parsedValue = parseInt(value as string, 10);
      parsed = true;
    }

    if (!parsed) {
      if (value === "true") {
        parsedValue = true;
        parsed = true;
      } else if (value === "false") {
        parsedValue = false;
        parsed = true;
      }
    }

    if (!parsed) {
      try {
        parsedValue = parseFunction(value as string);
        parsed = true;
      } catch (_) {}
    }

    if (!parsed) {
      try {
        parsedValue = JSON.parse(value as string);
        parsed = true;
      } catch (_) {}
    }

    set(
      parsedEnv,
      key
        .replace(`options${delimeter}`, "")
        .replace(new RegExp(`\\${delimeter}`, "g"), "."),
      parsedValue,
    );
  }

  return parsedEnv as T;
}
