# Design decisions

Reference documentation shows *what* an API does. This file records *why* it
does it that way, including the places where a defensible alternative exists
and was rejected. Each entry names the alternative, because a decision record
that only lists the winner is a press release.

---

## 1. A declined payment returns `201`, not `402`

**Decision.** `POST /v1/payments` returns `201` whenever the request was
well-formed and understood. The commercial outcome lives in `Payment.status`
(`succeeded` | `processing` | `failed`) with `failure_code` on failure.

**Alternative rejected.** Return `402 Payment Required` for a decline.

**Why.** An HTTP status code describes the fate of the *request*, not the fate
of the *business operation*. A decline is a successful API call that produced a
negative commercial result — the system worked exactly as designed. Conflating
the two has three concrete costs:

- Client HTTP libraries and SDK middleware treat `4xx` as exceptional. Declines
  end up in a generic error handler that cannot distinguish "your card was
  declined" from "your API key is wrong," and the payer sees the wrong message.
- Generic retry middleware often retries `4xx` conditionally and `5xx`
  unconditionally. A decline routed through that machinery gets retried against
  the issuer, which issuers treat as an abuse signal.
- `402` is [reserved for future use in RFC 9110][rfc9110-402]. Its semantics
  are not defined, so no intermediary can act on it correctly.

**Acknowledged cost.** This differs from some well-known payment APIs, so an
integrator with prior muscle memory will write `if (response.ok)` and treat a
decline as a success. That is a real hazard, and it is mitigated in three
places rather than assumed away: the operation description states it in bold,
the `201` response description enumerates all three states it covers, and the
error reference opens with it.

---

## 2. Money is an integer in the minor unit, inside a `Money` object

**Decision.** `{ "amount": 4500000, "currency": "INR" }`, where `amount` is an
integer count of minor units.

**Alternatives rejected.** A decimal string (`"45000.00"`); a JSON number with
a fractional part; a bare integer alongside a sibling `currency` field.

**Why not floats.** IEEE-754 binary floating point cannot represent most
decimal fractions exactly. The error is invisible on one invoice and material
across a month of reconciliation. This is not a theoretical concern; it is the
most common root cause of a ledger that is off by a few rupees and nobody can
say why.

**Why not decimal strings.** They are exact, but they push parsing onto every
consumer and invite locale-dependent formatting bugs. Integers in the minor
unit are unambiguous in every language without a decimal library.

**Why an object rather than sibling fields.** An `amount` without its currency
travelling beside it is a defect waiting to happen — the two get separated in
logs, in intermediate structs, in a spreadsheet export. Binding them in one
object makes the pair atomic.

**The trap this creates, and how it is documented.** "Minor unit" is not
"divide by 100." JPY and KRW have no minor unit; KWD and BHD have three decimal
places. A client that hardcodes `/100` renders `Yen 4,500` as `Yen 45.00` and
`KD 4.500` as `KD 45.00`. The `Money` schema states all three cases with worked
examples, and `rule/no-floating-point-money` in the governance ruleset blocks a
float amount from ever entering the spec.

---

## 3. Errors use RFC 9457, and clients branch on `code`

**Decision.** `application/problem+json` per [RFC 9457][rfc9457], extended with
`code`, `request_id`, and `errors`.

**Alternative rejected.** A bespoke `{ "error": { ... } }` envelope.

**Why.** RFC 9457 is a published Standards Track document that obsoletes RFC
7807. Using it means existing client tooling can parse the body without custom
code, and `type` gives every error a dereferenceable documentation URL.

**Why a separate `code` field when `type` already identifies the problem.**
`type` is a URI, and URIs get reorganised when documentation moves. `code` is a
short, stable token that is guaranteed never to change for a given condition.
Telling integrators to branch on a URI is telling them to couple their control
flow to our information architecture.

**Why `errors` reports every failure, not the first.** A form with three
invalid fields that reports one at a time costs three round trips and three
moments of user frustration. This is a documentation-visible consequence of an
API design choice, which is why it is stated in the reference rather than left
for integrators to discover.

---

## 4. `404` is returned for resources owned by another account

**Decision.** A resource that exists but belongs to a different account returns
`404`, not `403`.

**Alternative rejected.** `403 Forbidden`, which is more literally truthful.

**Why.** `403` confirms the identifier is real. Given a prefixed identifier
space, that turns a permission check into an enumeration oracle: an attacker
can map which invoice IDs exist without ever reading one.

**Why it is documented rather than left implicit.** Security-by-obscurity that
integrators do not know about generates support tickets — "your API says 404 but
I can see the record in the dashboard." The `404` response description states
the behaviour and says plainly that the ambiguity is deliberate and permanent.
Undocumented defensive behaviour is a support cost; documented defensive
behaviour is a feature.

---

## 5. `Idempotency-Key` is required on `POST`, and conflicts split into two codes

**Decision.** Required on `createInvoice`, `createPayment`, and `createRefund`.
Two distinct `409` codes: `idempotency_in_progress` and
`idempotency_key_reused`.

**Alternative rejected.** One `409 idempotency_conflict`.

**Why the split.** The two conditions require opposite client behaviour. An
in-flight original means *retry shortly*. A key reused with a different body
means *stop and fix your code; retrying is futile*. Collapsing them into one
code forces every integrator to guess, and the common guess — retry — turns a
caller bug into a retry storm.

**Why required rather than optional.** An optional idempotency key is absent
exactly when it matters: in the hand-rolled first integration, on the retry
after the first `5xx`. Making it required moves duplicate-charge prevention
from a best practice into the contract.

**The 24-hour window is stated explicitly** because an integration with a
daily reconciliation job that retries failed writes will fall outside it, and
that failure mode is silent unless documented.

---

## 6. Cursor pagination, with opaque cursors

**Decision.** `limit` plus an opaque `cursor`, with `has_more` and
`next_cursor` in the response.

**Alternative rejected.** `page` and `per_page` offsets.

**Why.** Offsets are computed against a moving result set. On an endpoint where
new records arrive continuously — which is every list endpoint in a billing
system — a record created between page 1 and page 2 shifts everything down by
one, so page 2 re-serves a record already seen and a different record is never
served at all. For a reconciliation job walking invoices, a silently skipped
record is a silently unbilled customer.

**Why `has_more` rather than "stop on an empty page."** A page can be
legitimately empty while more results remain, once filters are applied at the
storage layer. The reference states this explicitly because "loop until the
array is empty" is the instinctive implementation and it is wrong.

---

## 7. `If-Match` is required on update, not optional

**Decision.** `PATCH /v1/invoices/{id}` requires `If-Match`. Missing → `428`;
stale → `412`.

**Alternative rejected.** Last-write-wins, or an optional `If-Match`.

**Why.** Invoices are edited by more than one actor: a human operator, a
scheduled job, a retrying worker. Last-write-wins resolves that silently and
incorrectly, and the loss is discovered at month end, if at all. Requiring the
precondition converts a silent overwrite into a caught, retryable `412`.

**The documented anti-pattern.** The `412` entry in the error reference
explicitly warns against stripping `If-Match` to force the write through, since
that is the fastest way past the error and the exact behaviour the mechanism
exists to prevent. Documenting the workaround you *don't* want is more
effective than hoping nobody finds it.

---

## 8. `finalizeInvoice` is idempotent by state; `Idempotency-Key` is optional there

**Decision.** Calling finalize on an already-`open` invoice returns `200` with
the unchanged invoice rather than an error.

**Alternative rejected.** `422 invoice_not_draft`.

**Why.** The caller's intent — "ensure this invoice is issued" — is already
satisfied. Returning an error for an achieved goal forces every caller to write
the same defensive read-then-act block, which is itself racy. Transitions to
terminal states (`paid`, `void`, `uncollectible`) still return `422`, because
there the caller's mental model is genuinely wrong.

---

## 9. Rate-limit fields are documented as advisory, with their standards status named

**Decision.** Emit `RateLimit` and `RateLimit-Policy` using the structured-field
syntax of `draft-ietf-httpapi-ratelimit-headers`, and say in the documentation
that it is an Internet-Draft rather than a published RFC.

**Alternative rejected.** Cite it as though it were settled, or invent bespoke
`X-` headers.

**Why.** As of revision 11 (May 2026) this is still a draft and the field
shapes have already changed once across revisions — earlier drafts defined
`RateLimit-Limit` / `-Remaining` / `-Reset`, the current one defines a combined
`RateLimit`. An integrator who hardcodes against a draft deserves to know it is
a draft. `Retry-After` is standardised in RFC 9110, so the documentation points
clients at that as the value to depend on.

**Note on this repository's own process.** The first draft of this spec cited
these fields as "RFC 9773." No such RFC exists; the number was asserted from
memory and not checked. It was caught by verifying every normative reference
against its source before publication, and the citation was corrected to the
Internet-Draft. It is recorded here rather than quietly fixed, because a
plausible-looking wrong citation is the most dangerous class of documentation
defect: it survives review precisely because it looks like diligence.

---

## 10. Webhook verification is documented as four numbered rules

**Decision.** The `WebhookEvent` schema carries four explicit rules: hash the
raw body, compare in constant time, enforce a five-minute timestamp tolerance,
and deduplicate on event `id`.

**Alternative rejected.** "Verify the signature using HMAC-SHA256," with the
rest left to the reader.

**Why.** Each of the four omissions is a live vulnerability or outage, not a
style preference:

1. Hashing a re-serialized body changes whitespace and key order, so the digest
   never matches and the integration fails closed on day one.
2. A byte-by-byte comparison leaks the correct signature through timing.
3. Without a timestamp tolerance, a captured valid delivery replays forever.
4. Without deduplication, at-least-once delivery double-provisions or
   double-ships.

Documentation that describes the mechanism but not its failure modes has
transferred information without transferring safety.

---

## 11. Versioning is path-major plus a dated release header

**Decision.** `/v1` in the path; `Ledger-Version: 2026-09-01` to pin a dated
release; omitting it pins to the release current at the account's first call.

**Alternative rejected.** Path-only versioning (`/v2`, `/v3`), or
content-negotiation via `Accept`.

**Why.** Path-only versioning forces a coordinated migration of every endpoint
for a change that affects one, and in practice produces a `/v2` that ships once
every three years and carries a decade of deferred breakage. Dated releases let
a breaking change ship in isolation and let each integration adopt it on its
own schedule.

**Why default to the account's first-call release rather than `latest`.**
Defaulting to `latest` means an unmaintained integration breaks on our release
schedule rather than its own. The documentation still tells integrators to pin
explicitly, because an implicit pin they did not choose is a pin they will not
remember.

**What is defined as non-breaking** — new optional request fields, new response
fields, new enum members in responses — is stated in `info.description`, along
with the two obligations it places on clients: ignore unknown fields, and
tolerate unknown enum members. An additive-change policy that clients do not
know about is not a policy; it is a future incident.

---

[rfc9110-402]: https://www.rfc-editor.org/rfc/rfc9110#section-15.5.3
[rfc9457]: https://www.rfc-editor.org/rfc/rfc9457
