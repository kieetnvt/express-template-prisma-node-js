# ESM Path Alias Design

## Goal

Allow every internal TypeScript import to use the `@/` prefix without a
`.js` suffix while preserving the project's existing ESM architecture and
plain-Node production runtime.

Examples of the desired source syntax:

```ts
import api from '@/api/index';
import { env } from '@/config/enviroment';
import UserRepository from '@/prisma/repositories/user.repository';
```

Imports from external packages and Node built-ins remain unchanged:

```ts
import express from 'express';
import { randomUUID } from 'node:crypto';
```

## Configuration

The project will keep:

- `"type": "module"` in `package.json`
- `"module": "NodeNext"` in `tsconfig.json`
- `"moduleResolution": "NodeNext"` in `tsconfig.json`
- `"target": "ES2023"` in `tsconfig.json`

TypeScript will map the source alias from the project root:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

The proposed CommonJS configuration will not be used because it conflicts
with the existing ESM package and runtime.

## Development and Production Resolution

Development continues to run through `tsx watch src/index.ts`. `tsx` uses the
TypeScript path mapping while executing source files.

TypeScript's `paths` option does not rewrite emitted JavaScript. The production
build will therefore run `tsc-alias` after `tsc`. `tsc-alias` will:

1. Replace emitted `@/` specifiers with relative paths.
2. Resolve incomplete ESM paths to `.js` files.

The emitted files will remain directly executable with:

```bash
node dist/index.js
```

No runtime alias loader will be added to the production application.

## Source Migration

Every relative import of project-owned source code under `src/` will be
converted to an `@/` import and its `.js` suffix removed.

The migration will not:

- Change third-party package imports.
- Change Node built-in imports.
- Create placeholder modules for example-only paths such as `@/constants`,
  `@/interfaces`, or `@/lib/livekit`.
- Refactor application behavior or module exports.
- Edit generated Prisma client files.

## Verification

The migration is complete when all of the following checks pass:

1. ESLint reports no errors for source TypeScript files.
2. TypeScript and the alias rewrite complete successfully.
3. No relative internal import remains in non-generated source files.
4. No emitted JavaScript import contains an unresolved `@/` specifier.
5. Emitted ESM imports contain runtime-compatible `.js` paths.
6. The compiled application can start with plain Node using the documented
   production entrypoint.

The project has no test framework, so verification will use its documented
lint, build, static import scans, and compiled-runtime startup checks.
