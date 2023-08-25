import { type ExecutionContext } from "ava";

import { QueueAdapter } from "../../src/queue";

export async function testQueueAdapterE2E(
  t: ExecutionContext,
  queue: QueueAdapter,
) {
  // Create database tables (if required)
  await queue.runMigrations();

  const messages = [
    { name: "test_message_1" },
    { name: "test_message_2" },
    { name: "test_message_3" },
  ];

  await queue.sendMessage(messages[0]);

  const currentMessages = await queue.pullMessages();

  t.deepEqual(currentMessages[0].body, messages[0]);

  await queue.sendMessages([messages[1], messages[2]]);

  const currentMessages2 = await queue.pullMessages();

  t.deepEqual(currentMessages2[0].body, messages[1]);
  t.deepEqual(currentMessages2[1].body, messages[2]);

  await queue.ackMessage(currentMessages[0].id);

  const currentMessages3 = await queue.pullMessages();

  t.deepEqual(currentMessages3[0].body, messages[1]);
  t.deepEqual(currentMessages3[1].body, messages[2]);

  await queue.retryMessage(currentMessages3[0].id);

  const currentMessages4 = await queue.pullMessages();

  t.deepEqual(currentMessages4[0].body, messages[1]);
  t.deepEqual(currentMessages4[1].body, messages[2]);

  // Drop database tables (if required)
  await queue.runMigrations(true);
}
