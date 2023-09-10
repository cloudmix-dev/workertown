import test from "ava";

import { exitOnSignals, parseOptionsFromEnv } from "../src/utils";

test("parseOptionsFromEnv parses options from env", (t) => {
  // biome-ignore lint/suspicious/noExplicitAny: We can see what the type of `result` is explicitlty
  const result = parseOptionsFromEnv<any>({
    options_string: "test",
    options_boolean: "true",
    options_number: "1",
    options_function: "function() { return 1; }",
    options_array: "[1,2,3]",
    options_object: '{"test":true}',
    options_nested_value: "test",
  });

  t.is(result.string, "test");
  t.is(result.boolean, true);
  t.is(result.number, 1);
  t.true(typeof result.function === "function");
  t.deepEqual(result.array, [1, 2, 3]);
  t.deepEqual(result.object, { test: true });
  t.is(result.nested.value, "test");
});

test("parseOptionsFromEnv parses options with a custom delimeter", (t) => {
  // biome-ignore lint/suspicious/noExplicitAny: We can see what the type of `result` is explicitlty
  const result = parseOptionsFromEnv<any>(
    {
      "options|string": "test",
      "options|boolean": "true",
      "options|number": "1",
      "options|function": "function() { return 1; }",
      "options|array": "[1,2,3]",
      "options|object": '{"test":true}',
      "options|nested|value": "test",
    },
    { delimeter: "|" },
  );

  t.is(result.string, "test");
  t.is(result.boolean, true);
  t.is(result.number, 1);
  t.true(typeof result.function === "function");
  t.deepEqual(result.array, [1, 2, 3]);
  t.deepEqual(result.object, { test: true });
  t.is(result.nested.value, "test");
});

test("exitOnSignals exits on signals", (t) => {
  const onCalls: [string | symbol, Function][] = [];
  const exitCalls: [number?][] = [];

  const exit = (code?: number) => {
    exitCalls.push([code]);

    return undefined as never;
  };

  const on = (event: string | symbol, listener: () => void) => {
    onCalls.push([event, listener]);
  };

  exitOnSignals(undefined, { exit, on });

  t.is(onCalls.length, 2);
  t.is(onCalls[0][0], "SIGINT");
  t.is(onCalls[1][0], "SIGTERM");

  const sigintListener = onCalls[0][1];
  const sigtermListener = onCalls[1][1];

  sigintListener();
  sigtermListener();

  t.is(exitCalls.length, 2);
  t.is(exitCalls[0][0], 1);
  t.is(exitCalls[1][0], 1);
});

test("exitOnSignals exits on signals w/ custom signals", (t) => {
  const onCalls: [string | symbol, Function][] = [];
  const exitCalls: [number?][] = [];

  const exit = (code?: number) => {
    exitCalls.push([code]);

    return undefined as never;
  };

  const on = (event: string | symbol, listener: () => void) => {
    onCalls.push([event, listener]);
  };

  exitOnSignals(["test"], { code: 99, exit, on });

  t.is(onCalls.length, 1);
  t.is(onCalls[0][0], "test");
});

test("exitOnSignals exits on signals w/ custom code", (t) => {
  const onCalls: [string | symbol, Function][] = [];
  const exitCalls: [number?][] = [];

  const exit = (code?: number) => {
    exitCalls.push([code]);

    return undefined as never;
  };

  const on = (event: string | symbol, listener: () => void) => {
    onCalls.push([event, listener]);
  };

  exitOnSignals(undefined, { code: 99, exit, on });

  const sigintListener = onCalls[0][1];
  const sigtermListener = onCalls[1][1];

  sigintListener();
  sigtermListener();

  t.is(exitCalls.length, 2);
  t.is(exitCalls[0][0], 99);
  t.is(exitCalls[1][0], 99);
});
