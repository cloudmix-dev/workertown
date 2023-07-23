import set from "lodash.set";

export function parseOptionsFromEnv(env = process.env) {
  const options = {};

  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith("options_")) {
      continue;
    }

    let parsedValue: unknown = value;

    if (!Number.isNaN(parseInt(value as string, 10))) {
      parsedValue = parseInt(value as string, 10);
    } else {
      try {
        parsedValue = JSON.parse(value as string);
      } catch (_) {}
    }

    set(options, key.replace("options_", "").replace(/_/g, "."), parsedValue);
  }

  return options as Record<string, unknown>;
}

export function exitOnSignals(
  signals: string[] = ["SIGINT", "SIGTERM"],
  code = 1,
) {
  function exit() {
    process.exit(code);
  }

  for (const signal of signals) {
    process.on(signal, exit);
  }
}
