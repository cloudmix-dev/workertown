import {
  type ExportedHandlerQueueHandler,
  type ExportedHandlerScheduledHandler,
  type Message,
} from "@cloudflare/workers-types";
import { type Env, Hono } from "hono";

export class Server<
  // rome-ignore lint/suspicious/noExplicitAny: We need to allow for generic Server instances for Env type compatibility
  E extends Env = any,
  M extends Message = Message,
> extends Hono<E> {
  queue?: ExportedHandlerQueueHandler<E, M>;
  scheduled?: ExportedHandlerScheduledHandler<E>;
}
