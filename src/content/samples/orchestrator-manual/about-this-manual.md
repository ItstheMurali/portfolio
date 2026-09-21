This manual covers the installation, configuration, and scheduled maintenance
of Orchestrator 4.x in an on-premises deployment.

## Scope

**In scope:** hardware and platform prerequisites, control-plane installation,
worker-node enrolment, TLS configuration, backup and restore, scheduled
maintenance, and fault isolation.

**Not in scope:** the managed cloud service, which shares no installation
procedure with this product; application development against the Orchestrator
API, covered in the *Developer Guide*; and migration from 3.x, covered in the
*Upgrade Manual*.

Procedures are verified against **Orchestrator 4.6.0**. Where behaviour differs
in an earlier 4.x release, the step names the release.

## Audience

This manual is written for a systems administrator who:

- Has root or equivalent privilege on the target hosts.
- Can configure a load balancer, a DNS record, and a firewall rule without
  further instruction.
- Holds, or can obtain within the maintenance window, the TLS certificates and
  the database credentials listed in each task's prerequisites.

It assumes no prior knowledge of Orchestrator. It does not teach Linux
administration, PKI, or PostgreSQL operation.

## How this manual is organised

The manual is built from **modules**, not chapters. A module is a
self-contained unit addressing one topic, and it is written so that a reader
who arrives directly at it, from a search result or a cross-reference, has what
they need without reading what came before.

Three module types, distinguished by their numbering:

| Type | Numbering | Answers |
|---|---|---|
| Descriptive | `1.x` | What the component is and how it behaves |
| Procedural | `Task n.n` | How to perform one operation, start to finish |
| Fault isolation | `FI n.n` | What to do about one observed symptom |

Every procedural module has the same internal shape: purpose, prerequisites,
advisory notices, numbered steps, verification, and the action to take if
verification fails. That shape does not vary, so an experienced reader can skip
directly to the part they need.

This modular structure is adapted from **S1000D** data module practice. The
formal S1000D schema, its data module codes, and its common source database are
not used here; the discipline they enforce is. The relevant discipline is that
a module is complete on its own, and that reuse happens by reference rather
than by copying.

## Advisory notices

Three levels. Each appears **before** the step it applies to, never after,
because an advisory read after the action has become a post-mortem.

> **WARNING**
>
> Identifies a procedure or condition that, if not observed, can cause
> permanent data loss, a security exposure, or an outage affecting service
> users.

> **CAUTION**
>
> Identifies a procedure or condition that, if not observed, can damage the
> installation or require the procedure to be started again from the
> beginning.

> **NOTE**
>
> Identifies information that helps the reader complete the task correctly.
> Carries no risk.

The aerospace convention this is adapted from reserves WARNING for risk of
injury or death to persons. That distinction does not transfer honestly to a
server installation, so the levels have been redefined for this domain and the
redefinition is stated here rather than left for the reader to infer. What is
preserved is the property that matters: three levels, each with a written
definition, applied consistently, so that a WARNING never appears for something
that is merely inconvenient. A hierarchy whose top level is used loosely
teaches readers to skip it.

## Writing rules

This manual follows a controlled subset of **ASD-STE100 Simplified Technical
English**. The rules are listed so a reviewer can check compliance rather than
form an opinion:

1. **One instruction per numbered step.** Two actions in one step means the
   second is skipped when the reader is interrupted between them.
2. **Imperative mood for instructions.** "Enter the hostname", not "the
   hostname should be entered" and not "you will want to enter the hostname".
3. **One meaning per word.** `stop` always means to halt a running process.
   Ending a session is `log out`. Removing software is `uninstall`. These words
   are never exchanged.
4. **No ambiguous pronouns.** "Restart the service" rather than "restart it",
   wherever more than one noun precedes the pronoun.
5. **Present tense for states, imperative for actions.** Future tense is not
   used: "the service starts", not "the service will start".
6. **No sentence longer than 20 words in a procedural step.** Descriptive text
   may run longer where the subject requires it.
7. **Conditions precede actions.** "If the check fails, restart the service",
   not "restart the service if the check fails". The reader must know whether a
   step applies before they read what it does.
8. **Numerals for all quantities**, including those below ten. "3 nodes", not
   "three nodes", so a value is never confused with prose.

## Typographic conventions

| Convention | Meaning |
|---|---|
| `monospace` | Text entered literally, or output shown literally |
| `<angle brackets>` | A value the reader substitutes |
| **Bold** | A user-interface element, exactly as labelled on screen |
| *Italic* | The title of another manual |
| → | Navigation through a menu, for example **Settings → Nodes** |

A command shown across several lines with a trailing `\` is one command. Enter
it as one line, or preserve the continuation characters exactly.

## Revision record

| Revision | Date | Change |
|---|---|---|
| D | 2026-09-01 | Task 3.2 revised for the 4.6.0 certificate format. FI 7.4 added. |
| C | 2026-05-12 | Warning hierarchy redefined for this domain and the redefinition documented. Advisory notices moved before their steps throughout. |
| B | 2026-02-03 | Worker enrolment separated from control-plane installation into its own module. |
| A | 2025-11-20 | First issue. |

Revision C is the substantive one. Before it, advisory notices appeared after
the step in several modules, and the WARNING level had been applied to
conditions that were recoverable. Both were corrected throughout rather than
where they were noticed, because an inconsistently applied hierarchy is worse
than none: it teaches the reader that the levels do not mean anything.
