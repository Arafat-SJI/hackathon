## `.cursor` folder

This folder configures how Cursor AI understands and navigates the SpecEngine codebase.

- **`rules/`**: Contains project- and domain-specific rules that guide the AI.
- **`context-priority.md`**: Describes which documents are most important for AI context.

Keep this folder committed to version control so everyone gets consistent AI behavior.

### Updating rules

- Prefer adding or updating a specific rule file instead of creating many small ones.
- When changing architecture, database, or API behavior, also update the corresponding rule file in `rules/`.
- Keep examples short and link to real code or docs when possible.

### Adding new rules

1. Decide the scope (global, per-module, per-tech stack).
2. Create a `.mdc` file in `rules/` with appropriate frontmatter.
3. Link relevant files using the `mdc:` syntax, e.g. `[system-architecture.md](mdc:architecture/system-architecture.md)`.

