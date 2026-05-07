# Contributing to Invitra

By participating in this project you agree to the [Code of Conduct](./CODE_OF_CONDUCT.md).

## How to contribute

### Reporting bugs

If you find a bug:

1. Check existing issues first
2. Open a new issue with `[Bug]` in the title
3. Include:
   - Steps to reproduce
   - Expected vs actual behavior
   - OS, Node version, browser
   - Full error message / stack trace

### Suggesting features

Open a new issue with `[Feature]` in the title. Describe what you want and why.

### Code contributions

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/feature-name`
3. Commit your changes
4. Open a pull request

## Development setup

```bash
git clone https://github.com/senrecep/invitra.git
cd invitra
npm install

# Set environment variables
cp .env.example .env
# Edit .env (DATABASE_URL, ADMIN_PASSWORD_HASH)

docker compose up -d postgres
npx prisma migrate dev
npm run dev
```

After a schema change:

```bash
npx prisma migrate dev --name description
npx prisma generate
```

**Requirements:** Node.js >= 20, npm >= 10, Docker + Docker Compose, Git

## Code standards

- No `any` types
- No `@ts-ignore` / `@ts-nocheck`
- Validate API inputs

## Commit format

[Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>
```

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting change (no logic change) |
| `refactor` | Code restructuring |
| `chore` | Build, tooling, dependency updates |
| `perf` | Performance improvement |

```
feat(guests): add transportation type filter
fix(settings): sync form inputs after async settings load
docs(readme): update local setup instructions
```

Scopes: `guests`, `settings`, `dashboard`, `auth`, `invite`, `groups`, `organizers`, `pwa`, `ui`

## Pull requests

1. PR title follows Conventional Commits format
2. Describe what changed and how to test it
3. Link related issues (`Closes #123`)

## Security

If you find a security vulnerability, do not open a public issue. Contact the project owner directly.
