param(
  [switch] $Uninstall,
  [switch] $Rebuild,
  [string] $ImageName = "clean-cut-mcp",
  [string] $ContainerName = "clean-cut-mcp",
  [int] $RemotionPort = 6960,
  [int] $McpPort = 6961,
  [string] $Workspace = "$env:USERPROFILE\.claude-videos\remotion-workspace"
)

$ErrorActionPreference = 'Stop'

function Info($m){ Write-Host "[INFO] $m" -ForegroundColor Cyan }
function Warn($m){ Write-Host "[WARN] $m" -ForegroundColor Yellow }
function Err($m){ Write-Host "[ERROR] $m" -ForegroundColor Red }

function Get-DockerExe {
  $dflt = "C:\\Program Files\\Docker\\Docker\\resources\\bin\\docker.exe"
  if (Test-Path $dflt) { return $dflt }
  $cmd = Get-Command docker -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  throw "Docker not found. Install Docker Desktop and retry."
}

function Test-Docker($docker){ try { & $docker info | Out-Null; return $true } catch { return $false } }
function Port-Free([int]$p){ try { $l=New-Object Net.Sockets.TcpListener([IPAddress]::Any,$p);$l.Start();$l.Stop();$true } catch { $false } }
function Next-Port([int]$s,[int]$e){ for($i=$s;$i -le $e;$i++){ if(Port-Free $i){return $i} } throw "No free ports in $s-$e" }
function Ensure-Dir($p){ if(-not(Test-Path $p)){ New-Item -ItemType Directory -Path $p | Out-Null } }

function Read-Json($p){ if(-not(Test-Path $p)){return $null} (Get-Content -LiteralPath $p -Raw) | ConvertFrom-Json -Depth 100 }
function Write-Json($p,$o){ $tmp="$p.tmp"; ($o|ConvertTo-Json -Depth 100) | Out-File -LiteralPath $tmp -Encoding UTF8 -NoNewline; Move-Item $tmp $p -Force }
function Backup($p){ if(Test-Path $p){ $b="$p."+(Get-Date -f yyyyMMdd_HHmmss)+".bak"; Copy-Item $p $b -Force; return $b } $null }

function Configure-Claude($url){
  $dir = Join-Path $env:APPDATA 'Claude'; Ensure-Dir $dir
  $cfg = Join-Path $dir 'claude_desktop_config.json'
  $bak = Backup $cfg
  $data = Read-Json $cfg
  if(-not $data){ $data = [ordered]@{ mcpServers = @{} } }
  if(-not $data.mcpServers){ $data.mcpServers = @{} }
  $data.mcpServers.'clean-cut-mcp' = @{ url = $url }
  try { Write-Json $cfg $data } catch { if($bak){Copy-Item $bak $cfg -Force}; throw }
  Info "Claude config updated: clean-cut-mcp -> $url"
}

function Remove-Claude(){ $cfg=Join-Path (Join-Path $env:APPDATA 'Claude') 'claude_desktop_config.json'; if(-not(Test-Path $cfg)){return}; $bak=Backup $cfg; $d=Read-Json $cfg; if($d -and $d.mcpServers){ $d.mcpServers.PSObject.Properties.Remove('clean-cut-mcp')|Out-Null; try{Write-Json $cfg $d}catch{ if($bak){Copy-Item $bak $cfg -Force}; throw }; Info "Removed clean-cut-mcp from Claude config" } }

$docker = Get-DockerExe
if(-not (Test-Docker $docker)){ throw "Docker Desktop is not running. Start it and retry." }

if($Uninstall){ Info "Uninstalling ..."; try{ & $docker rm -f $ContainerName | Out-Null }catch{}; try{ $ans=Read-Host "Remove image '$ImageName'? (y/N)"; if($ans -match '^[yY]'){ & $docker rmi $ImageName | Out-Null } }catch{}; Remove-Claude; Info "Done."; exit 0 }

if(-not(Port-Free $RemotionPort)){ $RemotionPort = Next-Port 6960 6970 }
if(-not(Port-Free $McpPort)){ $McpPort = Next-Port 6960 6970 }
Ensure-Dir $Workspace

# Build if missing or forced
$need=$Rebuild
if(-not $need){ try{ $imgs=& $docker images --format '{{.Repository}}:{{.Tag}}'; if(-not ($imgs -match "^$($ImageName):")){ $need=$true } }catch{ $need=$true } }
if($need){ Info "Building image $ImageName ..."; & $docker build -t $ImageName . }

# Recreate container
try{ & $docker rm -f $ContainerName | Out-Null }catch{}
$run=@('run','-d','--name',$ContainerName,'-p',"$($RemotionPort):6960",'-p',"$($McpPort):6961",'-e','MCP_SERVER_PORT=6961','-e','REMOTION_STUDIO_PORT=6960','-e','DOCKER_CONTAINER=true','-e','REMOTION_NON_INTERACTIVE=1','--restart','unless-stopped','-v',"${Workspace}:/workspace",$ImageName)
& $docker @run | Out-Null

# Wait for health
$health="http://localhost:$($McpPort)/health"; Info "Waiting for $health ..."; $sw=[Diagnostics.Stopwatch]::StartNew(); $ok=$false
while($sw.Elapsed -lt ([TimeSpan]::FromMinutes(2))){ try{ $r=Invoke-WebRequest -Uri $health -UseBasicParsing -TimeoutSec 5; if($r.StatusCode -ge 200 -and $r.StatusCode -lt 300){$ok=$true;break} }catch{}; Start-Sleep -s 2 }
$sw.Stop(); if(-not $ok){ Err "Container health failed. Showing last 100 logs:"; try{ & $docker logs --tail 100 $ContainerName }catch{}; throw "Startup failed." }

# Configure Claude + open studio
$McpUrl = "http://localhost:$($McpPort)/mcp"; Configure-Claude $McpUrl
$StudioUrl = "http://localhost:$($RemotionPort)/"; Info "Opening $StudioUrl"; Start-Process $StudioUrl | Out-Null

Write-Host "`n[OK] Clean-Cut-MCP is ready." -ForegroundColor Green
Write-Host "- Container: $ContainerName" -ForegroundColor Green
Write-Host "- Image: $ImageName" -ForegroundColor Green
Write-Host "- MCP: $McpUrl" -ForegroundColor Green
Write-Host "- Studio: $StudioUrl`n" -ForegroundColor Green

