---
title: What is Workertown?
pageTitle: Edge architecture made simple - Workertown
description: Cache every single thing your app could ever do ahead of time, so your code never even has to run at all.
---

Workertown is a suite of packages to deploy fully featured, production ready
services on edge runtimes. {% .lead %}

Each Workertown package provides a REST API, deployable to edge runtimes. They
are all highly configurable when needed, but come with "batteries included",
sensible defaults to make getting started a breeze.

Workertown provides...

{% quick-links %}

{% quick-link title="Events" icon="events" tag="Coming soon..." description="Kafka-like events streaming." /%}

{% quick-link title="Feature Flags" icon="flags" href="/docs/packages/feature-flags/introduction" tag="Alpha" description="Feature flags made simple." /%}

{% quick-link title="Files" icon="files" href="/docs/packages/files/introduction" tag="Alpha" description="Easy file storage at the edge." /%}

{% quick-link title="KV" icon="kv" href="/docs/packages/kv/introduction" tag="Alpha" description="Simple key/value storage." /%}

{% quick-link title="Pub Sub" icon="pubsub" tag="Coming soon..." description="Webhook based system messaging." /%}

{% quick-link title="Queues" icon="queues" tag="Coming soon..." description="Distributed, prioritized task processing." /%}

{% quick-link title="Search" icon="search" href="/docs/packages/search/introduction" tag="Alpha" description="Full text search indexing for small to medium datasets." /%}

{% quick-link title="Next..?" icon="question" tag="Coming soon..." description="There are many more potential services in Workertown's future..." /%}

{% /quick-links %}

---

## Why

At Cloudmix, we're firm believers that getting to production should be frequent,
easy and understandable - unhindered by hosting constraints, budget constraints
or time constraints. So, we've built a suite of packages that do just that -
provide a way to quickly deploy solutions for common architectural requirements.

All compatible with the edge.

---

## Quick start

It's very easy to get started with Workertown.

### Installing a package

All the Workertown packages are available to download via `npm`. They are all
namespaced under `@workertown/*`. For example, to install the search package,
run:

```bash
npm install @workertown/search
```

### Creating a service

All Workertown service packages follow the same export pattern.

You can either import the default export:

```ts
import search from "@workertown/search";
```

...or the **named** export for the service:

```ts
import { search } from "@workertown/search";
```

...and then call the function to create the service:

```ts
const service = search();
```

...and that's it!

{% callout title="Check the docs!" %}
Each Workertown service has a comprehensive list of options that can be passed
when you create the service.

Read the docs for the service you're using to see what options are available.
{% /callout %}

---

## Getting help

If there's any thing unclear within this documentation, or when you're using
any of the Workertown packages, please don't hesitate to get in touch.

### Submit an issue

Found a bug? Head over to our
[Github repository](https://github.com/cloudmix-dev/workertown) and file an
issue for us to take a look at - reproduction examples encouraged 🙏.
