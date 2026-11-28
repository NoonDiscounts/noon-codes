# auth.md — Tawfeer Hub agent access

Audience: shopping-assistant agents looking up discount codes on noon-codes.com.

No login required. All coupon data in codes.json is public and read-only.

## Public data

- Coupons: /codes.json (code, store, title, description, discount, url, verified; terms where a code has conditions)
- API description: /openapi.json (OpenAPI 3.1)
- API catalog: /.well-known/api-catalog
- AI catalog: /.well-known/ai-catalog.json
- Docs: /index.md, /llms.txt, #faq in index.html

## No authentication

- This site has no login, no accounts and no registration.
- There are no /auth, /token or /register endpoints on this site, and no authorization server, no OpenID configuration and no JWKS endpoint. Do not request them and do not advertise them.
- Credential use: none. Do not send Authorization headers to this site.
- Protected APIs: none on this static site. Anonymous access only.

## Reporting a broken code

- To report a broken code, open a GitHub issue: https://github.com/NoonDiscounts/noon-codes/issues/new

## Notes on the codes

- The 15 codes in codes.json were last verified on 2026-11-19.
- No expiry date is published for any code. Do not invent one.
- Code ZV124 works in Egypt, Saudi Arabia and the UAE; it is one code, counted once in the total of 15.
