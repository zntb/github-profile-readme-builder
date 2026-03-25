# Security Policy

## Supported Versions

The following versions of this project are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.0   | :white_check_mark: |

As the project evolves, older versions may be deprecated. We recommend always using the latest stable release.

## Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security issue, please report it responsibly.

### How to Report

1. **Do NOT** create a public GitHub issue for security vulnerabilities
2. Email the security team directly at: <codetibo@proton.me>
3. Alternatively, use GitHub's private vulnerability reporting:
   - Navigate to the [Security tab](https://github.com/zenetio/github-profile-readme-builder/security) of the repository
   - Click "Report a vulnerability"
   - Provide detailed information about the vulnerability

### What to Include

When reporting, please include:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact assessment of the vulnerability

### Response Timeline

- **Initial Response**: Within 48 hours
- **Status Update**: Within 7 days
- **Resolution**: We aim to provide a fix within 30 days

---

## Security Architecture

### Overview

GitHub Profile README Builder is a client-side focused application that fetches public GitHub data and generates markdown for profile READMEs. The application does not store user credentials or sensitive data.

### Data Flow

```
User Input (GitHub Username)
        │
        ▼
┌───────────────────┐
│  Next.js Client   │
└───────────────────┘
        │
        ▼ (API Routes)
┌───────────────────┐
│  GitHub API       │ ──► Public Data Only
│  (External)       │
└───────────────────┘
        │
        ▼
┌───────────────────┐
│  Markdown Output  │
│  (User Copy)      │
└───────────────────┘
```

---

## Security Considerations

### 1. GitHub API Integration

#### Rate Limiting

- GitHub API has rate limits (currently 60 requests/hour for unauthenticated requests)
- The application implements request caching to minimize API calls
- Consider implementing GitHub OAuth for higher rate limits in production

#### Data Privacy

- Only **public** GitHub data is fetched
- No private repositories, private gists, or private activity data
- User data is not stored on our servers

#### Token Handling

- If implementing GitHub OAuth, tokens should be:
  - Stored server-side only
  - Encrypted at rest
  - Never logged or exposed in client-side code
  - Rotated periodically

### 2. Input Validation

#### Username Validation

- GitHub usernames must be validated before API requests
- Allowed characters: alphanumeric, hyphens, underscores
- Length constraints: 1-39 characters
- Reject any input containing path traversal or special characters

```typescript
// Example validation pattern
const USERNAME_REGEX = /^[a-zA-Z0-9]([a-zA-Z0-9-_]{0,38}[a-zA-Z0-9])?$/;
```

#### Output Encoding

- All user-generated content must be properly escaped
- Markdown output should not allow arbitrary HTML injection
- Use trusted markdown libraries with sanitization

### 3. Client-Side Security

#### State Management (Zustand)

- Client-side state is ephemeral and cleared on page refresh
- No sensitive data should be stored in state management
- Consider encrypting any persisted state

#### Local Storage

- If using local storage for preferences:
  - Never store authentication tokens
  - Implement storage encryption for sensitive preferences
  - Provide user control to clear stored data

#### XSS Prevention

- React's built-in XSS protection is utilized
- Avoid `dangerouslySetInnerHTML` with user input
- Sanitize any markdown rendered as HTML

### 4. Server-Side Security

#### API Routes

- All API routes should implement:
  - Input validation and sanitization
  - Rate limiting per IP/user
  - Error handling that doesn't leak sensitive information
  - Request timeout limits

#### Next.js Security Headers

The following security headers are recommended in `next.config.ts`:

```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Content-Security-Policy', value: "default-src 'self'" },
        ],
      },
    ];
  },
};
```

### 5. Dependency Security

#### Regular Audits

- Run `npm audit` regularly to check for vulnerabilities
- Subscribe to GitHub Security Advisories for dependencies
- Update dependencies promptly, especially critical security patches

#### Known Dependencies

| Package      | Purpose          | Security Note                 |
| ------------ | ---------------- | ----------------------------- |
| next         | Framework        | Keep updated to latest stable |
| react        | UI Library       | Latest version recommended    |
| zustand      | State Management | No sensitive data in state    |
| lucide-react | Icons            | Verify icon sources           |

### 6. Production Deployment

#### Environment Variables

- Never commit `.env` files or environment variables to version control
- Use `.env.local` for local development (already in `.gitignore`)
- Production secrets should be managed through secure secret management

#### Recommended Environment Setup

```
# Required
GITHUB_TOKEN=  # For higher API rate limits (optional)

# Optional - for analytics
NEXT_PUBLIC_ANALYTICS_ID=  # If using analytics
```

#### HTTPS

- Always serve production applications over HTTPS
- Enable HSTS (HTTP Strict Transport Security)
- Use modern TLS versions (1.2+)

---

## Security Best Practices for Users

### When Using This Tool

1. **Review Generated Content**: Always review the generated markdown before adding to your profile
2. **Avoid Sensitive Data**: Don't include personal information you wouldn't share publicly
3. **GitHub Token Security**: If using a GitHub token:
   - Never share it publicly
   - Use token scopes wisely
   - Revoke tokens when not in use
   - Monitor token usage

### For Forking/Contributing

1. **Code Review**: All contributions undergo security review
2. **Dependency Updates**: Keep dependencies updated
3. **Test Coverage**: Maintain security-focused test cases

---

## Incident Response

### In Case of Security Breach

1. **Immediate Actions**
   - Isolate affected systems
   - Preserve logs and evidence
   - Assess scope of breach

2. **Communication**
   - Notify affected users within 24 hours
   - Publish incident report
   - Provide remediation steps

3. **Remediation**
   - Patch vulnerabilities
   - Rotate compromised credentials
   - Implement preventive measures

4. **Post-Incident**
   - Conduct thorough review
   - Update security policies
   - Implement lessons learned

---

## Compliance

This project aims to follow security best practices. For enterprise deployments:

- Consider data residency requirements
- Implement audit logging
- Conduct regular security assessments
- Review access controls

---

## Contact

For security-related questions or concerns, please:

- Use GitHub's private vulnerability reporting, OR
- Contact the maintainers through appropriate channels

---

_Last Updated: March 2026_
_This security policy is reviewed quarterly_
