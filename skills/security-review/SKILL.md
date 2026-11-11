---
name: security-review
description: Use this skill when adding authentication, handling user input, working with secrets, creating API endpoints, or implementing payment/sensitive features. Provides comprehensive security checklist and patterns.
---

# Security Review Skill

Ensures all code follows security best practices and identifies potential vulnerabilities.

## When to Activate

- Implementing authentication or authorization
- Handling user input or file uploads
- Creating new API endpoints
- Working with secrets or credentials
- Implementing payment features
- Storing or transmitting sensitive data
- Integrating third-party APIs

## Security Checklist

### 1. Secrets Management

```typescript
// NEVER: Hardcoded secret
const apiKey = "sk-proj-xxxxx"

// ALWAYS: Environment variable
const apiKey = process.env.OPENAI_API_KEY
if (!apiKey) throw new Error('OPENAI_API_KEY not configured')
```

- [ ] No hardcoded API keys, tokens, or passwords
- [ ] All secrets in environment variables
- [ ] `.env.local` in .gitignore
- [ ] No secrets in git history
- [ ] Production secrets in hosting platform (Vercel, Railway, etc.)

### 2. Input Validation

```typescript
import { z } from 'zod'

const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150)
})

export async function createUser(input: unknown) {
  try {
    const validated = CreateUserSchema.parse(input)
    return await db.users.create(validated)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, errors: error.errors }
    }
    throw error
  }
}
```

- [ ] All user inputs validated with schemas
- [ ] File uploads restricted (size, type, extension)
- [ ] No direct use of user input in queries
- [ ] Whitelist validation (not blacklist)
- [ ] Error messages don't leak sensitive info

### 3. SQL Injection Prevention

```typescript
// NEVER: String concatenation
const query = `SELECT * FROM users WHERE email = '${userEmail}'`

// ALWAYS: Parameterized queries
const { data } = await supabase.from('users').select('*').eq('email', userEmail)
// or
await db.query('SELECT * FROM users WHERE email = $1', [userEmail])
```

- [ ] All database queries use parameterized queries
- [ ] No string concatenation in SQL
- [ ] ORM/query builder used correctly

### 4. Authentication & Authorization

```typescript
// WRONG: localStorage (vulnerable to XSS)
localStorage.setItem('token', token)

// CORRECT: httpOnly cookies
res.setHeader('Set-Cookie', `token=${token}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`)
```

```typescript
// ALWAYS verify authorization before sensitive operations
export async function deleteUser(userId: string, requesterId: string) {
  const requester = await db.users.findUnique({ where: { id: requesterId } })
  if (requester.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }
  await db.users.delete({ where: { id: userId } })
}
```

Row Level Security (Supabase):
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own data" ON users FOR UPDATE USING (auth.uid() = id);
```

- [ ] Tokens stored in httpOnly cookies (not localStorage)
- [ ] Authorization checks before sensitive operations
- [ ] Row Level Security enabled in Supabase
- [ ] Role-based access control implemented
- [ ] Session management secure

### 5. XSS Prevention

```typescript
import DOMPurify from 'isomorphic-dompurify'

function renderUserContent(html: string) {
  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p'],
    ALLOWED_ATTR: []
  })
  return <div dangerouslySetInnerHTML={{ __html: clean }} />
}
```

- [ ] User-provided HTML sanitized
- [ ] CSP headers configured
- [ ] No unvalidated dynamic content rendering
- [ ] React's built-in XSS protection used

### 6. CSRF Protection

- [ ] CSRF tokens on state-changing operations
- [ ] SameSite=Strict on all cookies
- [ ] Double-submit cookie pattern implemented

### 7. Rate Limiting

```typescript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests'
})

app.use('/api/', limiter)
```

- [ ] Rate limiting on all API endpoints
- [ ] Stricter limits on expensive operations
- [ ] IP-based and user-based rate limiting

### 8. Sensitive Data Exposure

```typescript
// WRONG: Logging sensitive data
console.log('User login:', { email, password })

// CORRECT: Redact sensitive fields
console.log('User login:', { email, userId })

// WRONG: Exposing stack traces
catch (error) {
  return NextResponse.json({ error: error.message, stack: error.stack }, { status: 500 })
}

// CORRECT: Generic error messages
catch (error) {
  console.error('Internal error:', error)
  return NextResponse.json({ error: 'An error occurred. Please try again.' }, { status: 500 })
}
```

- [ ] No passwords, tokens, or secrets in logs
- [ ] Error messages generic for users
- [ ] No stack traces exposed to users

### 9. Dependency Security

```bash
npm audit
npm audit fix
npm outdated
```

- [ ] Dependencies up to date
- [ ] No known vulnerabilities (npm audit clean)
- [ ] Lock files committed

## Pre-Deployment Security Checklist

- [ ] **Secrets**: No hardcoded secrets, all in env vars
- [ ] **Input Validation**: All user inputs validated
- [ ] **SQL Injection**: All queries parameterized
- [ ] **XSS**: User content sanitized
- [ ] **CSRF**: Protection enabled
- [ ] **Authentication**: Proper token handling
- [ ] **Authorization**: Role checks in place
- [ ] **Rate Limiting**: Enabled on all endpoints
- [ ] **HTTPS**: Enforced in production
- [ ] **Security Headers**: CSP, X-Frame-Options configured
- [ ] **Error Handling**: No sensitive data in errors
- [ ] **Logging**: No sensitive data logged
- [ ] **Dependencies**: Up to date, no vulnerabilities
- [ ] **CORS**: Properly configured
- [ ] **File Uploads**: Validated (size, type)

**Remember**: Security is not optional. One vulnerability can compromise the entire platform.
