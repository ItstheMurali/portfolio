Most people reach this page mid-problem, not at the start of a reading session.
So it is a signpost, not an introduction.

**Pick the thing that is happening to you.**

## Something went wrong

| What you are seeing | Go here |
|---|---|
| A payment was declined | [Fix a declined payment](/samples/payments-kb/fix-a-declined-payment) |
| You want to know what a specific decline message means | [Decline reasons, explained](/samples/payments-kb/decline-reasons) |
| You have tried the same card several times and it keeps failing | [Why retrying a declined card usually fails](/samples/payments-kb/why-retrying-fails) |
| You were charged twice | Contact us with both receipt numbers. Do not issue a stop-payment; it makes the refund slower, not faster. |
| An invoice looks wrong | Reply to the invoice email before paying. A paid invoice has to be refunded and reissued, which takes longer than a correction. |

## Nothing is wrong, you just need to do something

- **Pay an invoice.** Open the link in your invoice email. You do not need an
  account, and you should not be asked to create one.
- **Change the card on file.** Settings → Payment methods → Replace. The change
  applies to your next invoice, not to one that is already being collected.
- **Get a receipt.** Every successful payment sends one within a few minutes.
  If it has not arrived, check the address on the invoice rather than your
  spam folder first; a typo in the billing email is more common than a filter.
- **Change who receives invoices.** Settings → Billing contacts. Add the new
  person before removing the old one, so no invoice arrives with nobody to
  receive it.

## How payments work here, briefly

Knowing this makes the rest of these articles easier to follow.

**An invoice becomes payable when it is issued.** Before that it is a draft,
and a draft can change. After it is issued, the amounts are fixed; a correction
is made by canceling the invoice and issuing a new one, not by editing it.

**A payment attempt is separate from the invoice.** You can attempt payment on
one invoice several times, with different cards. The invoice stays open until
one attempt succeeds. A failed attempt does not cancel the invoice and does not
mean you owe less.

**A declined payment is not a charge.** No money moves. You may still see a
pending authorization on your statement for a few days. Your bank releases
those on its own schedule and we cannot hurry it.

**Refunds go back to the card that paid.** Always. We cannot redirect a refund
to a different card or to a bank account, because the refund travels back along
the same path the payment took.

## What we will never ask you for

Worth knowing, because payment problems attract people impersonating support.

We will never ask for your full card number, your PIN, your online banking
password, or a one-time code from your bank. We will never ask you to move
money to a "holding account" to verify it.

If someone contacts you claiming to be us and asks for any of that, it is not
us. Invoices from us are always payable through a link on the invoice itself,
never through a new address someone sends you separately.

## Still stuck

Have your **invoice number** ready. It starts with `INV-` and is at the top of
the invoice.

If you have a decline message, include it word for word. "It said something
about funds" and "it said `do_not_honor`" lead to two completely different
conversations, and the second one is much shorter.

---

*Building an integration rather than paying an invoice? The [Ledger API error
reference](/samples/ledger-api/errors.md) covers the same decline reasons in
the form your code needs to branch on.*
