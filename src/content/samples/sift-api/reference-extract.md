Submits a document for extraction against a named schema. Returns an
extraction in the `processing` state; the result arrives on the
`extraction.succeeded` webhook or by retrieving the extraction by id.

```
POST https://api.sift.dev/v1/extractions
```

Requires a secret key with the `extractions:write` scope.

## Request headers

| Header | Required | Description |
|---|---|---|
| `Authorization` | Yes | `Bearer sk_live_…` or `Bearer sk_test_…`. Test keys are accepted only by the sandbox host. |
| `Idempotency-Key` | Yes | Client-generated, at least 128 bits of entropy, one per logical operation. Stored for 24 hours. |
| `Content-Type` | Yes | `application/json`, or `multipart/form-data` when uploading file bytes directly. |
| `Sift-Version` | No | Pins a dated release, for example `2026-09-01`. Omitting it pins to the release current at the account's first call. |

## Request body

Exactly one of `document_url` or `document_id` is required. Supplying both
returns `422 mutually_exclusive_fields`.

| Field | Type | Required | Description |
|---|---|---|---|
| `document_url` | string (uri) | Conditional | HTTPS URL of the source document. Must be reachable without authentication and must resolve within 10 seconds. |
| `document_id` | string | Conditional | Identifier of a document previously uploaded to `/v1/documents`. Prefixed `doc_`. |
| `schema` | string | Yes | The extraction schema. One of `invoice`, `receipt`, `contract`, `purchase_order`, or a custom schema id prefixed `sch_`. |
| `pages` | string | No | Page range to extract, for example `1-4` or `2`. Defaults to all pages. A range beyond the document length is truncated, not rejected. |
| `webhook_url` | string (uri) | No | Overrides the account-level webhook for this extraction only. |
| `metadata` | object | No | Up to 20 key-value pairs, returned unchanged on the extraction and on every webhook for it. Values are strings of at most 500 characters. |

Maximum document size is 50 MB or 500 pages, whichever is reached first.
Accepted types: PDF, PNG, JPEG, TIFF, HEIC.

## Response

`202 Accepted` with an `Extraction` in the `processing` state. The `Location`
header carries the canonical URL of the extraction.

```json
{
  "id": "ext_4Kd2PqL4vN",
  "object": "extraction",
  "status": "processing",
  "schema": "invoice",
  "document_id": "doc_9ZQx4Kp2Lm",
  "metadata": {},
  "created_at": "2026-09-01T14:32:07Z"
}
```

### Extraction

| Field | Type | Description |
|---|---|---|
| `id` | string | Opaque identifier, prefixed `ext_`. |
| `status` | enum | `processing`, `succeeded`, or `failed`. `succeeded` means the extraction completed, **not** that the values are correct. |
| `schema` | string | The schema the document was extracted against. |
| `schema_match` | number | 0.0–1.0. How well the document matches the requested schema. Present only when `status` is `succeeded`. A value below 0.5 usually means the wrong schema was requested. |
| `fields` | object | Map of field name to `Field`. Present only when `status` is `succeeded`. |
| `document` | object | Source document properties, including `quality`. |
| `pages` | integer | Page count of the source document. |
| `failure_code` | string \| null | Populated only when `status` is `failed`. See [Failure codes](#failure-codes). |
| `completed_at` | string \| null | RFC 3339 timestamp, UTC. `null` while processing. |

### Field

| Field | Type | Description |
|---|---|---|
| `value` | any \| null | The extracted value, typed per the schema. `null` means the field was not found in the document. |
| `confidence` | number | 0.0–1.0, calibrated per field against human-verified documents. `0.0` with a `null` value means absence, not low certainty. |
| `page` | integer \| null | 1-indexed page the value was read from. |
| `bbox` | array \| null | `[x0, y0, x1, y1]` in PDF user space, for highlighting the source region. `null` for values inferred rather than read. |
| `alternatives` | array | Other readings the model considered, each with `value` and `confidence`, ordered by descending confidence. Omitted when empty. Its presence indicates a contested reading and should trigger human review regardless of the headline confidence. |

### document.quality

| Field | Type | Description |
|---|---|---|
| `score` | number | 0.0–1.0 overall legibility. |
| `issues` | array | Zero or more of `blur`, `skew`, `crop`, `low_contrast`, `glare`, `handwriting`. |

A `score` below 0.4 means no threshold will rescue the extraction. Reject the
document at intake and request a better capture.

## Errors

Errors use `application/problem+json` per RFC 9457. Branch on `code`, which is
stable, never on `title` or `detail`.

| Status | `code` | Cause | Retry |
|---|---|---|---|
| `401` | `invalid_api_key` | Key revoked, malformed, or sent to the wrong host. | No |
| `403` | `insufficient_scope` | Key lacks `extractions:write`. | No |
| `409` | `idempotency_in_progress` | The original request is still running. | Yes, after a short delay |
| `409` | `idempotency_key_reused` | The key was used with a different body. Caller bug. | No |
| `413` | `document_too_large` | Over 50 MB or 500 pages. | No |
| `415` | `unsupported_media_type` | File type is not an accepted format. | No |
| `422` | `mutually_exclusive_fields` | Both `document_url` and `document_id` supplied. | No |
| `422` | `unknown_schema` | `schema` is not a built-in name or a visible `sch_` id. | No |
| `422` | `document_unreachable` | `document_url` did not resolve within 10 seconds or returned a non-2xx status. | Yes, once the URL is serving |
| `429` | `rate_limit_exceeded` | Quota exhausted for the window. | Yes, after `Retry-After`, with jitter |
| `500` | `internal_error` | Failure on our side. Outcome is **unknown**, not failed. | Yes, with the same `Idempotency-Key` |

### Failure codes

These appear on `failure_code` when `status` is `failed`. They are not HTTP
errors: the request succeeded and the extraction did not.

| `failure_code` | Means | Action |
|---|---|---|
| `document_corrupt` | The file could not be decoded. | Request a new file. |
| `document_encrypted` | Password-protected PDF. | Request an unprotected copy. |
| `document_empty` | No text or image content on any requested page. | Check the `pages` range. |
| `quality_below_threshold` | Legibility too low to attempt extraction. | Request a better capture. |
| `processing_timeout` | Exceeded the 10-minute ceiling. | Retry, or split the document. |

## Idempotency

`Idempotency-Key` is required. A replay with an identical body returns the
stored response verbatim with `Idempotent-Replay: true` and does not create a
second extraction. A replay with a different body returns `409
idempotency_key_reused` and processes nothing. Keys are forgotten after 24
hours.

A `5xx` on this endpoint means the outcome is unknown. Retry with the **same**
key. Retrying with a new key is how duplicate extractions, and duplicate
charges, are created.

## Rate limits

100 requests per 60-second window per account by default. Responses carry
`RateLimit` and `RateLimit-Policy` using the structured-field syntax of
`draft-ietf-httpapi-ratelimit-headers`, which is an Internet-Draft rather than
a published RFC; treat those two as advisory pacing information and depend on
`Retry-After`, which is standardized in RFC 9110.

Submission is cheap and retrieval is not. Use webhooks rather than polling. An
integration that polls every extraction every second will exhaust its quota on
retrieval before it exhausts it on work.
