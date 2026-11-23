# auth.md — Tawfeer Hub agent registration

No login required. All coupon data in codes.json is public and read-only.

- Public data: codes.json (code, store, title, description, verified)
- Docs: openapi.json (OpenAPI 3.1), #faq in index.html
- Audience: shopping-assistant agents looking up discount codes
- Registration: none required for public read access
- If your agent needs to report a broken code, open a GitHub issue on this repo
- Credential use: none. Do not send Authorization headers to this site.
- Protected APIs: none on this static site. Anonymous access only.

- Discovery: /.well-known/oauth-protected-resource (anonymous)
- Issuer: https://noon-codes.com (see /.well-known/oauth-authorization-server)
