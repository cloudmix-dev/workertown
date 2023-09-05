---
title: Design principles
description: The Workertown project has a simple set of principles that guide its development.
---

If you're interested in working on the Workertown project, please have a quick
read of this page.

---

## Sensible defaults, advanced configuration

This is the **key** principle that guides the development of Workertown.

At Cloudmix, we believe that software should be entirely accessible, while
providing well-designed ways to get out of the underlying opinions/decisions
that we make.

**Any and all** changes to Workertown over time *should* provide a sensible
default out-of-the-box (where applicable), and a straight-forward API to allow
the user to configure the service to their needs. **Nothing** within the code
should make an assumption **without** a way for that to be overridden
completely.

---

## Backwards compatible (until we absolutely can't)

We're committed to ensuring that Workertown is backwards compatible with
previous versions. This means that we will never make a breaking change to
Workertown without providing a migration path for existing users.

That **does not** mean we're not open to changing/updating APIs, it just means
that any work done in this area *should* be done in a way that allows existing
users to continue to use the old API, while new users can use the new API.

Over time, there will obviously be key moments where non-backwards compatible
changes are required. When they do, we will introduce them **alongside**
existing functionality under a new `v2`/`v3`/etc. `endpoint` on the service to
make it clear that the new functionality is **not** backwards compatible.

---

## Simplify where possible

If you spot something that *could* be simplified, please do so. We're always
looking for ways to make Workertown easier to use. This means that we're open
to consolidating repeated code/concepts, introducing new `internal` packages
that can make the codebase more testable and easier to maintain, and anything
else that can make Workertown easier to use in general.
