Release `2026-09-01` changes how refund headroom is calculated. This guide
tells you whether you are affected, how to confirm it from your own logs, what
to change, and how to verify the change before you pin to the new release.

If you issue at most one refund per payment, you are not affected and you can
stop reading after the next section.

## Are you affected?

You are affected if **both** of these are true:

1. Your integration issues more than one refund against a single payment.
2. It issues them without waiting for each refund to reach a terminal state.

The second condition is the one that catches people. A worker pool that
processes a refund queue in parallel meets it. A retry that fires before the
first attempt settles meets it. A nightly batch that issues one refund per
payment does not.

### Confirm it from your own data

Run this against your refund records. It finds payments where two refunds were
created within the settlement window of each other:

```sql
SELECT payment_id, COUNT(*) AS overlapping
FROM refunds r1
WHERE EXISTS (
  SELECT 1 FROM refunds r2
  WHERE r2.payment_id = r1.payment_id
    AND r2.id <> r1.id
    AND r2.created_at BETWEEN r1.created_at
                          AND r1.created_at + INTERVAL '5 minutes'
)
GROUP BY payment_id;
```

No rows means you are not affected in practice, whatever your code allows.
Rows mean you have been relying on the old behaviour, whether or not it has
over-refunded anything yet.

## What changed

Before `2026-09-01`, `refund_amount_exceeded` was evaluated against refund
amounts that had been *requested*. From `2026-09-01`, it is evaluated against
refunds that have *settled*.

The old behaviour allowed two concurrent ₹600 refunds against a ₹1,000 payment
to both be accepted, because neither had settled when the other was checked.
The result was a ₹1,200 refund against a ₹1,000 payment, and a reconciliation
entry nobody could explain a month later. Which of the two requests won was
decided by the gap between them, which is not a contract anyone can build on.

Two related fields changed with it:

- `Payment.amount_refunded` now counts only `succeeded` refunds.
- `Payment.amount_refund_pending` is new, and counts refunds still
  `processing`.

Available headroom is now the subtraction you would expect:

```
headroom = amount - amount_refunded - amount_refund_pending
```

## Migrate

### If you fan out refunds in parallel

Serialise them per payment. Refunds against *different* payments can still run
concurrently; only refunds against the *same* payment need ordering.

```js
// Before: every refund for a payment dispatched at once.
await Promise.all(
  refundRequests.map((r) => ledger.refunds.create(r.paymentId, r.body))
);

// After: concurrent across payments, sequential within one payment.
const byPayment = groupBy(refundRequests, (r) => r.paymentId);

await Promise.all(
  Object.values(byPayment).map(async (requests) => {
    for (const r of requests) {
      const refund = await ledger.refunds.create(r.paymentId, r.body);
      await waitUntilTerminal(refund.id);
    }
  })
);
```

### If you compute headroom client-side

Include the pending total. Reading `amount_refunded` alone will now overstate
what is available, because pending refunds are no longer counted in it.

```js
// Before
const headroom = payment.amount.amount - payment.amount_refunded.amount;

// After
const headroom =
  payment.amount.amount -
  payment.amount_refunded.amount -
  payment.amount_refund_pending.amount;
```

### Handle the rejection you will now receive

`422 refund_amount_exceeded` is no longer necessarily a caller bug. It can now
mean "an earlier refund has not settled yet", which is transient.

Distinguish the two cases by checking pending headroom. If pending refunds
account for the shortfall, wait and retry. If they do not, the request is
genuinely over the payment total and retrying will never help.

```js
try {
  await ledger.refunds.create(paymentId, body);
} catch (err) {
  if (err.code !== "refund_amount_exceeded") throw err;

  const payment = await ledger.payments.retrieve(paymentId);
  const pending = payment.amount_refund_pending.amount;

  if (pending > 0) {
    // Transient: an earlier refund is still settling.
    await scheduleRetry(paymentId, body, { afterSeconds: 60 });
  } else {
    // Terminal: this genuinely exceeds the payment.
    await routeToOperations(paymentId, body);
  }
}
```

Do not retry `refund_amount_exceeded` on a fixed schedule without this check.
A genuine over-refund retried every minute is a loop that never exits.

## Verify before you pin

The sandbox runs both behaviours, selected by the `Ledger-Version` header, so
you can test the change without touching production.

1. Create a payment of ₹1,000 in sandbox and let it settle to `succeeded`.
2. Issue a ₹600 refund. Do **not** wait for it to settle.
3. Immediately issue a second ₹600 refund with
   `Ledger-Version: 2026-09-01`.
4. **Expected:** `422 refund_amount_exceeded`, and
   `amount_refund_pending` on the payment reads `60000`.
5. Repeat step 3 with `Ledger-Version: 2026-06-15`.
6. **Expected:** `201`, both refunds accepted, total refunded ₹1,200 against a
   ₹1,000 payment. This is the defect the release fixes, reproduced
   deliberately so you can see the difference.

If step 4 returns `201`, your header is not being sent. Check it on the request
rather than on the client configuration; several SDK versions accept a default
version at construction time and drop it on per-call overrides.

## Timeline

| Date | What happens |
|---|---|
| 2026-09-01 | Release available. Opt in with the header. Nothing changes for accounts that do not. |
| 2027-03-01 | New accounts default to `2026-09-01` or later. Existing pins are untouched. |
| 2027-09-01 | Earliest date the old behaviour is removed. At least 90 days' notice by email to account owners before it is. |

You have twelve months. The old behaviour is not being removed abruptly,
because the integrations most likely to depend on it are the ones least likely
to be under active development.

## If you cannot migrate in time

Serialising refunds per payment is the correct fix, and it is small. If it is
genuinely blocked, there is one interim measure that is safe:

Keep a short-lived lock per `payment_id` on your side, held for the duration of
a refund request and released when the refund reaches a terminal state. This
reproduces the ordering the API now expects, without restructuring your worker
pool.

What will **not** work: raising the requested amount check on your side, adding
a client-side delay between refunds, or catching `refund_amount_exceeded` and
retrying blindly. The first two assume the settlement window is predictable,
and it is not. The third turns a rejected refund into a retry loop.

## Getting help

Quote the `request_id` from any error body when you contact support. It
identifies the exact request in our logs and turns a diagnostic conversation
into a lookup.

If this guide named a cause that turned out not to be your cause, that is a
documentation defect and it is treated with the same severity as a wrong code
sample. Report it with the `request_id` and the `code`.
