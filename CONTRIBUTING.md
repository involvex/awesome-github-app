# Contributing

Thank you for your interest in contributing to this project — your help is appreciated.

How to contribute

- Search existing issues and pull requests first to avoid duplicates.
- Open an issue to discuss larger changes before implementing them.
- For code changes, create a descriptive branch: `feat/short-description` or `fix/short-description`.

Local setup

1. Install dependencies (this repo uses Bun):

```bash
bun install
```

2. Run formatting and linting before committing:

```bash
bun run format
bun run lint:fix
bun run typecheck
```

Commit messages

Use Conventional Commits style (example: `feat(auth): add OAuth callback handling`).

Pull requests

- Open a PR from a feature branch to `main`.
- Include a clear description of the change and reference any related issue (`Closes #123`).
- Include tests or a description of manual verification steps.
- Use the PR template; the maintainers will review and request changes if needed.

Code style and tests

Follow the project's existing style (Prettier + ESLint). Run tests and ensure they pass before opening a PR.

Maintainers will review contributions and may request changes. Contributions may be merged once they meet the project's quality standards.
