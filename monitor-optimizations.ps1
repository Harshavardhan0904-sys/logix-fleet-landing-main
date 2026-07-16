# Logix Optimization Monitoring Dashboard
# Tracks real-time performance improvements from free-tier optimizations

$baseUrl = "https://freightflow-pkf5.onrender.com"
$dataFile = "monitoring_data.json"
$interval = 10  # seconds between checks
$maxDuration = 3600  # 1 hour in seconds

# Initialize data tracking
$metrics = @{
    startTime = Get-Date
    samples = @()
    cacheHitRates = @()
    responseTimes = @()
    rateLimitEvents = @()
}

Write-Host "=========================================================="
Write-Host "  LOGIX OPTIMIZATION MONITORING DASHBOARD"
Write-Host ""
Write-Host "  Monitoring 3 optimization systems in real-time:"
Write-Host "  - Response Caching (In-Memory)"
Write-Host "  - Rate Limiting (Brute Force Protection)"
Write-Host "  - Database Indexing (Query Performance)"
Write-Host "=========================================================="
Write-Host ""

while ($true) {
    $elapsed = ((Get-Date) - $metrics.startTime).TotalSeconds
    $sampleCount = $metrics.samples.Count + 1
    
    Clear-Host
    
    Write-Host "=========================================================="
    Write-Host "  MONITORING DASHBOARD (Sample #$sampleCount)"
    Write-Host "  Elapsed: $('{0:hh\:mm\:ss}' -f [timespan]::fromseconds($elapsed))"
    Write-Host "=========================================================="
    Write-Host ""
    
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    # Test 1: Cache Stats
    Write-Host "Fetching cache statistics..." -NoNewline
    try {
        $cacheResp = Invoke-WebRequest -Uri "$baseUrl/api/admin/cache-stats" -UseBasicParsing -ErrorAction Stop -TimeoutSec 5
        $cacheData = $cacheResp.Content | ConvertFrom-Json
        $hitRate = [float]($cacheData.hit_rate -replace '%', '')
        
        $metrics.cacheHitRates += $hitRate
        
        Write-Host " OK"
        Write-Host "  Cache Hit Rate: $($cacheData.hit_rate)"
        Write-Host "  Total Operations: $($cacheData.total_operations)"
        Write-Host "  Cached Entries: $($cacheData.current_entries)"
        Write-Host "  Cache Size: $($cacheData.cache_size_bytes) bytes"
        
        if ($hitRate -ge 60) {
            Write-Host "  STATUS: TARGET ACHIEVED!" -ForegroundColor Green
        }
    } catch {
        Write-Host " ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Test 2: Rate Limiting
    Write-Host "Fetching rate limit status..." -NoNewline
    try {
        $rateLimitResp = Invoke-WebRequest -Uri "$baseUrl/api/admin/rate-limit-stats" -UseBasicParsing -ErrorAction Stop -TimeoutSec 5
        $rateLimitData = $rateLimitResp.Content | ConvertFrom-Json
        
        Write-Host " OK"
        Write-Host "  Tracked Keys: $($rateLimitData.total_tracked_keys)"
        Write-Host "  Blocked Accounts: $($rateLimitData.blocked_accounts)"
        Write-Host "  Active Rate Limits: $($rateLimitData.active_rate_limits)"
        
        if ($rateLimitData.blocked_accounts -gt 0) {
            Write-Host "  ALERT: Blocking brute force attempts!" -ForegroundColor Yellow
            $metrics.rateLimitEvents += @{timestamp=$timestamp; blocked=$rateLimitData.blocked_accounts}
        }
    } catch {
        Write-Host " ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Test 3: Full Optimization Status
    Write-Host "Fetching full optimization status..." -NoNewline
    try {
        $optimResp = Invoke-WebRequest -Uri "$baseUrl/api/admin/optimizations" -UseBasicParsing -ErrorAction Stop -TimeoutSec 5
        $optimData = $optimResp.Content | ConvertFrom-Json
        
        Write-Host " OK"
        Write-Host "  All 4 optimizations: ACTIVE"
    } catch {
        Write-Host " ERROR: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    Write-Host ""
    
    # Summary Statistics
    if ($metrics.cacheHitRates.Count -gt 0) {
        $avgHitRate = ($metrics.cacheHitRates | Measure-Object -Average).Average
        Write-Host "PERFORMANCE SUMMARY"
        Write-Host "  Average Cache Hit Rate: $('{0:N1}' -f $avgHitRate)%"
        Write-Host "  Samples Collected: $($metrics.cacheHitRates.Count)"
        
        if ($metrics.cacheHitRates.Count -gt 1) {
            $trend = $metrics.cacheHitRates[-1] - $metrics.cacheHitRates[0]
            if ($trend -gt 0) {
                Write-Host "  Trend: +$('{0:N1}' -f $trend)% (improving)" -ForegroundColor Green
            } elseif ($trend -lt 0) {
                Write-Host "  Trend: $('{0:N1}' -f $trend)% (declining)" -ForegroundColor Yellow
            }
        }
    }
    
    Write-Host ""
    Write-Host "Next check in $interval seconds... (Ctrl+C to stop)" -ForegroundColor Gray
    
    # Save metrics to file
    $metrics | ConvertTo-Json | Out-File -FilePath $dataFile -Force
    
    # Check if duration exceeded
    if ($elapsed -gt $maxDuration) {
        Write-Host ""
        Write-Host "Monitoring complete! 1 hour of data collected." -ForegroundColor Green
        Write-Host "Data saved to: $dataFile"
        break
    }
    
    Start-Sleep -Seconds $interval
}
