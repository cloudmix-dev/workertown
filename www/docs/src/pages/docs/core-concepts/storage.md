---
title: Storage
description: Workertown packages that require persiistant storage provide a simple way for you to provide your own storage implementations.
---

Most Workertown services require some kind of persistant storage, i.e. data that
lives between requests. Following the "sensible defaults" paradigm, each of
these services provides a default storage adapter built upon Cloudflare's D1
SQLite database, but there are other options available, and also the ability to
bring your own storage.

---

## How it works
