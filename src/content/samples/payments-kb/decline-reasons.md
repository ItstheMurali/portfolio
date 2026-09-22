Every declined payment has a reason. This page lists all of them, what each one
means in plain language, and whether trying again can help.

Find your message in the table, then read its section below if you need more.

## All decline reasons

| Message | Meaning | Will retrying help? |
|---|---|---|
| Insufficient funds | Not enough available balance | Yes, once funds are available |
| Card expired | Past its expiry date | No, not until the card is replaced |
| Incorrect details | A number, date, or code was wrong | Yes, if you correct them |
| Address does not match | Billing address differs from your bank's record | Yes, with the right address |
| Card declined | Your bank refused, without a reason | Rarely, and not without calling them |
| Do not honor | Your bank refused and will not say why | Rarely, and not without calling them |
| Card not supported | Your bank blocks this type of payment | No, until your bank lifts the block |
| Card reported lost or stolen | The card has been canceled | No |
| Withdrawal limit exceeded | Past a daily or per-transaction cap | Yes, usually the next day |
| Payment system unavailable | A temporary fault, not your card | Yes, after about ten minutes |

## Insufficient funds

Your account does not have enough available balance. Available balance is not
the same as the number displayed in your banking app: money you have spent that
has not yet cleared is already committed against it.

**Do this:** pay from a different card, or wait for funds to clear and try
again. If you were expecting a deposit to have landed, check that it has
actually settled rather than that it has appeared.

## Card expired

The card is past its expiry date. This is worth checking even when you are sure,
because a card that expired recently still looks entirely normal and will be
refused every single time.

**Do this:** use a current card. If your bank has already sent a replacement,
the new card has a different expiry date and often a different security code,
so re-enter all of the details rather than just the date.

## Incorrect details

One of the values did not match: the card number, the expiry date, or the
three-digit security code on the back.

**Do this:** type the details rather than pasting them. Pasted card numbers
often carry spaces or invisible characters from wherever they were copied. If
the card is stored in your browser, try entering it by hand once; saved details
go stale after a card is replaced.

## Address does not match

The billing address you entered does not match the one your bank holds for the
card.

It must be the address on your **bank statement**, not your delivery address
and not your office. If you have moved recently and not told your bank, their
record is still the old address, and that is the one that must be entered.

**Do this:** enter the address exactly as it appears on your card statement,
including the postcode. If you are unsure, your banking app shows it under your
profile or statement settings.

## Card declined

Your bank refused the payment and did not tell us why.

This sounds unhelpful, and it is, but the silence is deliberate and it is not
ours. Card networks withhold the reason from merchants by design. The only
party who can tell you is your bank, and they can usually tell you in a
two-minute phone call.

**Do this:** call the number on the back of your card. Ask whether there is a
block or a fraud hold on recent transactions. Most of these are a
fraud-prevention hold triggered by an unfamiliar merchant, and your bank can
release it while you are on the phone.

**Do not** keep retrying. See [why retrying usually
fails](/samples/payments-kb/why-retrying-fails).

## Do not honor

Your bank refused and explicitly declined to give a reason. This is a
deliberate instruction from them to stop asking, not a technical fault.

Treat it exactly like **card declined**: call your bank. Retrying is close to
useless here, and repeated attempts against a do-not-honor response are the
fastest way to get a card blocked entirely.

## Card not supported

Your bank does not allow this card to be used for this kind of payment. The
usual causes are a block on international payments, a block on online payments,
or a card type we cannot accept.

Many banks disable international and online payments by default on new cards
and on most debit cards. Nothing on the card tells you this.

**Do this:** ask your bank to enable online or international payments, or use a
different card. If they tell you the card type itself is not supported, a
different card is the only route.

## Card reported lost or stolen

The card has been canceled by your bank. Payments will never succeed on it
again.

**Do this:** use a different card. If you did not report it, call your bank
immediately, because someone else may have.

## Withdrawal limit exceeded

The payment is above a limit set on your account: a single-transaction cap, a
daily total, or a monthly total. Debit cards commonly have limits well below
the account balance.

**Do this:** ask your bank to raise the limit, which many can do immediately
and temporarily. Or wait until the limit resets, usually at midnight. Or pay by
bank transfer, which is not subject to card limits.

## Payment system unavailable

Something failed between us and the card networks. This is not your card and
not your bank.

**Do this:** wait about ten minutes and try again. If it is still happening
after an hour, tell us, because at that point it is our problem to fix and we
may not know about it yet.

## What a decline is not

**It is not a charge.** No money moved. You may see a pending authorization on
your statement for a few days; your bank releases it on its own schedule.

**It is not a judgment about you.** Most declines are a bank's fraud system
being cautious about an unfamiliar merchant, which is the system working as
intended even when it is inconvenient.

**It does not cancel the invoice.** The invoice stays open and payable, and its
due date does not move because an attempt failed.

---

*Building an integration? The same reasons appear as stable `failure_code`
values in the [Ledger API error
reference](/samples/ledger-api/errors.md), with the retry semantics your code
needs. The facts are identical; the audience is not, and so the wording is not
either. Never show the developer-facing message to the person whose card was
refused: it is written for your support staff, in English, and its wording is
not part of any contract.*
