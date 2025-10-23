# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please email the maintainer directly rather than opening a public issue.

## Security Measures

### API Key Protection
- ✅ API keys are stored server-side only (no `VITE_` prefix)
- ✅ Gemini API calls are proxied through `/api/explain-code` serverless function
- ✅ Keys are never exposed in client-side JavaScript bundles

### Rate Limiting
- ✅ 10 requests per minute per IP address
- ✅ Rate limit headers included in responses
- ✅ 429 status code returned when limit exceeded

### Input Validation
- ✅ Skill level validated against whitelist
- ✅ Code length limited to 10,000 characters
- ✅ Empty code rejected
- ✅ Type checking on all inputs

### Security Headers
- ✅ `X-Content-Type-Options: nosniff`
- ✅ `X-Frame-Options: SAMEORIGIN`
- ✅ `X-XSS-Protection: 1; mode=block`
- ✅ `Referrer-Policy: strict-origin-when-cross-origin`

### CORS Configuration
- ✅ Configured for production domains
- ✅ Proper preflight handling

## Known Issues

### Development Dependencies (Low Risk)
The following vulnerabilities exist in development dependencies and do not affect production:

- **esbuild** (<=0.24.2): Development server vulnerability - Only affects local dev server
- **vite** (<=6.1.6): File serving issues - Only affects local dev server
- **path-to-regexp** (4.0.0-6.2.2): Backtracking regex - Used in dev tooling
- **undici** (<=5.28.5): Random values & DoS - Used in dev tooling

**Impact**: These vulnerabilities only affect the local development environment and do not impact the production deployment.

**Mitigation**: 
- Production build uses static files only
- Development server should only be run in trusted environments
- Consider updating to Vite 7.x when stable (breaking changes required)

## Environment Variables

### Production (Vercel)
Required environment variables:
- `GEMINI_API_KEY` - Server-side only, never exposed to client

### Local Development
Create a `.env` file (never commit this):
```bash
VITE_GEMINI_API_KEY=your_key_here  # Only for local testing
```

**Note**: In production, the `VITE_` prefix is not used to prevent client-side exposure.

## Best Practices

1. **Never commit `.env` files** - They are in `.gitignore`
2. **Rotate API keys regularly** - Especially if exposed
3. **Monitor API usage** - Check for unusual patterns
4. **Review rate limits** - Adjust based on legitimate usage patterns
5. **Keep dependencies updated** - Run `npm audit` regularly

## Security Checklist

- [x] API keys not in client bundle
- [x] Rate limiting implemented
- [x] Input validation in place
- [x] Security headers configured
- [x] CORS properly configured
- [x] Error messages don't leak sensitive info
- [x] Git history cleaned of secrets
- [x] Environment variables documented
- [ ] Dependency vulnerabilities addressed (requires breaking changes)
- [ ] Consider adding request logging/monitoring
- [ ] Consider adding IP-based blocking for abuse

## Updates

- **2025-10-23**: Initial security implementation
  - Moved API calls to serverless functions
  - Added rate limiting (10 req/min per IP)
  - Added input validation
  - Removed client-side API key exposure
