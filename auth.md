# Auth — Tawfeer Hub

No login required. All coupon data in codes.json is public and read-only.

- Public data: codes.json (code, store, title, expiry)
- Docs: openapi.json (OpenAPI 3.1), #faq in index.html
- No OAuth / OIDC on this static site.
- If protected APIs are added later, publish:
  - /.well-known/oauth-authorization-server (RFC 8414)
  - /.well-known/oauth-protected-resource (RFC 9728)
  - agent_auth block with registration_uri when dynamic client registration is supported.
