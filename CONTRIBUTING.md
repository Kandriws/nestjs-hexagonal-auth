## Contributing

Thank you for your interest in contributing! Recommended workflow:

1. Open an issue describing the feature or bug (templates coming soon).
2. Fork and create a branch: `feat/my-feature` or `fix/my-bug`.
3. Ensure tests pass: `npm test` and check coverage.
4. Follow the hexagonal style (see `docs/hexagonal-architecture.md`).
5. Write clear commits (Conventional style encouraged: `feat:`, `fix:`, `refactor:` ...).
6. Open a Pull Request linking the issue and add short context (what / why / how to validate).

### Principles
- Keep use cases independent from infrastructure.
- Prefer Value Objects to enforce invariants.
- Avoid exposing internal domain entities directly in DTOs.

### Minimum PR tests
- Happy path.
- Domain error / exception path.
- One edge case (invalid / expired / boundary input).

### Style
Run `npm run lint` and `npm run format` before pushing.

### Security
Never include real secrets in examples. Use placeholder values.

Thank you for helping improve this project.
