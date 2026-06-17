# Contributing to FMCG AI Analytics Assistant

Thank you for your interest in contributing! This guide covers everything you need to get set up and make a meaningful contribution.

---

## 🧭 Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Commit Convention](#commit-convention)
- [Code Style](#code-style)
- [Adding Tests](#adding-tests)
- [Reporting Issues](#reporting-issues)

---

## Getting Started

1. **Fork** the repository on GitHub.
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/fmcg-ai-analytics-assistant.git
   cd fmcg-ai-analytics-assistant
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Copy the environment template**:
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY to .env
   ```
5. **Start the development server**:
   ```bash
   npm run dev
   ```

---

## Development Workflow

1. Create a new branch from `main` using a descriptive name:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes, following the [Code Style](#code-style) guidelines.
3. Run linting and tests before committing:
   ```bash
   npm run lint
   npm test
   ```
4. Push your branch and open a **Pull Request** against `main`.
5. Fill in the PR template and link any relevant issues.

---

## Commit Convention

This project uses [Conventional Commits](https://www.conventionalcommits.org/). Your commit messages must follow this format:

```
<type>(<scope>): <short description>

[optional body]
```

**Allowed types:**

| Type | When to use |
| :--- | :--- |
| `feat` | New features or capabilities |
| `fix` | Bug fixes |
| `docs` | Documentation changes only |
| `chore` | Build, config, or dependency changes |
| `refactor` | Code restructuring with no behaviour change |
| `test` | Adding or updating tests |
| `perf` | Performance improvements |

**Examples:**
```bash
feat(ui): add regional filter to product explorer
fix(server): handle empty functionCalls response from Gemini
docs(readme): update quick-start instructions
test(data): add unit tests for query_promo_impact
```

---

## Code Style

- All source files are written in **TypeScript**. Avoid `any` types where possible.
- Linting is enforced via **ESLint** with `@typescript-eslint`. Run `npm run lint` before pushing.
- React components use **functional components** with hooks — no class components.
- Keep component files focused: one primary component per file.

---

## Adding Tests

Tests live in `src/__tests__/`. Use the naming convention `<module>.test.ts`.

Run all tests:
```bash
npm test
```

Run in watch mode:
```bash
npm run test:watch
```

When adding a new query function or modifying the synthetic data engine, please include corresponding unit tests.

---

## Reporting Issues

- Use the **GitHub Issues** tab.
- Include a clear title, steps to reproduce, expected behaviour, and actual behaviour.
- Attach screenshots or logs where relevant.
- Tag the issue with the appropriate label (`bug`, `enhancement`, `documentation`).

---

Thank you for helping make this project better! 🚀
