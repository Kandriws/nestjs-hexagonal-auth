## Security Policy

If you discover a vulnerability:

1. DO NOT open a public issue.
2. Email: kewin_live2@hotmail.com with subject: `[SECURITY] <summary>`.
3. Include reproduction steps and potential impact.

Target first response time: 72h.

### Sensitive Areas
- JWT handling (expiration, revocation, refresh flow)
- 2FA / OTP flow
- Rate limiting & brute force protection
- Entity serialization (avoid leaking sensitive fields)

### Reporting Best Practices
- Reproduce locally.
- Do not run tests that affect third‑party data.

Thank you for helping keep the project secure.
