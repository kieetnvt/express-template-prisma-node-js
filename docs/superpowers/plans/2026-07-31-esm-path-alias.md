# ESM Path Alias Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every project-owned source import use `@/` without a `.js`
suffix while keeping ESM development and plain-Node production execution.

**Architecture:** TypeScript and `tsx` resolve `@/*` to `src/*` while working
with source files. After `tsc` emits ESM, `tsc-alias` rewrites aliases to
relative paths and appends `.js`, so the existing `node dist/index.js`
production entrypoint needs no runtime loader.

**Tech Stack:** Node.js 22, TypeScript 5.8, ESM/NodeNext, tsx, tsc-alias, Yarn

## Global Constraints

- Keep `"type": "module"`.
- Keep `"module": "NodeNext"` and `"moduleResolution": "NodeNext"`.
- Keep `"target": "ES2023"`.
- Every project-owned import under `src/` must begin with `@/` in source.
- Project-owned source imports must not contain a `.js` suffix.
- External package and Node built-in imports remain unchanged.
- Do not edit `src/generated/`.
- Do not create the example-only `constants`, `interfaces`, or `livekit`
  modules.
- The repository has no test framework; use lint, build, static scans, and a
  compiled-runtime import check.

---

### Task 1: Configure Source and Emitted Alias Resolution

**Files:**

- Modify: `tsconfig.json`
- Modify: `package.json`
- Modify: `yarn.lock`

**Interfaces:**

- Consumes: Existing `src/` source root, `tsx watch src/index.ts`, and
  `node dist/index.js` runtime.
- Produces: The source alias `@/* -> src/*` and a build that emits
  Node-compatible relative `.js` imports.

- [ ] **Step 1: Verify the baseline project**

Run:

```bash
yarn lint
yarn build
```

Expected: both commands exit with status 0 before the migration.

- [ ] **Step 2: Add the build-time alias rewriter**

Run:

```bash
yarn add --dev tsc-alias
```

Expected: `tsc-alias` is added to `devDependencies`, and `yarn.lock` is
updated.

- [ ] **Step 3: Configure the TypeScript alias and ESM rewrite**

Change `tsconfig.json` to:

```json
{
  "compilerOptions": {
    "module": "NodeNext",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "target": "ES2023",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "noImplicitAny": true,
    "moduleResolution": "NodeNext",
    "resolveJsonModule": true,
    "rootDir": "./src",
    "sourceMap": true,
    "outDir": "dist",
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": [
    "src"
  ],
  "exclude": [
    "node_modules"
  ],
  "files": ["src/custom.d.ts"],
  "tsc-alias": {
    "resolveFullPaths": true,
    "resolveFullExtension": ".js"
  }
}
```

- [ ] **Step 4: Add alias rewriting to the build**

Change the `build` script in `package.json` to:

```json
"build": "tsc --build --clean && tsc && tsc-alias"
```

- [ ] **Step 5: Confirm configuration alone still builds**

Run:

```bash
yarn build
```

Expected: exit status 0. Existing relative `.js` imports remain valid while
the alias migration has not yet started.

- [ ] **Step 6: Commit the build configuration**

```bash
git add tsconfig.json package.json yarn.lock
git commit -m "build: support ESM source aliases"
```

### Task 2: Migrate Internal Source Imports

**Files:**

- Modify: `src/index.ts`
- Modify: `src/config/logger.ts`
- Modify: `src/api/index.ts`
- Modify: `src/api/controllers/auth.controller.ts`
- Modify: `src/api/controllers/comment.controller.ts`
- Modify: `src/api/controllers/post.controller.ts`
- Modify: `src/api/controllers/user.controller.ts`
- Modify: `src/api/middlewares/auth.middleware.ts`
- Modify: `src/api/middlewares/error.middleware.ts`
- Modify: `src/api/middlewares/request-logger.middleware.ts`
- Modify: `src/api/middlewares/validation.middleware.ts`
- Modify: `src/api/routes/auth.router.ts`
- Modify: `src/api/routes/comment.router.ts`
- Modify: `src/api/routes/index.ts`
- Modify: `src/api/routes/post.router.ts`
- Modify: `src/api/routes/user.router.ts`
- Modify: `src/api/services/auth.service.ts`
- Modify: `src/api/services/comment.service.ts`
- Modify: `src/api/services/post.service.ts`
- Modify: `src/api/services/user.service.ts`
- Modify: `src/prisma/repositories/comment.repository.ts`
- Modify: `src/prisma/repositories/post.repository.ts`
- Modify: `src/prisma/repositories/user.repository.ts`

**Interfaces:**

- Consumes: The `@/* -> src/*` mapping from Task 1.
- Produces: Source files whose project-owned imports consistently use `@/`
  without `.js`.

- [ ] **Step 1: Run the source-import policy check and observe failure**

Run:

```bash
rg -n "(from|import\\()\\s*['\"]\\.{1,2}/|^import\\s*['\"]\\.{1,2}/" src --glob '*.ts' --glob '!src/generated/**'
```

Expected: matches are printed for current relative internal imports. This is
the red check proving the migration is still needed.

- [ ] **Step 2: Replace every internal specifier**

Apply these exact specifier replacements wherever they occur:

```text
./api/index.js                                  -> @/api/index
./config/enviroment.js                         -> @/config/enviroment
./config/logger.js                             -> @/config/logger
./docs/openapi.js                              -> @/api/docs/openapi
./enviroment.js                                -> @/config/enviroment
./middlewares/error.middleware.js              -> @/api/middlewares/error.middleware
./middlewares/request-logger.middleware.js     -> @/api/middlewares/request-logger.middleware
./request-context.js                           -> @/config/request-context
./routes/index.js                              -> @/api/routes/index
./user.router.js                               -> @/api/routes/user.router
./auth.router.js                               -> @/api/routes/auth.router
./post.router.js                               -> @/api/routes/post.router
./comment.router.js                            -> @/api/routes/comment.router
./validators/auth.validator.js                 -> @/api/routes/validators/auth.validator
./validators/comment.validator.js              -> @/api/routes/validators/comment.validator
./validators/post.validator.js                 -> @/api/routes/validators/post.validator
./validators/user.validator.js                 -> @/api/routes/validators/user.validator
../controllers/auth.controller.js              -> @/api/controllers/auth.controller
../controllers/comment.controller.js           -> @/api/controllers/comment.controller
../controllers/post.controller.js              -> @/api/controllers/post.controller
../controllers/user.controller.js              -> @/api/controllers/user.controller
../errors/app.error.js                         -> @/api/errors/app.error
../middlewares/async-handler.middleware.js     -> @/api/middlewares/async-handler.middleware
../middlewares/auth.middleware.js              -> @/api/middlewares/auth.middleware
../middlewares/validation.middleware.js        -> @/api/middlewares/validation.middleware
../routes/response.js                          -> @/api/routes/response
../services/auth.service.js                    -> @/api/services/auth.service
../services/comment.service.js                 -> @/api/services/comment.service
../services/post.service.js                    -> @/api/services/post.service
../services/user.service.js                    -> @/api/services/user.service
../../config/enviroment.js                     -> @/config/enviroment
../../config/logger.js                         -> @/config/logger
../../config/request-context.js                -> @/config/request-context
../../generated/prisma/client.js               -> @/generated/prisma/client
../../prisma/repositories/comment.repository.js -> @/prisma/repositories/comment.repository
../../prisma/repositories/post.repository.js   -> @/prisma/repositories/post.repository
../../prisma/repositories/user.repository.js   -> @/prisma/repositories/user.repository
```

Do not change imports such as:

```ts
import express from 'express';
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
```

- [ ] **Step 3: Run the source-import policy check and observe success**

Run:

```bash
if rg -n "(from|import\\()\\s*['\"]\\.{1,2}/|^import\\s*['\"]\\.{1,2}/" src --glob '*.ts' --glob '!src/generated/**'; then
  exit 1
fi
```

Expected: no matches and exit status 0.

- [ ] **Step 4: Confirm internal imports have the required form**

Run:

```bash
rg -n "(from|import\\()\\s*['\"]@/|^import\\s*['\"]@/" src --glob '*.ts' --glob '!src/generated/**'
```

Expected: all migrated project-owned imports are listed and none ends in
`.js`.

- [ ] **Step 5: Commit the source migration**

```bash
git add src
git commit -m "refactor: use source path aliases"
```

### Task 3: Verify Development and Production Compatibility

**Files:**

- Verify: `src/**/*.ts`
- Verify: `dist/**/*.js`
- Verify: `Dockerfile`

**Interfaces:**

- Consumes: Alias-aware source imports and post-`tsc` path rewriting.
- Produces: Evidence that linting, compilation, emitted ESM resolution, and
  the existing production entrypoint work.

- [ ] **Step 1: Run ESLint**

Run:

```bash
yarn lint
```

Expected: exit status 0 with no errors.

- [ ] **Step 2: Produce a fresh build**

Run:

```bash
yarn build
```

Expected: `tsc`, followed by `tsc-alias`, exits with status 0.

- [ ] **Step 3: Prove no unresolved aliases reached emitted JavaScript**

Run:

```bash
if rg -n "(from|import\\()\\s*['\"]@/|^import\\s*['\"]@/" dist --glob '*.js'; then
  exit 1
fi
```

Expected: no matches and exit status 0.

- [ ] **Step 4: Inspect emitted internal ESM imports**

Run:

```bash
rg -n "(from|import\\()\\s*['\"]\\.{1,2}/|^import\\s*['\"]\\.{1,2}/" dist --glob '*.js'
```

Expected: project-owned imports are relative paths ending in `.js`.

- [ ] **Step 5: Load the compiled application graph with plain Node**

Run:

```bash
DATABASE_URL=postgresql://build:build@localhost:5432/build JWT_TOKEN_SECRET=build-check node --input-type=module --eval "await import('./dist/api/index.js')"
```

Expected: exit status 0 without `ERR_MODULE_NOT_FOUND` or
`ERR_INVALID_MODULE_SPECIFIER`. Importing the API graph constructs the
application dependencies but does not connect to PostgreSQL.

- [ ] **Step 6: Check the final diff**

Run:

```bash
git status --short
git diff --check
git diff --stat HEAD~2..HEAD
```

Expected: only the planned configuration, dependency lockfile, source-import,
specification, and plan changes are present; `git diff --check` exits 0.
