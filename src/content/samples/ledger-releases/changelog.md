All notable changes to the Ledger API are recorded here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## How this API is versioned

The API uses **dated releases**, not SemVer. A release is identified by the
date it shipped, and an integration opts into one with the `Ledger-Version`
header:

```
Ledger-Version: 2026-09-01
```

Omitting the header pins the request to the release that was current when the
account made its first API call. An unmaintained integration therefore never
breaks on our schedule.

SemVer is used for the client SDKs, which have a different constraint: an SDK
is a dependency in your build, so it needs a version range your package manager
can reason about. The API is a remote service, so it needs a pin that survives
a deploy you did not perform. `@ledger/node@4.2.0` can target API release
`2026-09-01`; these two numbers are not related and should not be expected to
move together.

**Not breaking**, and therefore shipped without a new dated release: new
optional request fields, new response fields, new enum members in responses.
Clients must ignore unrecognised response fields and tolerate unrecognised enum
members. This is stated in the API description and it is a real obligation; an
integration that fails closed on an unknown enum member will break on an
additive change.

---

## [Unreleased]

### Added
- `invoice.payment_failed` webhook, so a failed collection attempt can be
  handled without subscribing to `payment.failed` and filtering by invoice.

### Deprecated
- `GET /v1/invoices?page=` offset pagination. Cursor pagination has been
  available since 2026-03-01. Offsets will be removed in the first dated
  release after 2027-03-01. See [the migration
  guide](/samples/ledger-releases/migration-2026-09-01) for the pattern.

---

## [2026-09-01]

**Breaking change to refund headroom.** Affects any integration that issues
more than one refund against a single payment. If you issue at most one refund
per payment, nothing in this release changes your behaviour.

**[Full migration guide](/samples/ledger-releases/migration-2026-09-01)**,
including how to detect whether you are exposed and how to verify the fix in
sandbox.

### Changed
- **BREAKING.** `refund_amount_exceeded` is now evaluated against *settled*
  refund totals rather than *requested* totals. A refund issued while an
  earlier refund is still `processing` may now be rejected where it previously
  succeeded.

  Previously, two concurrent partial refunds of ₹600 each against a ₹1,000
  payment could both be accepted, over-refunding by ₹200 and leaving the
  payment in a state that reconciliation could not explain. The window between
  the two requests decided the outcome, which meant a retry storm could
  over-refund a payment without any single request being wrong.

  Callers that issue sequential refunds and wait for each to settle are not
  affected. Callers that fan out refunds in parallel will now receive `422
  refund_amount_exceeded` on the requests that exceed settled headroom.

- `Payment.amount_refunded` now reflects only `succeeded` refunds. It
  previously included `processing` refunds, which made it look like headroom
  was already consumed when it was not yet committed.

### Added
- `Payment.amount_refund_pending`, the total of refunds in the `processing`
  state. Together with `amount_refunded` this gives the full picture the
  previous single field was trying and failing to convey.
- `Refund.settled_at`, distinct from `created_at`, so reconciliation can align
  refunds to settlement windows rather than to request time.

### Fixed
- `412 precondition_failed` was returning the stale `ETag` in the response body
  rather than the current one, so a client following the documented recovery
  path re-sent the same stale value and failed again. The documented path was
  correct; the implementation was not.

---

## [2026-06-15]

### Deprecated
- `Invoice.amount_due`. Superseded by `Invoice.amount_remaining`, which was
  added in 2026-03-01 and carries the same value. Two names for one number is
  an ambiguity the reference could not resolve without saying "these are
  identical", which is a documentation smell rather than a documentation
  solution.

  `amount_due` continues to be populated in every release up to and including
  the first dated release after 2027-06-15, then is removed.

### Added
- `Invoice.void_reason`, populated from the `reason` supplied to
  `voidInvoice`, so the audit trail does not require correlating with the
  webhook payload.

### Fixed
- Rate-limit response fields were documented as **RFC 9773**. No such RFC
  exists. The fields follow `draft-ietf-httpapi-ratelimit-headers`, which is an
  Internet-Draft. No behaviour changed; the documentation was wrong for the
  period between 2026-03-01 and this release, and anyone who implemented
  against the cited RFC number was chasing a document that was never published.

  `Retry-After` is standardised in RFC 9110 and remains the value to depend on.

---

## [2026-03-01]

Initial public release.

### Added
- Invoices: create, retrieve, update, finalize, void, list.
- Payments: create, with `processing` / `succeeded` / `failed` outcomes carried
  in `Payment.status` rather than in the HTTP status code.
- Refunds: full and partial, against a `succeeded` payment.
- Webhooks: `invoice.finalized`, `invoice.paid`, `payment.failed`.
- Cursor pagination on all list endpoints. Offset pagination is available but
  was deprecated on the day it shipped; it exists only to ease migration from
  the internal predecessor, and it is documented as such.
- `Idempotency-Key`, required on every `POST`.
- `If-Match` / `ETag` optimistic concurrency on `PATCH /v1/invoices/{id}`.

---

## What is deliberately not changing

Asked often enough at upgrade planning that it belongs in the changelog rather
than in a support thread.

**A declined payment will continue to return `201`, not `402`.** The HTTP
status describes the fate of the request, not the commercial outcome of the
attempt. This is not under review. The reasoning, and the cost it imposes on
integrators arriving from other payment APIs, is recorded in decision 1 of the
design decisions.

**Money will continue to be an integer in the currency minor unit.** There is
no plan to add a decimal-string representation alongside it. Two
representations of one amount is a reconciliation defect waiting for a
mismatched parser.

**`invoice_number` will remain gapless, and voided numbers will never be
reused.** Several integrations have asked for renumbering after a void. The
sequence is what auditors rely on, and a gap is meaningful information that
renumbering would destroy.

[Unreleased]: https://docs.ledgerapi.dev/changelog#unreleased
[2026-09-01]: https://docs.ledgerapi.dev/changelog#2026-09-01
[2026-06-15]: https://docs.ledgerapi.dev/changelog#2026-06-15
[2026-03-01]: https://docs.ledgerapi.dev/changelog#2026-03-01
