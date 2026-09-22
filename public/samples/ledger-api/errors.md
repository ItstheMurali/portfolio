# Error reference

Every error response from the Ledger API uses `application/problem+json`, the
format defined in [RFC 9457][rfc9457]. Every entry below states one cause and
one fix, because an error page that lists six possible causes is a page that
has moved the diagnosis back onto you.

## Read this first

**Branch on `code`, not on `title`, `detail`, or the HTTP status.** `code` is
part of the contract and will not change for a given condition. `title` and
`detail` are prose written for humans and may be reworded in any release.
Several distinct `code` values share a single status, so the status alone is
never enough to decide what to do.

**A declined payment is not an error.** `POST /v1/payments` returns `201` when
the attempt was made, whatever the commercial outcome. A decline produces a
`Payment` with `status: failed` and a populated `failure_code`. If your error
handler is catching declines, it is catching the wrong thing — see
[Payment failures](#payment-failures).

**Quote `request_id` when you contact support.** It appears on every error body
and identifies the exact request in our logs. Without it, a support
conversation starts with an hour of log archaeology.

### Anatomy of an error body

```json
{
  "type": "https://docs.ledgerapi.dev/errors/validation_failed",
  "title": "Validation failed",
  "status": 422,
  "code": "validation_failed",
  "detail": "One or more fields are invalid.",
  "instance": "/v1/invoices",
  "request_id": "req_8Kd2PqL4vN",
  "errors": [
    {
      "field": "/line_items/2/unit_amount",
      "code": "below_minimum",
      "detail": "unit_amount must be greater than or equal to 0."
    }
  ]
}
```

`field` is a [JSON Pointer][rfc6901] into your request body. Validation
failures report **every** invalid field, not just the first, so a form can be
corrected in a single pass.

---

## Retry policy at a glance

Retrying the wrong error wastes quota and delays recovery. Retrying the right
error without an idempotency key duplicates money movement.

| Status | Retry? | Conditions |
|---|---|---|
| `401`, `403` | No | The credential is wrong or under-scoped. Retrying cannot change that. |
| `404` | No | Unless you are racing a create you have not yet confirmed. |
| `409` `idempotency_in_progress` | Yes | After a short delay. The original is still running. |
| `409` `idempotency_key_reused` | No | Caller bug. Fix key generation. |
| `412` | Yes | Re-read the resource, re-apply your change, resend with the new `ETag`. |
| `422` | No | The request is semantically wrong. Change it first. |
| `428` | Yes | Read the resource, take its `ETag`, resend with `If-Match`. |
| `429` | Yes | After `Retry-After` seconds, with exponential backoff and jitter. |
| `5xx` | Yes | **With the same `Idempotency-Key`.** See [5xx on a write](#5xx-on-a-write-means-unknown-not-failed). |

---

## 401 — Authentication

### `invalid_api_key`

**What happened.** The key in the `Authorization` header is not recognized.

**Why it happens.** Almost always one of three things: the key was revoked, the
header is malformed, or — by far the most common — a `sk_test_` key was sent to
`api.ledgerapi.dev` or a `sk_live_` key to `api.sandbox.ledgerapi.dev`.

**Fix.** Confirm the key prefix matches the host. Confirm the header is exactly
`Authorization: Bearer sk_...` with a single space and no quotes. If the key is
genuinely revoked, issue a new one; revocation is not reversible.

> The environment mismatch returns `401` rather than silently routing to the
> other environment. That is deliberate: it turns the most expensive
> configuration mistake in payments into a loud failure on your first call
> instead of a quiet one at settlement.

**Retry?** No, not without changing the credential.

---

## 403 — Authorization

### `insufficient_scope`

**What happened.** The key is valid but does not carry the privilege this
operation requires.

**Why it happens.** Restricted keys are commonly issued read-only for
analytics or reporting workloads, then reused for a write path.

**Fix.** Use a key with the required scope, or widen the scope of the existing
key. Do not widen a key that is deployed somewhere you would not want writes
to originate from.

**Retry?** No.

---

## 404 — Not found

### `resource_not_found`

**What happened.** No resource with that identifier is visible to this
credential.

**Why it happens.** A typo in the identifier, an identifier from the other
environment, or a resource that belongs to a different account.

**Fix.** Check the identifier and the environment.

> This status is also what you receive when the resource exists but belongs to
> someone else. Returning `403` there would confirm that the identifier is
> real, which is enough to enumerate the identifier space. The ambiguity is
> intentional and will not be removed.

**Retry?** No, unless you are racing a create whose response you have not yet
confirmed.

---

## 409 — Conflict

Both conflicts concern `Idempotency-Key`. They look similar and need opposite
responses, so check `code`.

### `idempotency_in_progress`

**What happened.** A request with this key is still being processed.

**Why it happens.** A client retried before the original response arrived —
usually a client-side timeout shorter than the server's processing time.

**Fix.** Wait and retry with the same key. You will receive either the stored
original response or a fresh result. Consider raising your client timeout above
the 95th-percentile latency for the endpoint.

**Retry?** Yes, after a short delay with backoff.

### `idempotency_key_reused`

**What happened.** This key was already used with a **different** request body.

**Why it happens.** The key is being generated once per session, per customer,
or per day rather than once per logical operation. Reusing a key across two
different operations is the single most common idempotency bug.

**Fix.** Generate a fresh key, with at least 128 bits of entropy, at the moment
the operation is decided — not at the moment the HTTP call is made. All retries
of that one operation share that one key; nothing else does.

**Retry?** No. Retrying with the same key returns the same conflict. Fix key
generation.

---

## 412 and 428 — Concurrency

### `precondition_required` (428)

**What happened.** The operation requires `If-Match` and none was sent.

**Fix.** `GET` the resource, take the `ETag` from the response headers, and
resend with `If-Match: "<etag>"`. Include the quotes; the `ETag` value includes
them.

**Retry?** Yes, with the header.

### `precondition_failed` (412)

**What happened.** Your `If-Match` value does not match the resource's current
`ETag`. **Nothing was written.**

**Why it happens.** Someone else — another operator, another worker, a
scheduled job — modified the invoice between your read and your write.

**Fix.** Re-read the resource, re-apply your change to the current version, and
resend with the new `ETag`. Do not strip `If-Match` to force the write through;
that converts a caught conflict into a silent overwrite of someone else's edit.

**Retry?** Yes, after re-reading.

---

## 422 — Unprocessable content

`422` means the JSON parsed but the request is semantically wrong. Two
families: field validation, and illegal state transitions.

### `validation_failed`

**What happened.** One or more fields failed validation. The `errors` array
names every one.

**Fix.** Correct the fields identified by the JSON Pointers in `errors[].field`.

**Retry?** Not until the body changes.

### `unsupported_currency`

**What happened.** The `currency` value is not an ISO 4217 code we settle in.

**Fix.** Use a supported code. Note that `currency` cannot be changed after the
invoice is created — bill in a different currency with a new invoice.

### `invoice_not_editable`

**What happened.** You attempted to update an invoice that is not in `draft`.

**Why it happens.** The invoice was finalized between your read and your write,
or a retry ran after a successful finalize.

**Fix.** A finalized invoice is a legal document in most jurisdictions and its
line items are frozen by design. Correct it by voiding it and issuing a
replacement, or by issuing a credit note. Do not attempt to edit around this.

### `invoice_has_payments`

**What happened.** You attempted to void an invoice that has at least one
`succeeded` payment.

**Fix.** Refund the payments first, then void. The order matters: voiding an
invoice with captured funds against it would leave money in the account with no
document explaining it, which is precisely what an auditor looks for.

### `invoice_not_open`

**What happened.** You attempted to pay an invoice that is not `open`. Only an
`open` invoice is collectible.

**Fix.** Finalize a `draft` first. A `paid`, `void`, or `uncollectible` invoice
is terminal and cannot be paid.

### `refund_amount_exceeded`

**What happened.** The requested refund would push total refunds above the
payment amount.

**Why it happens.** Usually a second refund issued while a first is still
`processing`. The check runs against settled totals, so the payment object's
`amount_refunded` may suggest headroom that is already committed.

**Fix.** Wait for in-flight refunds to reach a terminal state, then recompute.

---

## 429 — Rate limiting

### `rate_limit_exceeded`

**What happened.** Quota for the current window is exhausted.

**Fix.** Wait `Retry-After` seconds, then retry with **exponential backoff and
jitter**. The jitter is not optional at scale: without it, every throttled
worker retries on the same tick and re-exhausts the window immediately, which
is how a brief throttle becomes a sustained outage.

Read the `RateLimit` and `RateLimit-Policy` response fields to pace yourself
before you are throttled rather than after. These follow
[`draft-ietf-httpapi-ratelimit-headers`][ratelimit-draft], which is an
Internet-Draft rather than a published RFC — depend on `Retry-After`, which is
standardized in [RFC 9110][rfc9110], and treat the other two as advisory.

**Retry?** Yes, with backoff.

---

## 5xx — Server errors

### `internal_error`

**What happened.** The request failed on our side.

#### 5xx on a write means *unknown*, not *failed*

This is the most consequential sentence on this page. A `5xx` on
`createPayment` does not tell you the payment did not happen. The request may
have committed before the failure and lost only its response.

**Fix.** Retry with the **same** `Idempotency-Key`. If the original committed,
you receive the stored response with `Idempotent-Replay: true` and no second
payment is created. If it did not, the retry processes normally.

Retrying a write after a `5xx` with a *new* idempotency key is how duplicate
charges are created.

**Retry?** Yes, with the same key, with backoff.

---

## Payment failures

These are **not** HTTP errors. They arrive as `failure_code` on a `Payment`
with `status: failed`, returned with `201`.

| `failure_code` | Means | What to tell the payer | Retryable |
|---|---|---|---|
| `insufficient_funds` | The account lacked the balance | Use another method or retry later | Yes, later |
| `card_expired` | The card's expiry has passed | Update the card | Only after update |
| `card_declined` | The issuer declined without a specific reason | Contact the issuer or use another method | Rarely succeeds |
| `do_not_honor` | The issuer declined and will not say why | Contact the issuer | Rarely succeeds |
| `invalid_account` | The account does not exist or is closed | Re-enter the details | Only after correction |
| `processor_unavailable` | The network was unreachable | Nothing; transient | Yes, with backoff |

Two rules:

- **Never show `failure_message` to the payer.** It is written in English for
  your support staff and its wording is not part of the contract. Map
  `failure_code` to your own localized copy.
- **Never retry a decline on a fixed schedule.** Issuers treat repeated
  declines against the same card as an abuse signal and will begin declining
  attempts that would otherwise have succeeded.

---

## Reporting a documentation defect

If a page here names a cause that is not the real cause, that is a bug of the
same severity as a wrong code sample. Open an issue with the `request_id` and
the `code`, and it will be treated as one.

[rfc9457]: https://www.rfc-editor.org/rfc/rfc9457
[rfc6901]: https://www.rfc-editor.org/rfc/rfc6901
[rfc9110]: https://www.rfc-editor.org/rfc/rfc9110
[ratelimit-draft]: https://datatracker.ietf.org/doc/draft-ietf-httpapi-ratelimit-headers/
