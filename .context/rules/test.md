## Testing Rules

- ALWAYS generate or update its `.spec.ts` file whenever you create or modify a service.
- NEVER use real data (production IDs, real tokens) in tests.
- ALWAYS use `jest.clearAllMocks()` in `afterEach`.
- ALWAYS mock external dependencies; never call real services in unit tests.
- Test names should be in Spanish and describe the expected BEHAVIOR, not the method.
  - ❌ `it('calls prisma.create')`
  - ✅ `it('must return the created commerce with its generated ID')`
