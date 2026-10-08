#!/usr/bin/env pwsh
<#
.SYNOPSIS
Smoke test checklist for awesome-github-app manual QA

.DESCRIPTION
This script provides an interactive checklist for manual verification of key app flows.
Run this before releases to catch regressions.

.NOTES
Run from repo root: .\scripts\smoke.ps1
#>

param(
    [switch]$Headless  # Run without pauses (for CI)
)

$checks = @(
    @{ Name = "App launches without crash"; Passed = $false; Notes = "Verify splash → home (tabs) on cold start" }
    @{ Name = "OAuth login flow"; Passed = $false; Notes = "Login → GitHub OAuth → callback → authenticated tabs" }
    @{ Name = "Feed tab loads activity"; Passed = $false; Notes = "Pull-to-refresh works; infinite scroll loads more" }
    @{ Name = "Explore tab search"; Passed = $false; Notes = "Type query → results appear; empty state shows" }
    @{ Name = "Notifications tab"; Passed = $false; Notes = "List loads; mark-as-read works; pagination" }
    @{ Name = "Repos tab (my repos)"; Passed = $false; Notes = "List loads; star/unstar optimistic update" }
    @{ Name = "Profile tab"; Passed = $false; Notes = "Avatar, stats, contribution graph skeleton → data" }
    @{ Name = "Repo detail screen"; Passed = $false; Notes = "Readme renders; tabs switch; copy link/clone URL work" }
    @{ Name = "Star/Unstar optimistic"; Passed = $false; Notes = "Tap star → immediate UI flip; rollback on error" }
    @{ Name = "Watch/Unwatch"; Passed = $false; Notes = "Watch button toggles; toast on success" }
    @{ Name = "Rate limit warning"; Passed = $false; Notes = "Toast appears when <100 remaining (mock if needed)" }
    @{ Name = "Dark/light theme toggle"; Passed = $false; Notes = "Settings → toggle → immediate apply; persists" }
    @{ Name = "Pull-to-refresh all tabs"; Passed = $false; Notes = "Each tab refreshes data on pull" }
    @{ Name = "Offline handling"; Passed = $false; Notes = "Airplane mode → graceful error toasts" }
    @{ Name = "Deep link to repo"; Passed = $false; Notes = "expo://.../repo/owner/repo opens detail" }
    @{ Name = "Deep link to profile"; Passed = $false; Notes = "expo://.../user/login opens profile" }
    @{ Name = "TypeScript compiles"; Passed = $false; Notes = "bun run typecheck passes" }
    @{ Name = "Lint passes"; Passed = $false; Notes = "bun run lint passes" }
    @{ Name = "Format check"; Passed = $false; Notes = "bun run format --check passes" }
    @{ Name = "Prebuild passes"; Passed = $false; Notes = "bun run prebuild passes" }
)

function PrintHeader {
    Write-Host "`n=== awesome-github-app Smoke Test Checklist ===" -ForegroundColor Cyan
    Write-Host "Date: $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    Write-Host "Platform: $(if ($IsAndroid) { 'Android' } elseif ($IsIOS) { 'iOS' } else { 'Web/Dev' })`n"
}

function PrintCheck($i, $check) {
    $status = if ($check.Passed) { "[x]" } else { "[ ]" }
    $color = if ($check.Passed) { "Green" } else { "Yellow" }
    Write-Host "$status $($i + 1). $($check.Name)" -ForegroundColor $color
    Write-Host "    $($check.Notes)" -ForegroundColor Gray
}

function RunInteractive {
    foreach ($i in 0..($checks.Count - 1)) {
        $check = $checks[$i]
        PrintCheck $i $check
        $response = Read-Host "`nPass? (y/n/s=skip/q=quit) "
        switch ($response.ToLower()) {
            'y' { $check.Passed = $true }
            'n' { $check.Passed = $false }
            's' { }
            'q' { break }
            default { $i-- } # re-ask
        }
        Write-Host ""
    }
}

function RunHeadless {
    Write-Host "Running headless checks (automated only)...`n"
    # Automated checks
    try {
        $checks[17].Passed = (bun run typecheck 2>&1 | Out-Null; $LASTEXITCODE -eq 0)
        $checks[18].Passed = (bun run lint 2>&1 | Out-Null; $LASTEXITCODE -eq 0)
        $checks[19].Passed = (bun run format --check 2>&1 | Out-Null; $LASTEXITCODE -eq 0)
        $checks[20].Passed = (bun run prebuild 2>&1 | Out-Null; $LASTEXITCODE -eq 0)
    } catch {
        Write-Host "Automated checks failed: $_" -ForegroundColor Red
    }
}

function PrintSummary {
    $passed = ($checks | Where-Object { $_.Passed }).Count
    $total = $checks.Count
    $pct = [math]::Round($passed / $total * 100)
    Write-Host "`n=== SUMMARY ===" -ForegroundColor Cyan
    Write-Host "Passed: $passed / $total ($pct%)"
    if ($pct -lt 100) {
        Write-Host "FAILED CHECKS:" -ForegroundColor Red
        $checks | Where-Object { -not $_.Passed } | ForEach-Object {
            Write-Host "  - $($_.Name)" -ForegroundColor Red
        }
        exit 1
    } else {
        Write-Host "All checks passed!" -ForegroundColor Green
        exit 0
    }
}

PrintHeader

if ($Headless) {
    RunHeadless
} else {
    RunInteractive
}

PrintSummary