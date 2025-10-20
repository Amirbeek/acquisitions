# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

This is a Node.js Express API for an acquisitions platform with authentication features. The stack includes:

- **Express 5.x** for the web framework
- **Drizzle ORM** with Neon serverless PostgreSQL
- **Zod** for request validation
- **JWT** for authentication
- **Winston** for logging
- **ESLint + Prettier** for code quality

## Development Commands

### Running the Application

```bash
npm run dev          # Development mode with file watching
npm start            # Production mode
```

### Code Quality

```bash
npm run lint         # Check for linting errors
npm run lint:fix     # Auto-fix linting errors
npm run format       # Format code with Prettier
npm run format:check # Check if code is formatted correctly
```

### Database (Drizzle ORM)

```bash
npm run db:generate  # Generate migrations from schema changes
npm run db:migrate   # Apply migrations to database
npm run db:studio    # Open Drizzle Studio to browse database
```

## Architecture

### Path Aliases

The project uses Node.js subpath imports for cleaner imports:

- `#config/*` → `./src/config/*`
- `#controllers/*` → `./src/controllers/*`
- `#middleware/*` → `./src/middleware/*`
- `#models/*` → `./src/models/*`
- `#routes/*` → `./src/routes/*`
- `#services/*` → `./src/services/*`
- `#utils/*` → `./src/utils/*`
- `#validations/*` → `./src/validations/*`

Always use these aliases instead of relative paths when importing across directories.

### Layer Architecture

The codebase follows a clear separation of concerns:

**Routes** (`src/routes/`) → Define API endpoints and map them to controllers
**Controllers** (`src/controllers/`) → Handle HTTP requests/responses and orchestrate the flow
**Services** (`src/services/`) → Contain business logic and database operations
**Validations** (`src/validations/`) → Define Zod schemas for request validation
**Models** (`src/models/`) → Define Drizzle ORM database schemas
**Utils** (`src/utils/`) → Reusable utility functions (JWT, cookies, formatters)

### Request Flow

1. Request hits **route** handler in `src/routes/`
2. **Controller** receives request and validates with **Zod schema** from `src/validations/`
3. If validation fails, controller returns formatted error (using `#utils/format.js`)
4. Controller calls **service** function for business logic
5. **Service** interacts with database using Drizzle ORM and **models**
6. Service returns result to controller
7. Controller sends HTTP response, setting JWT cookies via `#utils/cookies.js`

### Database & Migrations

- Database schema is defined in `src/models/*.js` using Drizzle ORM table definitions
- Drizzle config is in `drizzle.config.js` (points to models directory)
- Migrations are generated to `./drizzle/` folder
- Database connection is initialized in `src/config/db.js` using Neon serverless driver

When modifying schemas:

1. Edit the model file in `src/models/`
2. Run `npm run db:generate` to create migration
3. Run `npm run db:migrate` to apply it

### Logging

Winston logger is configured in `src/config/logger.js`:

- Logs to `logs/error.lg` (errors only) and `logs/combined.log` (all levels)
- In development, also logs to console with colors
- All HTTP requests are logged via Morgan middleware
- Import with `import logger from '#config/logger.js'`

### Authentication Pattern

The auth implementation demonstrates the pattern:

- JWT tokens are signed with payload `{id, email, role}`
- Tokens stored in httpOnly cookies (15min default)
- Passwords hashed with bcrypt (10 rounds)
- User roles: 'user' or 'admin'

## Code Style

### ESLint Rules

- 2-space indentation
- Single quotes for strings
- Semicolons required
- Unused vars must start with `_` to be ignored
- Prefer `const` over `let`, no `var`
- Use arrow functions for callbacks

### Prettier Config

- Single quotes
- Semicolons enabled
- 80 character line width
- LF line endings
- No tabs (2 spaces)

## Environment Variables

Required in `.env`:

- `DATABASE_URL` - Neon PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing
- `JWT_EXPIRATION` - Token expiration (default: '1d')
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (affects logging and cookie security)
- `LOG_LEVEL` - Winston log level (default: 'info')
