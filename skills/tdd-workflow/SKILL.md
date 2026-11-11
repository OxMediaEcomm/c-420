---
name: tdd-workflow
description: Use this skill when writing new features, fixing bugs, or refactoring code. Enforces test-driven development with 80%+ coverage including unit, integration, and E2E tests.
---

# Test-Driven Development Workflow

Ensures all code development follows TDD principles with comprehensive test coverage.

## When to Activate

- Writing new features or functionality
- Fixing bugs or issues
- Refactoring existing code
- Adding API endpoints
- Creating new components

## Core Principles

1. **Tests BEFORE Code** — Always write tests first, then implement code to make tests pass
2. **Coverage Requirements** — Minimum 80% (unit + integration + E2E), all edge cases covered
3. **Three test types** — Unit (functions/logic), Integration (APIs/DB), E2E (user flows)

## TDD Workflow Steps

### Step 1: Write User Journeys
```
As a [role], I want to [action], so that [benefit]
```

### Step 2: Generate Test Cases
```typescript
describe('Feature', () => {
  it('handles the happy path', async () => { })
  it('handles empty input gracefully', async () => { })
  it('falls back correctly when dependency unavailable', async () => { })
  it('sorts/orders results correctly', async () => { })
})
```

### Step 3: Run Tests (They Should FAIL)
```bash
npm test   # tests should fail — nothing implemented yet
```

### Step 4: Implement Code
Write minimal code to make tests pass.

### Step 5: Run Tests Again
```bash
npm test   # tests should now pass
```

### Step 6: Refactor
Improve code quality while keeping tests green.

### Step 7: Verify Coverage
```bash
npm run test:coverage   # verify 80%+ coverage achieved
```

## Testing Patterns

### Unit Test (Jest/Vitest)
```typescript
import { render, screen, fireEvent } from '@testing-library/react'

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click</Button>)
    fireEvent.click(screen.getByRole('button'))
    expect(handleClick).toHaveBeenCalledTimes(1)
  })
})
```

### API Integration Test
```typescript
describe('GET /api/resources', () => {
  it('returns resources successfully', async () => {
    const request = new NextRequest('http://localhost/api/resources')
    const response = await GET(request)
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('validates query parameters', async () => {
    const request = new NextRequest('http://localhost/api/resources?limit=invalid')
    const response = await GET(request)
    expect(response.status).toBe(400)
  })
})
```

### E2E Test (Playwright)
```typescript
test('user can complete critical flow', async ({ page }) => {
  await page.goto('/')
  await page.fill('input[name="query"]', 'test')
  await page.waitForTimeout(600)  // debounce
  await expect(page.locator('[data-testid="result"]')).toHaveCount(5, { timeout: 5000 })
})
```

## Coverage Thresholds

```json
{
  "jest": {
    "coverageThresholds": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

## Common Mistakes

```typescript
// WRONG: Testing implementation details
expect(component.state.count).toBe(5)

// CORRECT: Test user-visible behavior
expect(screen.getByText('Count: 5')).toBeInTheDocument()

// WRONG: Brittle selectors
await page.click('.css-class-xyz')

// CORRECT: Semantic selectors
await page.click('button:has-text("Submit")')
await page.click('[data-testid="submit-button"]')

// WRONG: Tests depend on each other
test('creates user', () => { /* ... */ })
test('updates same user', () => { /* depends on previous */ })

// CORRECT: Each test is independent
test('updates user', () => {
  const user = createTestUser()
  // update logic
})
```

## Success Metrics

- 80%+ code coverage
- All tests passing (green)
- No skipped or disabled tests
- Fast test execution (< 30s for unit tests)
- E2E tests cover critical user flows

**Remember**: Tests are the safety net that enables confident refactoring and rapid development.
