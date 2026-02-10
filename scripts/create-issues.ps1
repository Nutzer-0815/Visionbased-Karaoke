<#
Creates GitHub issues from a local JSON file using GitHub CLI (gh).

Prerequisites:
- GitHub CLI installed: gh
- Authenticated: gh auth login
#>
param(
  [string]$IssuesPath = "docs/issues.json",
  [string]$Repo = ""
)

if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
  Write-Error "GitHub CLI (gh) not found. Install it first."
  exit 1
}

if (-not (Test-Path $IssuesPath)) {
  Write-Error "Issues file not found: $IssuesPath"
  exit 1
}

$json = Get-Content -Path $IssuesPath -Raw
if ([string]::IsNullOrWhiteSpace($json)) {
  Write-Error "Issues file is empty: $IssuesPath"
  exit 1
}

try {
  $issues = $json | ConvertFrom-Json
} catch {
  Write-Error "Invalid JSON in $IssuesPath"
  exit 1
}

if ($issues -isnot [System.Array]) {
  $issues = @($issues)
}

if ($issues.Count -eq 0) {
  Write-Host "No issues to create."
  exit 0
}

foreach ($issue in $issues) {
  if ($issue.created -eq $true) {
    continue
  }

  if (-not $issue.title -or -not $issue.body) {
    Write-Error "Issue is missing title or body. Skipping."
    continue
  }

  $args = @("issue", "create", "--title", $issue.title, "--body", $issue.body)

  if ($issue.labels) {
    $args += @("--label", ($issue.labels -join ","))
  }

  if ($issue.assignee) {
    $args += @("--assignee", $issue.assignee)
  }

  if ($Repo -and $Repo.Trim() -ne "") {
    $args += @("--repo", $Repo)
  }

  & gh @args
}

Write-Host "Issue creation complete."
