Every field Sift returns carries a `confidence` between 0.0 and 1.0. This page
explains what that number actually measures, why a single global threshold is
the wrong tool, and how to turn confidence into a routing decision that your
finance or operations team will accept.

If you have not read the [quickstart](/samples/sift-api/quickstart), read it
first. It shows a wrong answer returned with `status: succeeded`, which is the
behaviour this page exists to help you handle.

## What confidence measures

Confidence is a calibrated estimate of correctness, measured against a
held-out set of human-verified documents.

Calibrated means something specific and checkable: **across a large batch of
fields that scored 0.80, close to 80% of them are correct.** Not "the model
feels 80% sure". Not "80% of the characters matched". If you collect a thousand
fields at 0.80 and audit them, you should find roughly two hundred errors. When
you measure that on your own corpus, you are testing a claim we are making, and
you should.

Three consequences follow, and all three surprise people.

**Confidence is per field, never per document.** A document has no single
difficulty. A printed invoice with a handwritten amendment produces a 0.99
invoice number and a 0.55 total. Averaging those into one document score would
hide the only field that matters.

**Confidence does not tell you what it got wrong.** A 0.61 total is not "the
total is 61% right". The value is either correct or it is not. The score
estimates which.

**Confidence is not comparable across schemas.** A 0.90 on `invoice.total` and
a 0.90 on `contract.governing_law` were calibrated on different corpora against
different definitions of correct. Do not build one threshold and apply it to
both.

## Why a single threshold is the wrong tool

The common first implementation:

```js
// Do not ship this.
if (field.confidence >= 0.9) accept(field);
else sendToReview(field);
```

This treats every field as equally expensive to get wrong, and they are not.

Consider two fields on the same receipt. If `merchant` is wrong, a category
label is off and somebody fixes it next quarter. If `total` is wrong, you have
paid the wrong amount, and recovering it costs a phone call, an adjustment, and
some trust. Those two failures differ by three or four orders of magnitude in
cost, and the code above spends the same 0.9 on both.

Running one threshold forces a single compromise: set it high and you send
harmless fields to humans, burning review capacity on merchant names. Set it low
and you auto-commit totals you should have checked.

The fix is to stop asking how confident the model is and start asking what the
field costs.

## Set thresholds from the cost of being wrong

For each field in your schema, answer two questions.

**What does a wrong value cost, and who pays it?** Money moved incorrectly,
a compliance breach, and a mislabelled category are three different severities.
Write them down. Being explicit here is most of the work.

**Is the error recoverable, and for how long?** A wrong due date caught before
the payment run costs nothing. The same error caught after costs a late fee and
a conversation. Fields with a short recovery window deserve a higher threshold
than their severity alone suggests.

A worked example for an accounts-payable integration:

| Field | If wrong | Recoverable | Auto-accept at |
|---|---|---|---|
| `total` | Money paid incorrectly | Only before the payment run | `≥ 0.98` |
| `currency` | Wrong amount by 80x | Only before the payment run | `≥ 0.99` |
| `due_date` | Late fee, damaged relationship | Until the due date | `≥ 0.95` |
| `invoice_number` | Duplicate payment risk | On reconciliation | `≥ 0.95` |
| `vendor_name` | Wrong ledger account | Any time | `≥ 0.85` |
| `line_item.description` | Cosmetic | Any time | `≥ 0.70` |

These are starting points calibrated on a mixed corpus of digital and scanned
invoices. Measure them against your own documents before you trust them. If
your suppliers all send clean digital PDFs, you can raise the floor and reclaim
review capacity. If half your intake is photographed on a warehouse floor, you
cannot.

## The routing decision

Three outcomes, not two. The third is the one teams forget to build and then
retrofit under pressure.

**Accept.** Confidence is at or above the field threshold and no
`alternatives` are present. Commit it.

**Review.** Confidence is below the threshold, or `alternatives` is present at
any confidence. Route to a human with the page number and the candidate values.
A reviewer who can see both readings resolves this in seconds.

**Reject.** `value` is `null` with confidence `0.0`, or the document itself
failed quality checks. The field was not found. This is not a weak reading to
be reviewed, it is an absence to be chased, and it usually means you need a
different document rather than a better look at this one.

```js
function route(field, threshold) {
  if (field.value === null) return "reject";
  if (field.alternatives?.length) return "review";
  return field.confidence >= threshold ? "accept" : "review";
}
```

Note that `alternatives` overrides the threshold. A field can score 0.93 and
still carry a second candidate at 0.90, and that near-tie is a stronger signal
of trouble than the headline number. Treat the presence of alternatives as a
review trigger on its own.

## Three failures that look the same in the response

These arrive as low confidence or a null value, and they need completely
different responses. Distinguishing them is what separates an integration that
improves over time from one that plateaus.

**The document was bad.** Blurred, cropped, skewed past correction, or the
wrong document entirely. No model improvement fixes this, and no review queue
should absorb it. Check `document.quality` on the extraction and reject at
intake so the sender can supply a better scan while they still remember sending
it.

**The extraction was wrong.** The document was readable and the model misread
it. This is what the review queue is for, and every correction your reviewers
make is a labelled example. Export them.

**The request was wrong.** You asked for `schema: "invoice"` and sent a packing
slip. Every field comes back null or near-zero and it looks like a catastrophic
model failure. It is not. Check `schema_match` on the response before you
conclude anything else, because this case is common and it wastes the most
diagnostic time.

## Two mistakes that are expensive to undo

**Storing the value without the confidence.** Teams extract, route, and persist
only the accepted value. Six months later someone asks which figures in the
ledger were machine-read and which a human confirmed, and there is no way to
answer. Persist `confidence`, `page`, and whether a human touched it, on every
field, from day one. Reconstructing this later means re-running the corpus.

**Treating the review queue as a fallback rather than a surface.** The queue is
where your hardest documents and your best training data live. Measure it:
which fields land there, which vendors produce them, how long resolution takes.
Teams that instrument the queue find that a handful of senders generate most of
the review load, and that one conversation about scan quality removes more work
than any threshold change.

## Next

- **[POST /v1/extractions](/samples/sift-api/reference-extract)** for the full
  field schema, including `alternatives`, `document.quality`, and `schema_match`.
- Export your reviewer corrections. They are the only data that tells you
  whether these thresholds are right for your documents.
