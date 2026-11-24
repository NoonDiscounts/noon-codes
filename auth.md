# auth.md — Tawfeer Hub agent registration

Audience: shopping-assistant agents looking up discount codes on noon-codes.com.

No login required. All coupon data in codes.json is public and read-only.

## Public data

- Coupons: /codes.json (code, store, title, description, verified)
- API description: /openapi.json (OpenAPI 3.1)
- API catalog: /.well-known/api-catalog
- Docs: /index.md, #faq in index.html

## Registration

- Registration: none required for public read access.
- Method: anonymous (no credentials issued, no accounts created).
- To report a broken code, open a GitHub issue: https://github.com/NoonDiscounts/noon-codes/issues/new

## Credential use

- Credential use: none. Do not send Authorization headers to this site.
- Protected APIs: none on this static site. Anonymous access only.

## Discovery

- Protected resource metadata: /.well-known/oauth-protected-resource (anonymous)
- Authorization server metadata: /.well-known/oauth-authorization-server
- Issuer: https://noon-codes.com (must match issuer in oauth-protected-resource authorization_servers)
- agent_auth block (anonymous): register_uri https://github.com/NoonDiscounts/noon-codes/issues/new, credential_types_supported [none], claim_uri https://github.com/NoonDiscounts/noon-codes/issues/new
