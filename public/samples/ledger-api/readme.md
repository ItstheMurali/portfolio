# Ledger API — Spec-First Billing Documentation System

> A production-grade API documentation system that cannot ship a defect of the kinds it knows about, enforced by a governance ruleset that runs in CI.

---

## Overview

Ledger API demonstrates spec-first design for billing and invoicing. It fuses three rare skills:

- **Structured authoring rigor** (S1000D/iSpec 2200 from aerospace)
- **Payments domain depth** (Google Ads Billing pod)
- **Tool-building mindset** (Culvert, pipeline architecture)

### What's Included

| File | Purpose |
|------|---------|
| `openapi.yaml` | OpenAPI 3.1.1 specification (8 operations, 19 schemas, 3 webhooks) |
| `redocly.yaml` | Governance ruleset (25 rules: 16 built-in + 9 custom) |
| `docs/errors.md` | Error reference (8 codes, one cause + one fix each) |
| `DESIGN-DECISIONS.md` | 11 design decisions with full rationale |
| `docs/reference.html` | Interactive API documentation (auto-generated) |
| `.github/workflows/` | CI/CD: automatic validation on every PR |

### Quick Start

```bash
# Install
npm install

# Validate spec against 25 governance rules
npm run lint

# Build interactive documentation
npm run build

# Run all tests
npm run validate
```

---

## Why This Matters

### The Problem

Most API documentation:
- ✗ Mixes content types (explanation in error docs, examples in reference)
- ✗ Leaves error scenarios partial (documents 200, leaves 4xx to inference)
- ✗ Treats floating-point money as normal (hides rounding defects until reconciliation)
- ✗ Returns 4xx for business failures (causes unnecessary retries and abuse flags)
- ✗ Lives in docs that drift from code

### The Solution

This project:
- ✓ Governance rules run in CI (catches categories of defects automatically)
- ✓ Every error code documents one cause + one fix
- ✓ Money is always integer minor units (no IEEE-754 surprises)
- ✓ HTTP status ≠ business outcome (declined payments return 201)
- ✓ Spec is the source of truth (docs auto-generated, always in sync)

---

## Key Highlights

### 1. Governance Ruleset (25 Rules)

**Built-in (16 rules)**
- Enforce naming conventions (camelCase, PascalCase, lowercase_underscore)
- Require descriptions on every field and parameter
- Validate response codes are documented

**Custom (9 rules)**
- `rule/no-floating-point-money`: Blocks `type: number` on amount fields
- `rule/every-operation-documents-401`: All endpoints document auth errors
- `rule/every-operation-documents-429`: All endpoints document rate limits
- `rule/summary-is-not-a-sentence`: One-line, no periods
- And 5 more...

**Negative Test**: 4 defects deliberately injected. All 4 caught. ✓

### 2. Error Taxonomy (8 Codes)

| Status | Code | Cause | Fix |
|--------|------|-------|-----|
| 422 | `validation_failed` | Missing or invalid field | Correct the request |
| 401 | `invalid_api_key` | Key is invalid or expired | Use valid key |
| 403 | `insufficient_scope` | Key lacks permission | Request broader scope |
| 404 | `resource_not_found` | Invoice doesn't exist (or inaccessible) | Use valid ID |
| 409 | `idempotency_key_reused` | Same key, different request | Use new key or same request |
| 422 | `invoice_not_editable` | Invoice in terminal state | Create new invoice |
| 429 | `rate_limit_exceeded` | Too many requests | Retry after delay |
| 500 | `internal_error` | Unexpected failure | Retry with same Idempotency-Key |

See `docs/errors.md` for complete reference.

### 3. Design Decisions (11 Recorded)

Example:

**Decision #1: Declined Payment → 201, not 402**

- **Why**: HTTP status describes whether the REQUEST succeeded, not the BUSINESS OUTCOME
- **Alternative**: Return 402 "Payment Required" for declined cards
- **Cost**: Integrators must check `payment.status`, not HTTP status
- **Benefit**: Prevents unnecessary retries and processor abuse flags

All 11 decisions in `DESIGN-DECISIONS.md`.

### 4. Completeness

```
✓ 8 Operations (invoices, payments, refunds)
✓ 19 Schemas (Invoice, Money, Problem, etc.)
✓ 3 Webhooks (invoice.finalized, invoice.paid, payment.failed)
✓ 8 Error Codes (fully documented)
✓ 1 Authentication Scheme (bearer secret key, environment-scoped)
✓ 25 Governance Rules (all validated)
```

---

## API at a Glance

### Invoices
```bash
POST /v1/invoices                  # Create draft
GET /v1/invoices/{id}              # Retrieve
PATCH /v1/invoices/{id}            # Edit draft
POST /v1/invoices/{id}/finalize    # Move to Open (ready for payment)
POST /v1/invoices/{id}/void        # Cancel
```

### Payments
```bash
POST /v1/payments                     # Capture payment (returns 201 even if declined)
POST /v1/payments/{id}/refunds        # Refund (full or partial)
```

### Webhooks
```
invoice.finalized    # Sent when invoice moved to Open
invoice.paid         # Sent when payment received
payment.failed       # Sent when payment declined
```

---

## Three Choices Worth Arguing About

### 1. Declined Payment → 201 (not 402)

**HTTP status describes request fate, not business outcome.**

```javascript
// Response
HTTP 201 Created
{
  "id": "pay_123",
  "status": "declined",          // ← The actual outcome
  "failure_code": "card_expired"
}
```

If we returned 402, integrators would retry. Payment processors flag retries as abuse. This pattern prevents that.

### 2. Money as Integer Minor Units

**IEEE-754 floats lose precision. Integer minor units don't.**

```javascript
// Correct
{
  "amount": 10050,       // $100.50
  "currency": "USD"
}

// Wrong
{
  "amount": 100.50       // ❌ Becomes 100.5000000000000...
}
```

One transaction hides the error. Scale to a million transactions and reconciliation breaks.

### 3. 404 for Other-Account Resources

**Returns 403 would confirm the ID exists. Returns 404 doesn't.**

```bash
# If API returned 403 "Forbidden"
# Attacker learns: Invoice ID inv_123 exists, I just can't access it

# If API returns 404 "Not Found"
# Attacker learns: Maybe it doesn't exist, maybe I can't access it
# Ambiguity prevents enumeration oracle attacks
```

---

## Structure

```
ledger-api/
├── openapi.yaml                 # API specification (source of truth)
├── redocly.yaml                 # Governance ruleset
├── DESIGN-DECISIONS.md          # 11 design decisions + rationale
├── CONTRIBUTING.md              # How to contribute
├── LICENSE                      # MIT
├── package.json                 # Dependencies & scripts
├── README.md                    # This file
│
├── docs/
│   ├── GETTING_STARTED.md       # Quick start guide
│   ├── errors.md                # Error reference (all 7 patterns)
│   └── reference.html           # Generated interactive docs
│
├── scripts/
│   └── verify-references.js     # Validate all $refs in spec
│
└── .github/
    ├── workflows/
    │   ├── ci.yml               # Lint → Build → Test on PR/push
    │   └── release.yml          # Create versioned releases
    │
    └── ISSUE_TEMPLATE/
        ├── bug_report.md
        └── feature_request.md
```

---

## Usage

### View the Specification

```bash
# Start interactive preview
npm run dev

# Or open in browser
open docs/reference.html
```

### Make Changes

1. Edit `openapi.yaml`
2. Run `npm run lint` (validates against 25 rules)
3. Run `npm run build` (generates documentation)
4. Open pull request

### Verify Everything

```bash
npm run validate
# Runs:
# 1. npm run lint          (governance rules)
# 2. npm run build         (documentation generation)
# 3. npm run test:references  (reference validation)
# 4. npm run test:governance  (rule enforcement)
```

---

## Governance in Action

### Example: Float Amount Field

You try to add:
```yaml
Money:
  type: object
  properties:
    amount:
      type: number  # ❌ FLOAT
      description: "Amount in cents"
```

Running `npm run lint`:
```
✗ rule/no-floating-point-money
  Location: components/schemas/Money/properties/amount
  Message: Money fields must use type: integer, not number
  Severity: error
```

Build fails. Fix:
```yaml
amount:
  type: integer  # ✓ INTEGER
  minimum: 0
  description: "Amount in minor units (cents)"
```

---

## Testing & Quality

### Governance Test

The ruleset is tested against a spec with 4 deliberately injected defects:

1. **Float on amount** → Caught by `rule/no-floating-point-money`
2. **Undocumented 401** → Caught by `rule/every-operation-documents-401`
3. **Bad operation name** (`Get_Invoice`) → Caught by `rule/operationid-is-camel-case`
4. **Missing description** → Caught by `rule/named-schemas-have-descriptions`

**Result: All 4 caught. ✓**

This proves the rules actually work.

### Reference Validation

```bash
npm run test:references
```

Checks:
- All `$ref` values point to existing schemas
- No orphaned schemas
- Error codes documented match error codes in spec

---

## Standards & References

| Standard | Use | Status |
|----------|-----|--------|
| OpenAPI 3.1.1 | API specification | Stable |
| RFC 9457 | Problem Details format | Stable (Jul 2023) |
| RFC 9110 | HTTP semantics (Retry-After) | Stable (Jun 2022) |
| RFC 6901 | JSON Pointer (for $ref) | Stable |
| draft-ietf-httpapi-ratelimit-headers | Rate limit response fields | Internet-Draft (Rev 11, May 2026) |
| iSpec 2200 | Structured authoring framework | Aerospace standard |

---

## Contributing

See `CONTRIBUTING.md` for:
- How to report bugs
- How to submit features
- Naming conventions
- Testing requirements
- Pull request checklist

---

## FAQ

**Q: Why is this only 8 endpoints?**  
A: Depth over volume. 8 endpoints at this standard are more defensible than 40 at half. Governance catches defects code review misses.

**Q: Why record design decisions?**  
A: Because "seemed good at the time" is not maintainable. New integrators ask the same questions—DESIGN-DECISIONS.md has the answers.

**Q: Why test the ruleset against injected defects?**  
A: Because a ruleset that passes silently is worse than none. We deliberately inject 4 defects and verify the rules catch all 4.

**Q: Can I use this as a template?**  
A: Yes. The patterns (governance, error taxonomy, design records) are reusable. Copy, adapt, and make it your own.

---

## Changelog

See [Releases](https://github.com/muralikrishna/ledger-api/releases) for version history.

---

## License

MIT. See `LICENSE` file.

---

## Author

**Murali Krishna Kolipaka**  
Senior Technical Writer & Information Architect  
Hyderabad, India

- Email: [muralikrishna0293@gmail.com](mailto:muralikrishna0293@gmail.com)
- LinkedIn: [murali-krishna66](https://linkedin.com/in/murali-krishna66)

This is a portfolio demonstration piece. The Ledger API is not a real product,
and no endpoint described here is live.

---

## One More Thing

This project includes a defect that was found during verification:

**RFC 9773 doesn't exist.** The rate-limit response header was cited as "RFC 9773" from memory without verification. It actually comes from `draft-ietf-httpapi-ratelimit-headers` (still a draft as of May 2026).

This mistake is recorded in `DESIGN-DECISIONS.md` #9 rather than quietly fixed. **A plausible-looking wrong citation is the most dangerous class of documentation defect—it survives review precisely because it looks like diligence.**

This is a feature, not a bug. A writer who logs their own mistakes earns more trust than one whose work looks suspiciously perfect.

---

**Built with spec-first discipline. Every endpoint, error code, and decision is defensible.** ✓
