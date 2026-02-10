# GitHub Conventions

**Status:** Draft  
**Last updated:** 2026-02-10

This document defines how we collaborate in GitHub (branching, issues, PRs).

---

## 1. Branching (Trunk-Based)

- Default branch: `main` (protected).
- Short-lived branches only.
- Naming:
  - `feat/<issue-id>-short-name`
  - `fix/<issue-id>-short-name`
  - `chore/<issue-id>-short-name`

---

## 2. Commit Messages

Format: `type(scope): message`

Examples:
- `feat(frontend): add webcam start/stop`
- `fix(backend): handle ws disconnect`
- `chore(docs): update roadmap`

---

## 3. Issues

- Every work item should exist as a GitHub Issue.
- Use the Issue Templates in `.github/ISSUE_TEMPLATE/`.
- Title format: `[Phase X] Short description`.

---

## 4. Pull Requests (PRs)

- PRs should reference the Issue: `Closes #ID`.
- CI must pass (lint/build checks).
- Keep PRs small and scoped to one Issue.

---

## 5. Labels

Recommended labels:
- `phase-0` … `phase-6`
- `area:frontend`, `area:backend`, `area:docs`
- `type:feature`, `type:bug`, `type:chore`

---

## 6. Issue Automation (GitHub CLI)

We use `gh` (GitHub CLI) to create issues from a local list.

**Prerequisites**
- GitHub CLI installed: `gh`
- Authenticated: `gh auth login`

**Source file**
- `docs/issues.json` (JSON array of issues).

**Schema (example)**
```json
[
  {
    "title": "[Phase 1] Webcam & Canvas Overlay",
    "body": "Goal:\\n- ...\\n\\nScope:\\n- ...\\n\\nAcceptance Criteria:\\n- ...",
    "labels": ["phase-1", "area:frontend", "type:feature"],
    "assignee": "",
    "created": false
  }
]
```

**Create issues**
```powershell
.\scripts\create-issues.ps1 -IssuesPath docs\issues.json -Repo OWNER/REPO
```

Notes:
- The script skips entries with `"created": true`.
- The script does not edit the JSON file; update `created` manually after creation.
