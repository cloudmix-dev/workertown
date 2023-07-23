import set from "lodash.set";

interface ParseOptionsFromEnvOptions {
  delimeter: string;
}

export function parseOptionsFromEnv<T = Record<string, unknown>>(
  env = process.env,
  options: ParseOptionsFromEnvOptions = { delimeter: "_" },
) {
  const { delimeter } = options;
  const parsedEnv = {};

  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith(`options${delimeter}`)) {
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

interface ExitOnSignalsOptions {
  code?: number;
  exit?: (code?: number) => never;
  // rome-ignore lint/suspicious/noExplicitAny: NodeJS needs these to be any for this to be types
  on?: (event: string | symbol, listener: (...args: any[]) => void) => any;
}

export function exitOnSignals(
  signals: string[] = ["SIGINT", "SIGTERM"],
  options: ExitOnSignalsOptions = {},
) {
  const { code = 1, exit = process.exit, on = process.on } = options;

  function onExit() {
    exit(code);
  }

  for (const signal of signals) {
    on(signal, onExit);
  }
}
