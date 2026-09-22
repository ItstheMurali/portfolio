The enforceable half of the style guide. Each rule carries the defect it
prevents in its `message`, so the writer who trips it reads the reason rather
than only the correction.

Rationale for every rule, and for the rules deliberately not written, is in
[the ruleset and why](/samples/docs-governance/the-rules-and-why).

## .vale.ini

```ini
StylesPath = .vale/styles
MinAlertLevel = warning

# Vocabulary holds product names and approved terms so they are never
# flagged as spelling errors or substituted by a consistency rule.
Vocab = Product

Packages = Google

[*.md]
BasedOnStyles = Vale, Google, Docs

# Google's own rules, adjusted where they conflict with a decision
# recorded in the style guide.
Google.Passive       = NO
Google.WordList      = warning
Google.Headings      = warning
Google.We            = error
Google.FirstPerson   = error

[docs/reference/**.md]
# Reference pages are generated from the OpenAPI specification. Prose rules
# do not apply to generated output; the governance for that content is the
# Redocly ruleset that gates the specification itself.
BasedOnStyles = Vale

[docs/changelog.md]
# Changelog entries are historical records. Past tense is correct here and
# the future-tense rule would fire on every deprecation notice.
Docs.FutureTense = NO
```

## .vale/styles/Vocab/Product/accept.txt

```
Orchestrator
Ledger
Sift
[Ii]dempotenc(y|e)
[Ww]ebhook
OpenAPI
Redocly
Vale
[Rr]unbook
```

## .vale/styles/Docs/AmbiguousPronoun.yml

```yaml
extends: existence
message: >-
  "%s" opens this sentence after two or more candidate nouns. Name the noun.
  A reader who has to guess which one you mean will guess wrong about half
  the time, and in a procedure a wrong guess is a wrong action.
level: error
scope: paragraph
tokens:
  - '(?<=\.\s)(It|This|That|They)\s'
```

## .vale/styles/Docs/DirectionalWords.yml

```yaml
extends: existence
message: >-
  "%s" describes a position on the page, not a target. The reference breaks
  on a narrow screen, in a single-topic export, and for a screen reader.
  Name what you are pointing at instead.
level: error
ignorecase: true
tokens:
  - 'see (above|below)'
  - 'the (table|list|diagram) (above|below)'
  - 'as shown (on the (right|left)|above|below)'
  - 'click here'
  - 'see here'
```

## .vale/styles/Docs/ConditionAfterAction.yml

```yaml
extends: existence
message: >-
  The condition follows the action in this step. The reader performs the
  action before learning it was conditional. Move the "if" clause to the
  front: "If the check fails, restart the service."
level: error
scope: list
tokens:
  - '^(?:[A-Z][a-z]+)\s+[^.]*,\s+if\s'
```

## .vale/styles/Docs/StepHasOneAction.yml

```yaml
extends: existence
message: >-
  This step contains more than one action. Split it. The second action is
  skipped when the reader is interrupted between them, and interruption
  during a procedure is the normal case.
level: error
scope: list
tokens:
  - '^(Enter|Select|Run|Open|Click|Copy|Install|Restart|Delete|Add)\b[^.]*\b(and then|, then|and)\s+(enter|select|run|open|click|copy|install|restart|delete|add)\b'
```

## .vale/styles/Docs/StepLength.yml

```yaml
extends: occurrence
message: >-
  This step runs to more than 20 words. A reader performing a procedure holds
  the whole step in working memory before acting. Split it.
level: warning
scope: list
max: 20
token: '\b\w+\b'
```

## .vale/styles/Docs/PlaceholderLeft.yml

```yaml
extends: existence
message: '"%s" is a placeholder and this page is about to ship with it.'
level: error
ignorecase: true
tokens:
  - 'TODO'
  - 'TKTK'
  - 'FIXME'
  - 'XXX'
  - 'lorem ipsum'
  - '\[insert .{0,30}\]'
```

## .vale/styles/Docs/LinkText.yml

```yaml
extends: existence
message: >-
  Link text "%s" carries no meaning out of context. Screen-reader users
  navigate by a list of links with the surrounding prose stripped away.
  Describe the destination.
level: error
ignorecase: true
scope: link
tokens:
  - '^(here|this|link|read more|more|click here|learn more)$'
  - '^https?://'
```

## .vale/styles/Docs/AltText.yml

```yaml
extends: existence
message: >-
  This image has no usable alt text. Where a diagram carries information the
  prose does not, a screen-reader user loses the page.
level: error
scope: raw
tokens:
  - '!\[\s*\]\('
  - '!\[.{1,4}\]\('
  - '<img(?![^>]*\balt\s*=\s*"[^"]{5,})[^>]*>'
```

## .vale/styles/Docs/TermSubstitutions.yml

```yaml
extends: substitution
message: >-
  Use "%s" rather than "%s". A reader searching for the word on the screen
  finds nothing when three articles use three words for one action.
level: warning
ignorecase: true
swap:
  'sign in|signin|log on':   log in
  'sign out|signout|log off': log out
  'click on':                 select
  'remove the app':           uninstall
  'hit (the )?enter':         press Enter
  'tick the box':             select the checkbox
  'greyed out':               unavailable
```

## .vale/styles/Docs/FutureTense.yml

```yaml
extends: existence
message: >-
  "%s" states system behavior as a prediction. Use the present tense: "the
  service starts", not "the service will start". The reader is deciding
  whether to depend on this behavior.
level: warning
tokens:
  - '\bwill (be |then )?(start|stop|return|send|create|display|show|appear)\w*'
```

## .vale/styles/Docs/VersionedCommands.yml

```yaml
extends: script
message: >-
  Version %s in this command does not match the current release in
  docs/_data/versions.yml. Version numbers in prose rot silently: nothing
  fails until a reader runs the command.
level: error
script: |
  text := import("text")
  yaml := import("yaml")

  current := yaml.decode(file.read("docs/_data/versions.yml")).current
  matches := text.re_find(`(?:@|=|:)(\d+\.\d+\.\d+)`, scope, -1)

  for m in matches {
    if m[1].text != current {
      result := { begin: m[1].begin, end: m[1].end, text: m[1].text }
    }
  }
```

## Suppressing a rule

A rule that is wrong for one specific passage is suppressed inline, with the
reason on the same line:

```markdown
<!-- vale Docs.DirectionalWords = NO -->
The diagram below is reproduced from the ASD-STE100 specification and its
wording is quoted verbatim.
<!-- vale Docs.DirectionalWords = YES -->
```

Suppressions are reviewed quarterly. A cluster around one rule means the rule
has false positives, and the fix is the rule, not the suppressions.
