You will send two documents to the Sift API. The first one will work. The
second one will come back wrong, on purpose, because the most important thing
to learn about an extraction API is what it does when it is not sure.

Budget about five minutes.

## Before you start

You need:

- A sandbox API key. Create one in the dashboard under **Settings → API keys**.
  Sandbox keys start with `sk_test_` and cannot be charged.
- `curl`, or any HTTP client.
- The two sample files below. They are hosted for this tutorial, so you can
  pass the URLs directly and skip the upload step for now.

Set your key as an environment variable so it does not end up in your shell
history:

```bash
export SIFT_KEY="sk_test_your_key_here"
```

## Step 1: Send a clean invoice

Start with a document that is easy: a digitally generated PDF invoice with
selectable text and a conventional layout.

```bash
curl https://api.sandbox.sift.dev/v1/extractions \
  -H "Authorization: Bearer $SIFT_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "document_url": "https://cdn.sift.dev/tutorial/invoice-clean.pdf",
    "schema": "invoice"
  }'
```

You get back a job, not an answer:

```json
{
  "id": "ext_4Kd2PqL4vN",
  "object": "extraction",
  "status": "processing",
  "schema": "invoice",
  "created_at": "2026-09-01T14:32:07Z"
}
```

Extraction is asynchronous. A two-page invoice usually finishes in under three
seconds; a ninety-page contract does not. The API never blocks on the model, so
the response you get first is always a receipt.

## Step 2: Retrieve the result

```bash
curl https://api.sandbox.sift.dev/v1/extractions/ext_4Kd2PqL4vN \
  -H "Authorization: Bearer $SIFT_KEY"
```

```json
{
  "id": "ext_4Kd2PqL4vN",
  "status": "succeeded",
  "schema": "invoice",
  "fields": {
    "invoice_number": {
      "value": "INV-2026-004182",
      "confidence": 0.99,
      "page": 1
    },
    "total": {
      "value": { "amount": 4500000, "currency": "INR" },
      "confidence": 0.98,
      "page": 1
    },
    "due_date": {
      "value": "2026-10-01",
      "confidence": 0.97,
      "page": 1
    }
  },
  "pages": 2,
  "completed_at": "2026-09-01T14:32:09Z"
}
```

Three things to notice before you move on.

**Every field carries its own confidence.** There is no document-level score,
because documents are not uniformly difficult. An invoice can have a crisp
printed total and a handwritten due date, and one number averaging the two
would hide exactly the field you need to check.

**Money comes back as an integer in the currency's minor unit.** `4500000` is
₹45,000.00. This matches the convention used across our APIs and exists for the
same reason: a float that is very slightly wrong is invisible on one invoice
and material across a month of them.

**`page` is on every field.** When a human has to verify a value, the page
number is the difference between a five-second check and a five-minute hunt.

In production you would not poll for this. Register a webhook and let
`extraction.succeeded` come to you. Polling is documented in the reference, but
it is the fallback, not the pattern.

## Step 3: Send a harder one

Now the same call against a photographed receipt: taken on a phone, slightly
skewed, with a faded thermal-printed total.

```bash
curl https://api.sandbox.sift.dev/v1/extractions \
  -H "Authorization: Bearer $SIFT_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "document_url": "https://cdn.sift.dev/tutorial/receipt-photo.jpg",
    "schema": "receipt"
  }'
```

The result:

```json
{
  "id": "ext_8Wn6yBk8R2",
  "status": "succeeded",
  "schema": "receipt",
  "fields": {
    "merchant": {
      "value": "BLUE TOKAI COFFEE",
      "confidence": 0.94,
      "page": 1
    },
    "total": {
      "value": { "amount": 38000, "currency": "INR" },
      "confidence": 0.61,
      "page": 1,
      "alternatives": [
        { "value": { "amount": 88000, "currency": "INR" }, "confidence": 0.31 }
      ]
    },
    "purchased_at": {
      "value": null,
      "confidence": 0.0,
      "page": 1
    }
  },
  "pages": 1,
  "completed_at": "2026-09-01T14:35:11Z"
}
```

**The total is wrong.** The receipt says ₹880.00. Sift returned ₹380.00 with a
confidence of 0.61, and put the correct answer in `alternatives` at 0.31. A
faded `8` on thermal paper looks like a `3`.

Note what did **not** happen. `status` is still `succeeded`. There was no error,
no `4xx`, no exception for your handler to catch. The extraction completed
exactly as designed and produced a wrong answer, and the only signal that
anything is off is a number.

This is the single most important behaviour to internalise, and it is why this
tutorial shows it in step 3 rather than burying it in a note at the end.
If you write your integration against step 1 and discover step 3 in production,
you will have already paid a wrong invoice.

## Step 4: Read the two signals it gave you

Sift told you it was unsure, twice.

`confidence: 0.61` on the total is the first signal. On this schema, anything
below 0.90 means the value should not be committed without a human looking at
it.

The `alternatives` array is the second, and it is the stronger one. Its presence
means the model found more than one plausible reading and had to choose. A
field with alternatives is a field where a human will resolve the question in
about two seconds, because they can see both candidates side by side.

`purchased_at` shows the third case: `value` is `null` and confidence is exactly
`0.0`. That is not low confidence, it is absence. The field was not found. Do
not treat `0.0` as a weak reading of something; treat it as nothing to read.

## What you should do with this

The instinct after step 3 is to raise a threshold and move on. That is half the
answer, and the wrong half to start with.

The right question is not "how confident must the model be" but "what does this
field cost when it is wrong". A merchant name that is wrong is an annoyance. A
total that is wrong is money. Those two fields should never share a threshold,
and deciding them separately is the whole design of a production integration.

[Deciding what to trust](/samples/sift-api/trusting-the-output) walks through
that, including the routing table most teams land on and the two mistakes that
cost the most to undo later.

## Next

- **[Deciding what to trust](/samples/sift-api/trusting-the-output)** turns
  confidence scores into a routing decision your finance team will sign off on.
- **[POST /v1/extractions](/samples/sift-api/reference-extract)** is the full
  contract: every parameter, every field, every failure state.
- Register a webhook before you build anything real. Polling works and will
  quietly become your rate-limit problem.
