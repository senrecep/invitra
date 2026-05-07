# Contributing Guide

Thank you for contributing to Invitra! This guide explains how to contribute to the project.

## Code of Conduct

By participating in this project you agree to our [Code of Conduct](./CODE_OF_CONDUCT.md).

## How Can I Contribute?

### Reporting Bugs

If you find a bug:

1. First check existing issues
2. If the bug hasn't been reported, open a new issue
3. Add `[Bug]` to the issue title
4. Include the following information:
   - Steps to reproduce the bug
   - Expected behavior
   - Actual behavior
   - Environment info (OS, Node version, browser)
   - Error message / stack trace (full text)

### Suggesting Features

1. Check existing issues
2. Open a new issue and add `[Feature]` to the title
3. Describe your proposal and explain why it's needed

### Code Contributions

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/feature-name`
3. Make your changes and commit them
4. Open a pull request

## Development Setup

### Requirements

- Node.js >= 20
- npm >= 10
- Docker + Docker Compose
- Git

### Setup

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/invitra.git
cd invitra

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env file (DATABASE_URL, ADMIN_PASSWORD_HASH)

# Start the database
docker compose up -d postgres

# Run migrations
npx prisma migrate dev

# Start development mode
npm run dev
```

### Database Schemas

```bash
# Create a migration after changing the schema
npx prisma migrate dev --name description

# Regenerate Prisma Client
npx prisma generate
```

## Code Standards

### TypeScript

- Do not use `any` type
- Do not use `@ts-ignore` / `@ts-nocheck`
- Validate API inputs

### Commit Message Format

Use the [Conventional Commits](https://www.conventionalcommits.org/) standard:

```
<type>(<scope>): <description>
```

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation only |
| `style` | Formatting change (no functional change) |
| `refactor` | Code restructuring |
| `chore` | Build, tooling, dependency updates |
| `perf` | Performance improvement |

**Examples:**

```
feat(guests): add transportation type filter
fix(settings): sync form inputs after async settings load
docs(readme): update local setup instructions
chore(deps): upgrade next to 15.3
```

### Scope Examples

`guests`, `settings`, `dashboard`, `auth`, `invite`, `groups`, `organizers`, `pwa`, `ui`

## Pull Request Process

1. Use Conventional Commits format in the PR title
2. Describe the changes made and testing steps in the PR description
3. Link to related issues (`Closes #123`)

## Security Disclosures

If you find a security vulnerability, please do not open a public issue. Contact the project owner directly.
