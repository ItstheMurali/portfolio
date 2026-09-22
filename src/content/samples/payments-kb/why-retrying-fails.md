If a payment was declined, trying the same card again usually fails too. Worse,
each attempt makes the next one slightly more likely to be refused.

This article exists to talk you out of a reasonable-seeming habit. Retrying is
the obvious thing to do, it occasionally works, and doing it repeatedly can get
your card blocked.

## The short version

**One retry is fine.** Genuine glitches happen.

**After two failures, stop and find out why.** Go to [fix a declined
payment](/samples/payments-kb/fix-a-declined-payment).

**Never retry "card declined" or "don't honor" more than once.** These are
the two messages where repeated attempts do the most damage.

## Why a retry rarely changes anything

A decline is almost never a transmission failure. The request reached your
bank. Your bank considered it and said no.

Sending the identical request again asks the same question of the same system
and gets the same answer. Nothing about the second attempt is different: same
card, same amount, same merchant, same balance, same address. The only thing
that has changed is that there are now two refusals on the record instead of
one.

There is one exception. **Insufficient funds** can genuinely change once money
lands. Retrying before it lands is just another refusal.

## Why repeated attempts actively hurt

Banks watch the pattern of attempts, not just each individual one.

Several declines against one card in a short window is the signature of someone
testing a stolen card. Fraud systems are built to catch exactly that. They
can't tell a thief probing from a frustrated customer clicking again, and they
aren't designed to try.

So the fraud system responds the way it's designed to:

**It lowers its tolerance for that card.** Attempts that would have been
approved start being refused, including ones that have nothing to do with us.

**It may put a temporary block on the card.** Typically a few hours, sometimes
until you call.

**It may flag the merchant.** Enough declined attempts from one merchant, and
some banks become cautious about that merchant for other customers too.

That last one is why we bothered writing this page.

## What "do not honor" is really saying

Of all the decline messages, `don't honor` is the one most commonly retried
and the one where retrying is most counterproductive.

It means your bank refused and deliberately withheld the reason. Banks don't
send refusal reasons to merchants, because doing so would tell anyone testing
stolen cards exactly what to change.

So when you retry a do-not-honor, you're asking a question that has already
been answered with a refusal to answer. The response won't change, and each
attempt adds to the pattern described above.

The only useful next action is to call your bank.

## What to do instead

**Read the message.** The decline message tells you which of these you've.
[Decline reasons, explained](/samples/payments-kb/decline-reasons) covers all
of them.

**Fix the cause if it's fixable.** An expired card, a wrong address, or a
mistyped security code are all things you can correct, and the next attempt
then succeeds for a real reason rather than by chance.

**Call your bank if the message doesn't say why.** For "card declined" and "do
not honor", this is the only route. It usually takes a few minutes, and most
turn out to be a fraud hold that they can release immediately.

**Use a different card.** The fastest option when the invoice is due. A card
from a different bank isn't subject to the first bank's objection.

**Pay by bank transfer.** Not subject to card limits, card blocks, or fraud
holds. Details are at the bottom of your invoice. Use the invoice number as the
reference, and allow one to three working days.

## If you have already retried several times

Nothing is broken and you haven't done any lasting damage. But stop, because
the next attempt is now less likely to succeed than the first one was.

1. **Stop trying that card today.** If a temporary block was applied, it will
   usually clear within a few hours.
2. **Pay with a different card or by transfer** if the invoice is due.
3. **Call your bank** to find out what was actually wrong, so it doesn't
   happen again on your next invoice.
4. **Check your statement** for pending authorizations from the failed
   attempts. These aren't charges; your bank releases them within about five
   working days.

If the invoice will be late because of this, tell us before the due date. We do
not chase an invoice we know is being sorted out.

## Why we are telling you this rather than just letting you retry

We could let the retry button take your clicks. It would generate fewer support
conversations in the short term.

But the outcome of that is a customer with a temporarily blocked card, a
pending authorization they don't understand, and an invoice still unpaid. That
is a worse day for you and a longer conversation for us, arriving later and
harder to untangle.

One phone call to your bank, made after the second failure instead of the
eighth, resolves nearly all of these.
