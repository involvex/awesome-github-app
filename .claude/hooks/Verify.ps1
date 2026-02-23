# Verification hook for Claude tasks
# This script will be executed after a Claude task is completed to perform additional verification steps.

bun run expo:prebuild
bun run expo:check
bun run doctor

Write-Host "If this script runs successfully, it means the verification checks have passed, Else check the logs: analyze the output, and fix the issues and rerun the verification script" -ForegroundColor Green