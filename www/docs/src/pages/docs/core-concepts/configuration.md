---
title: Configuration
description: Workertown adheres to a principal we call "sensible defaults, absolute configuration".
---

Sensible defaults, absolute configuration. That statement is at the core of our
design decisions when it comes to Workertown.

We feel very strongly that creating a Workertown service should be as simple as
importing and calling a function - however, we all know that the real world can
be far more complex than that.

---

## `options`

In each Workertown package, every aspect of how your service functions is
exposed via an optional `options` argument. This is how you configure a
Workertown service to best suite your needs.
