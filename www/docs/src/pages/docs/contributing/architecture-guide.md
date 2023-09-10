---
title: Architecture guide
description: The Workertown project has a defined architecture and layout that should be understood before contributing.
---

The Workertown project has a defined architecture and layout that should be
understood before contributing.

The codebase can be found in the
[Github repository](https://github.com/cloudmix-dev/workertown).

---

## Public packages

Any **public** packages can be found in the `packages` directory. A **public**
package is defined as **any** package that a user may want to directly import
and use.

Each package is a separate NPM package, but they are **all** published (and
versioned) in tandem using
[Changesets](https://github.com/changesets/changesets).

### Adding a new public package

To add a new public package, create the package's directory in the `packages`
directory.

**Every** package must have a `package.json` file that namespaces the package
under `@workertown/<package-name>`. The version can be started at `0.0.0` as our
publishing process will automatically update the version to get it in line with
the others.

Create a `tsconfig.json` file that **extends** the `tsconfig.base.json` file
found in the root of the repository. This ensures **consistent** build artifacts
across all packages.

The source of the package should be in a `src` directory, and the entry point
should be `src/index.ts`. This should export a set of **named** exports that
will be the public API of the package.

**Any** logic that will **not** run within a particular runtime, **or** any
logic that may contribute towards large build artifacts **MUST NOT** be exported
at the root of the package and instead **MUST** be exported separately via the
`exports` field in the `package.json` file. **Any dependencies** used
**exclusively** in logic **not** exported from the package root **MUST** be
listed as `peerDependencies`, with documentation identifying said packages to
the user.

### Updating an existing public package

When updating an existing public package, ensure that the `package.json` file
has been updated to reflect any export changes. The **same** rules as above
apply when it comes to `exports` and `peerDependencies`.

**Ensure** **ALL** test suites still pass, and that the package still builds
correctly. If you are adding new logic that *should* be tested, please write
the corresponding tests - we prefer integration tests over unit tests, but
either are acceptable depending on the situation.

---

## Internal packages

Any **internal** packages can be found in the `internal` directory. An internal
package is defined as **any** package that is **not** intended to be used
directly by a user. They are still published to NPM as **public** packages, but
we distinguish them to discourage their direct import and use. Internal packages
are allowed to have breaking changes between **any** version, and only follow
semver semantics to keep their versioning in line with their corresponding
public packages.

### Adding a new internal package

To add a new internal package, create the package's directory in the `internal`
directory. The package should follow the same rules as a public package, but
should be namespaced under `@workertown/internal-<package-name>`, so it is clear
to users that the package is not intended for direct use.

### Updating an existing internal package

When updating an existing internal package, ensure that the `package.json` file
has been updated to reflect any export changes. The **same** rules in regards to
public packages apply when it comes to `exports` and `peerDependencies`.
