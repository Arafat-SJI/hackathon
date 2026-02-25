## Context priority for SpecEngine

Cursor should prioritize the following sources when answering questions or making changes:

1. **Project overview**
   - `README.md`
2. **Architecture**
   - `architecture/system-architecture.md`
   - `architecture/application-architecture.md`
   - `architecture/data-flow.md`
3. **Feature specifications**
   - `docs/features/template.md`
   - `docs/features/*/specification.md`
4. **APIs and data contracts**
   - `docs/api/contracts/api-overview.md`
   - `docs/api/endpoints/*-endpoints.md`
   - `docs/database/schema/*`
5. **Standards and SOPs**
   - `docs/standards/*`
   - `docs/SOPs/**`

When in doubt, prefer **architecture docs** and **feature specs** over raw implementation details.

