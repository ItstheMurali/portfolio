This is a prose linting system: a Vale ruleset and a CI pipeline that enforce
editorial standards on documentation the way a linter enforces them on code.

It exists because editorial review does not scale. One editor, applying good
judgment one document at a time, is a bottleneck and a single point of
failure. The rules below encode the judgments that can be encoded, so the
editor's time goes to the ones that cannot.

## The principle: every rule names its defect

A rule that cannot name the defect it prevents is a preference, and preferences
do not belong in a build gate.

So every rule in this system carries the failure it stops. This is not
documentation of the ruleset; it is the admission criterion for it. A proposed
rule that cannot complete the sentence "without this, a reader will…" is
rejected, however tidy the writing it would produce.

The practical benefit is at the moment of failure. A writer who trips
`Docs.FutureTense` sees the defect, not just the correction, and learns the
standard. A writer who sees `avoid "will"` learns to avoid the word and nothing
else.

## Severity policy

Two levels, and the split is deliberate.

**`error` blocks the merge.** Reserved for defects that mislead the reader, or
that make the documentation wrong rather than merely worse. A wrong instruction
and a broken cross-reference qualify. Awkward phrasing does not.

**`warning` reports and does not block.** For patterns that are usually
worth changing and sometimes are not. The writer sees it and decides.

There is no `suggestion` level here, although Vale offers one. Three levels
invites a tier nobody reads, and a rule nobody reads is worse than absent: it
adds noise that trains writers to skim the output, which is how the `error`
lines get skimmed too.

**The test for `error`:** would a reviewer block a pull request over this? If
no, it is a `warning`. Severity is not a measure of how strongly the style
guide feels; it is a measure of reader harm.

## The rules

### Correctness

These are `error`. They stop documentation that is wrong.

**`Docs.BrokenRefs`** flags a relative link whose target file does not exist.

*Defect prevented:* a reader following a cross-reference reaches a 404 and
loses the thread. This is the highest-frequency defect in any documentation set
with more than fifty pages, because renaming a file is easy and finding
everything that pointed at it is not.

**`Docs.VersionedCommands`** flags a version number in a command example that
does not match the version in `docs/_data/versions.yml`.

*Defect prevented:* a reader copies an install command that pins a release from
eighteen months ago. Version numbers in prose rot silently; nothing fails until
someone runs the command.

**`Docs.PlaceholderLeft`** flags `TODO`, `TKTK`, `FIXME`, `XXX`, and `lorem
ipsum`.

*Defect prevented:* a placeholder ships. This happens more than anyone admits,
and it is the cheapest possible thing to catch automatically.

**`Docs.RequiredFrontmatter`** flags a page missing `title`, `description`, or
`last_reviewed`.

*Defect prevented:* a page with no description gets an auto-generated search
snippet from its first sentence, which is usually a subordinate clause. A page
with no `last_reviewed` date cannot be audited for staleness, so it never is.

### Clarity

These are `error` where the pattern reliably misleads.

**`Docs.AmbiguousPronoun`** flags `it`, `this`, `that`, and `they` when they
open a sentence that follows a sentence with two or more candidate nouns.

*Defect prevented:* "Restart the service and clear the cache. This can take a
minute." Which one? The reader guesses, and half of them guess wrong. In a
procedure, a wrong guess is a wrong action.

**`Docs.DirectionalWords`** flags `above`, `below`, `see here`, `click here`,
and `as shown on the right`.

*Defect prevented:* the reference breaks on a narrow screen, in a
single-page-per-topic export, or for a screen reader, where "below" has no
meaning. Naming the target instead of its position survives every rendering.

**`Docs.ConditionAfterAction`** flags a step beginning with an imperative verb
and containing `if` after the comma.

*Defect prevented:* "Restart the service if the check fails." The reader has
already restarted the service by the time they learn it was conditional. In a
procedural step, the condition must precede the action.

**`Docs.StepHasOneAction`** flags a numbered list item containing more than one
imperative verb joined by `and` or `then`.

*Defect prevented:* the second action is skipped when the reader is interrupted
between them, and interruption during a procedure is the normal case rather
than the exception.

> These last two rules are not new standards. They are rules 1 and 7 of the
> [Orchestrator manual](/samples/orchestrator-manual/about-this-manual), which
> states its writing rules in its front matter so a reviewer can check
> compliance. That manual relies on a human holding to them. This ruleset is
> the same two rules with the human taken out of the enforcement path, which
> is the only version that survives a team growing past one careful writer.

### Consistency

These are `warning`. They are usually right.

**`Docs.TermSubstitutions`** maps informal or drifting terms to the approved
one: `log in` for `sign in` and `signin`, `select` for `click on`, `uninstall`
for `remove the app`.

*Defect prevented:* a reader searching the help center for the word on the
screen finds nothing, because three articles used three words for one action.
Terminology drift is invisible to each individual author and obvious in
aggregate.

**`Docs.FutureTense`** flags `will` in descriptions of system behavior.

*Defect prevented:* "the service will start" reads as a prediction. "The
service starts" reads as a fact. In reference documentation the difference
matters, because the reader is deciding whether to depend on the behavior.

**`Docs.Wordiness`** maps padding to its replacement: `in order to` to `to`,
`at this point in time` to `now`, `is able to` to `can`.

*Defect prevented:* nothing, individually. In aggregate it is the difference
between a page that is scanned and a page that is abandoned. Correctly a
`warning`; a wordy sentence is not a wrong sentence.

### Accessibility

**`Docs.AltText`** (`error`) flags an image with no alt attribute or with alt
text of fewer than 5 characters.

*Defect prevented:* a screen-reader user reaches a diagram and receives
nothing, or receives `img`. Where a diagram carries information the prose does
not, this is the whole page lost.

**`Docs.LinkText`** (`error`) flags link text of `here`, `this`, `link`, `read
more`, or a bare URL.

*Defect prevented:* screen-reader users navigate by a list of links, stripped
of surrounding prose. Nine links called "here" is nine identical entries. This
also improves the page for everyone who skims, which is everyone.

## Rules deliberately not written

This section matters as much as the rules, and it is the part most style
systems omit.

Over-linting prose teaches writers to fight the tool. Once a writer starts
rephrasing to satisfy a linter rather than to serve a reader, the system has
inverted its purpose, and every rule after that point costs more than it
returns.

**Sentence length.** Considered and rejected as a global rule. A 30-word
sentence in a conceptual explanation can be correct; a 25-word sentence in a
procedural step is not. The rule that survived is scoped: `Docs.StepLength`
applies a 20-word ceiling inside numbered steps only, where the constraint has
a reason.

**Passive voice.** Rejected. Passive voice is frequently the right choice in
technical writing, because it puts the reader's object of interest in the
subject position: "the invoice is finalized" is better than "the system
finalizes the invoice" when the invoice is what the reader cares about. A
passive-voice linter produces a large number of false positives, and a rule
with a high false-positive rate trains writers to ignore the output.

**Readability scores.** Rejected. Flesch-Kincaid and its relatives measure
syllable and sentence length, which are proxies for difficulty rather than
difficulty itself. "Deprecate the idempotency key" scores as easy. A gate on a
proxy optimizes the proxy.

**Inclusive-language substitutions.** Not rejected, but not automated here.
These are handled by a shared, separately versioned Vale package maintained
across the organization, because the list changes on a different cadence than
this ruleset and should not require a pull request to this repository.

**Headings must be sentence case.** Rejected as an `error`, kept as a
`warning`. A heading in title case is inconsistent; it is not wrong, and it
does not mislead anyone. Blocking a merge over capitalization is how a build
gate loses its credibility.

## How it runs

Vale runs on every pull request that touches `docs/`, against the changed files
only. A full-corpus run happens nightly and opens an issue on new failures,
which keeps the pull-request check fast while still catching the case where
a change elsewhere invalidates a cross-reference.

Results are posted as **inline annotations on the diff**, with file and line.
This is not cosmetic. A CI failure that says only "Vale found 12 errors"
requires the writer to reproduce locally to find them, and a check that is
awkward to act on is a check that gets routed around.

The configuration and the workflow are in
[vale.ini and the custom styles](/samples/docs-governance/vale-config) and
[docs-quality.yml](/samples/docs-governance/ci-workflow).

## Measuring whether it works

A governance system that is never evaluated is a governance system that
accumulates rules.

Three things are tracked:

**Failures by rule, monthly.** A rule that never fires is either fully
internalized, in which case it is cheap to keep, or it is unnecessary. A rule
that fires constantly is either catching a real and persistent problem, or it
is wrong and is being worked around.

**Suppression comments.** Every `vale off` in the corpus is reviewed quarterly.
A cluster of suppressions around one rule means the rule has false positives,
and the correct response is to fix the rule rather than to accept the
suppressions.

**Time from pull request to merge on docs changes.** If this rises after a rule
lands, the rule is costing more than it returns, whatever its hit rate.

The ruleset has lost 3 rules to this review and gained 6. Removing a rule that
is not earning its place is the maintenance, not a failure of the original
design.
