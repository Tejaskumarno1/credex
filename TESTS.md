# Tests — SpendLens

## Test Coverage

| Test File | Coverage | Description |
|---|---|---|
| `tests/auditEngine.test.ts` | Audit Engine | 11 tests covering all 4 analysis passes + edge cases |

## Test Details

### `tests/auditEngine.test.ts` — Audit Engine

| # | Test | Pass Type | What It Verifies |
|---|---|---|---|
| 1 | ChatGPT Team for 1 user | Plan Fit | Recommends savings when team plan used by single user |
| 2 | Claude Team for 1 person | Plan Fit | Suggests Pro plan downgrade for individual use |
| 3 | Cursor Business for 3 users | Same-Vendor | Finds savings by downgrading from Business tier |
| 4 | Copilot Enterprise for <10 users | Same-Vendor | Recommends cheaper plan for small teams |
| 5 | Cheaper coding tool exists | Cross-Tool | Surfaces cheaper alternative tools |
| 6 | Cursor + Copilot overlap | Redundancy | Flags paying for multiple coding assistants |
| 7 | High savings → Credex CTA | Aggregate | Sets showCredexCta=true when savings > $500/mo |
| 8 | Low savings → optimal | Aggregate | Sets alreadyOptimal=true when savings < $100/mo |
| 9 | API direct + high spend | Edge Case | Flags Credex credits for high API spend |
| 10 | Empty tool list | Edge Case | Handles empty input gracefully |
| 11 | Annual savings math | Edge Case | Verifies annual = monthly × 12 |

## Running Tests

```bash
# Run all tests once
npm run test

# Run tests in watch mode
npm run test:watch

# Run with verbose output
npx vitest run --reporter=verbose
```

## Test Configuration

- **Framework:** Vitest v4.1.7
- **Environment:** Node.js
- **Config:** `vitest.config.ts` at repo root
- **Path aliases:** `@/` → `./src/` (matches tsconfig)

## Adding New Tests

To add tests for new features:

1. Create test files in `tests/` directory with `.test.ts` extension
2. Import from `@/lib/` using the configured alias
3. Run `npm run test` to verify
4. Tests are automatically picked up by the CI pipeline
