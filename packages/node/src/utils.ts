import set from "lodash.set";

export function parseOptionsFromEnv(env = process.env) {
  const options = {};

  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith("options_")) {
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
