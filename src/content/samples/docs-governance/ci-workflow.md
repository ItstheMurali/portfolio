Two workflows. The pull-request check is fast and scoped to changed files. The
nightly run covers the whole corpus and catches the case a diff cannot see: a
change in one file that invalidates a cross-reference in another.

## .github/workflows/docs-quality.yml

```yaml
name: Docs quality

on:
  pull_request:
    paths:
      - 'docs/**'
      - '.vale.ini'
      - '.vale/**'

# A new push supersedes the previous run. Without this, a branch pushed
# three times in a minute holds three runners to produce two stale results.
concurrency:
  group: docs-quality-${{ github.ref }}
  cancel-in-progress: true

permissions:
  contents: read
  pull-requests: write

jobs:
  vale:
    name: Prose linting
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          # Vale needs the base commit to diff against, and
          # Docs.BrokenRefs needs the whole tree to resolve link targets.
          fetch-depth: 0

      - name: Collect changed documentation files
        id: changed
        run: |
          FILES=$(git diff --name-only --diff-filter=ACMR \
            origin/${{ github.base_ref }}...HEAD -- 'docs/**/*.md' \
            | tr '\n' ' ')
          echo "files=${FILES}" >> "$GITHUB_OUTPUT"
          if [ -z "${FILES}" ]; then
            echo "No documentation files changed."
          fi

      - name: Install Vale
        if: steps.changed.outputs.files != ''
        run: |
          curl -sfL https://github.com/errata-ai/vale/releases/download/\
          v3.9.1/vale_3.9.1_Linux_64-bit.tar.gz | tar -xz -C /usr/local/bin vale
          vale --version

      - name: Sync external style packages
        if: steps.changed.outputs.files != ''
        run: vale sync

      # Vale's own exit code is the gate. The annotation step below is for
      # the writer's benefit and must not be what decides the result.
      - name: Lint changed files
        if: steps.changed.outputs.files != ''
        id: lint
        run: |
          vale --output=JSON ${{ steps.changed.outputs.files }} > vale.json || true
          vale --output=line --minAlertLevel=error \
            ${{ steps.changed.outputs.files }}

      # Runs even when linting failed, so the writer sees every finding
      # rather than fixing them one CI run at a time.
      - name: Annotate the diff
        if: always() && steps.changed.outputs.files != ''
        run: |
          jq -r 'to_entries[] as $f
                 | $f.value[]
                 | "::\(if .Severity == "error" then "error" else "warning" end) \
file=\($f.key),line=\(.Line),col=\(.Span[0])::[\(.Check)] \(.Message)"' \
            vale.json

      - name: Comment the summary
        if: always() && steps.changed.outputs.files != ''
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync('vale.json', 'utf8'));
            const all = Object.values(data).flat();
            if (all.length === 0) return;

            const errors = all.filter(a => a.Severity === 'error');
            const byCheck = {};
            for (const a of all) byCheck[a.Check] = (byCheck[a.Check] || 0) + 1;

            const rows = Object.entries(byCheck)
              .sort((a, b) => b[1] - a[1])
              .map(([check, n]) => `| \`${check}\` | ${n} |`)
              .join('\n');

            const body = [
              `### Docs quality: ${errors.length} error(s), ` +
                `${all.length - errors.length} warning(s)`,
              '',
              'Findings are annotated inline on the diff.',
              '',
              '| Rule | Count |',
              '|---|---|',
              rows,
              '',
              errors.length
                ? '**Errors block the merge.** Each rule explains the defect ' +
                  'it prevents; the reasoning is in `docs/contributing/style.md`.'
                : 'No blocking errors. Warnings are advisory.',
            ].join('\n');

            await github.rest.issues.createComment({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
              body,
            });

  links:
    name: Link checking
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Check internal and external links
        uses: lycheeverse/lychee-action@v2
        with:
          args: >-
            --no-progress
            --max-concurrency 8
            --accept 200,206,999
            --exclude-path docs/changelog.md
            'docs/**/*.md'
          fail: true
```

`--accept 999` admits LinkedIn, which returns that status to automated
clients. `docs/changelog.md` is excluded because historical entries reference
release URLs that are expected to disappear, and a changelog that must be
edited when an old link rots is a changelog that gets edited into fiction.

## .github/workflows/docs-nightly.yml

```yaml
name: Docs quality (full corpus)

on:
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:

permissions:
  contents: read
  issues: write

jobs:
  full-lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Vale
        run: |
          curl -sfL https://github.com/errata-ai/vale/releases/download/\
          v3.9.1/vale_3.9.1_Linux_64-bit.tar.gz | tar -xz -C /usr/local/bin vale
          vale sync

      - name: Lint the whole corpus
        id: lint
        run: |
          vale --output=JSON 'docs/**/*.md' > vale.json || true
          ERRORS=$(jq '[.[][] | select(.Severity == "error")] | length' vale.json)
          echo "errors=${ERRORS}" >> "$GITHUB_OUTPUT"

      # Findings here were not introduced by the change that surfaced them,
      # so they open an issue rather than blocking anyone's merge.
      - name: Open an issue on new findings
        if: steps.lint.outputs.errors != '0'
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            const data = JSON.parse(fs.readFileSync('vale.json', 'utf8'));
            const errors = Object.entries(data)
              .flatMap(([file, alerts]) =>
                alerts
                  .filter(a => a.Severity === 'error')
                  .map(a => `- \`${file}:${a.Line}\` [${a.Check}] ${a.Message}`))
              .slice(0, 50);

            const title = `Docs corpus: ${errors.length} error(s) ` +
              `on ${new Date().toISOString().slice(0, 10)}`;

            const existing = await github.rest.issues.listForRepo({
              owner: context.repo.owner,
              repo: context.repo.repo,
              labels: 'docs-quality',
              state: 'open',
            });

            const body = [
              'Full-corpus lint found errors not introduced by any single ' +
                'pull request. Most are cross-references invalidated by a ' +
                'rename elsewhere.',
              '',
              ...errors,
            ].join('\n');

            // One rolling issue, updated. A new issue every night is a
            // notification channel people mute.
            if (existing.data.length > 0) {
              await github.rest.issues.update({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: existing.data[0].number,
                title,
                body,
              });
            } else {
              await github.rest.issues.create({
                owner: context.repo.owner,
                repo: context.repo.repo,
                title,
                body,
                labels: ['docs-quality'],
              });
            }
```

## Running it locally

The same ruleset, before you open the pull request:

```bash
vale sync
vale docs/                      # everything
vale docs/guides/install.md     # one file
vale --minAlertLevel=error docs/   # only what blocks the merge
```

A pre-commit hook on errors only:

```yaml
# .pre-commit-config.yaml
repos:
  - repo: local
    hooks:
      - id: vale
        name: Vale (errors only)
        entry: vale --minAlertLevel=error
        language: system
        files: ^docs/.*\.md$
```

Errors only, deliberately. A hook that blocks a commit over a `warning` is a
hook that gets bypassed with `--no-verify`, and a bypassed hook enforces
nothing at all.
