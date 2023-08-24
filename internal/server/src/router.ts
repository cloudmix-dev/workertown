import { type Env, Hono } from "hono";

export class Router<E extends Env = Env> extends Hono<E> {}
