---
name: coding-standards
description: Universal coding standards, best practices, and patterns for TypeScript, JavaScript, React, and Node.js development.
---

# Coding Standards & Best Practices

Universal coding standards applicable across all projects.

## When to Activate

- Starting a new project or module
- Reviewing code for quality and maintainability
- Refactoring existing code to follow conventions
- Enforcing naming, formatting, or structural consistency
- Setting up linting, formatting, or type-checking rules

## Code Quality Principles

### 1. Readability First
- Code is read more than written
- Clear variable and function names
- Self-documenting code preferred over comments
- Consistent formatting

### 2. KISS (Keep It Simple, Stupid)
- Simplest solution that works
- Avoid over-engineering
- No premature optimization
- Easy to understand > clever code

### 3. DRY (Don't Repeat Yourself)
- Extract common logic into functions
- Create reusable components
- Share utilities across modules
- Avoid copy-paste programming

### 4. YAGNI (You Aren't Gonna Need It)
- Don't build features before they're needed
- Avoid speculative generality
- Add complexity only when required
- Start simple, refactor when needed

## TypeScript/JavaScript Standards

### Variable Naming

```typescript
// GOOD: Descriptive names
const marketSearchQuery = 'election'
const isUserAuthenticated = true
const totalRevenue = 1000

// BAD: Unclear names
const q = 'election'
const flag = true
const x = 1000
```

### Function Naming

```typescript
// GOOD: Verb-noun pattern
async function fetchMarketData(marketId: string) { }
function calculateSimilarity(a: number[], b: number[]) { }
function isValidEmail(email: string): boolean { }

// BAD: Unclear or noun-only
async function market(id: string) { }
function similarity(a, b) { }
```

### Immutability Pattern (CRITICAL)

```typescript
// ALWAYS use spread operator
const updatedUser = { ...user, name: 'New Name' }
const updatedArray = [...items, newItem]

// NEVER mutate directly
user.name = 'New Name'  // BAD
items.push(newItem)     // BAD
```

### Error Handling

```typescript
// GOOD: Comprehensive error handling
async function fetchData(url: string) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return await response.json()
  } catch (error) {
    console.error('Fetch failed:', error)
    throw new Error('Failed to fetch data')
  }
}
```

### Async/Await Best Practices

```typescript
// GOOD: Parallel execution when possible
const [users, markets, stats] = await Promise.all([
  fetchUsers(),
  fetchMarkets(),
  fetchStats()
])

// BAD: Sequential when unnecessary
const users = await fetchUsers()
const markets = await fetchMarkets()
```

### Type Safety

```typescript
// GOOD: Proper types
interface Market {
  id: string
  name: string
  status: 'active' | 'resolved' | 'closed'
}

// BAD: Using 'any'
function getMarket(id: any): Promise<any> { }
```

## React Best Practices

### Component Structure

```typescript
// GOOD: Functional component with types
interface ButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary'
}

export function Button({ children, onClick, disabled = false, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled} className={`btn btn-${variant}`}>
      {children}
    </button>
  )
}
```

### State Management

```typescript
// GOOD: Functional update for state based on previous state
setCount(prev => prev + 1)

// BAD: Direct state reference (can be stale in async scenarios)
setCount(count + 1)
```

### Conditional Rendering

```typescript
// GOOD: Clear conditional rendering
{isLoading && <Spinner />}
{error && <ErrorMessage error={error} />}
{data && <DataDisplay data={data} />}

// BAD: Ternary hell
{isLoading ? <Spinner /> : error ? <ErrorMessage /> : data ? <DataDisplay /> : null}
```

## API Design Standards

### REST Conventions

```
GET    /api/resources           # List
GET    /api/resources/:id       # Get one
POST   /api/resources           # Create
PUT    /api/resources/:id       # Replace
PATCH  /api/resources/:id       # Partial update
DELETE /api/resources/:id       # Delete
```

### Response Format

```typescript
interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  meta?: { total: number; page: number; limit: number }
}
```

### Input Validation

```typescript
import { z } from 'zod'

const CreateSchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
})

export async function POST(request: Request) {
  const body = await request.json()
  try {
    const validated = CreateSchema.parse(body)
    // proceed
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 })
    }
  }
}
```

## Code Smell Detection

### 1. Long Functions
Split any function over 50 lines into smaller focused functions.

### 2. Deep Nesting
Use early returns instead of nested conditionals:

```typescript
// BAD: 5+ levels of nesting
if (user) { if (user.isAdmin) { if (market) { ... } } }

// GOOD: Early returns
if (!user) return
if (!user.isAdmin) return
if (!market) return
// do the thing
```

### 3. Magic Numbers
```typescript
// BAD
if (retryCount > 3) { }

// GOOD
const MAX_RETRIES = 3
if (retryCount > MAX_RETRIES) { }
```

## When to Comment

Only when WHY is non-obvious. Never state what the code does, that's what names are for.

```typescript
// GOOD: Explain WHY
// Exponential backoff to avoid overwhelming the API during outages
const delay = Math.min(1000 * Math.pow(2, retryCount), 30000)

// BAD: Stating the obvious
// Increment counter by 1
count++
```

**Remember**: Code quality is not negotiable. Clear, maintainable code enables rapid development and confident refactoring.
