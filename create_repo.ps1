$envContent = Get-Content "c:\Users\Administrator\.trae-cn\builtin\global\skills\git-push\.env.local"
$token = ($envContent | Where-Object { $_ -match "^GITHUB_TOKEN=" }) -replace "^GITHUB_TOKEN=", ""
$username = ($envContent | Where-Object { $_ -match "^GITHUB_USERNAME=" }) -replace "^GITHUB_USERNAME=", ""
$headers = @{ "Authorization" = "token $token"; "Accept" = "application/vnd.github.v3+json" }
$body = @{ name = "6074"; private = $false } | ConvertTo-Json
$response = Invoke-RestMethod -Uri "https://api.github.com/user/repos" -Method Post -Headers $headers -Body $body -ContentType "application/json"
Write-Output "REPO_URL: $($response.clone_url)"
