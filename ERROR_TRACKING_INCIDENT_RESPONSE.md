# FreightFlow: Error Tracking & Incident Response Guide

**Phase:** 3.7 | **Status:** Ready for Implementation | **Target:** Complete by June 2, 2026

---

## 🎯 **Executive Overview**

When something breaks, the response should be:
1. **Detect** the issue (automated alerts)
2. **Alert** the team (Slack/SMS/Email)
3. **Investigate** the root cause (logs, errors, metrics)
4. **Fix** the problem (deploy hotfix)
5. **Communicate** to customers (status page)
6. **Learn** from the incident (postmortem)

**Response Targets:**
- Mean Time to Detection (MTTD): < 5 minutes
- Mean Time to Respond (MTTR): < 1 hour
- Mean Time to Resolve (MTTR): < 2 hours
- Customer notification: < 10 minutes of detection

---

## 📋 **Part 1: Error Classification**

### Severity Levels

```
CRITICAL (SEV-1) - Customer-facing outage
├── Database unavailable
├── API server down
├── Payment processing failed
├── > 50% error rate
├── Response time: IMMEDIATE
├── Team: All hands on deck

HIGH (SEV-2) - Significant degradation
├── Error rate 5-50%
├── Response time: 15 minutes
├── Specific feature broken (e.g., OCR)
├── Database slow (p95 > 1s)

MEDIUM (SEV-3) - Minor issues
├── Error rate 1-5%
├── Response time: 1 hour
├── Non-critical feature affected
├── Performance degradation < 20%

LOW (SEV-4) - Log issues only
├── Error rate < 1%
├── Response time: Within business hours
├── UI bugs, typos, documentation
```

### Error Category Matrix

```
Category | Example | Severity | Action
----------|---------|----------|--------
Database | "Connection timeout" | CRITICAL | Auto-page on-call
API | "500 Internal Server Error" | HIGH | Auto-alert Slack
Auth | "Invalid JWT token" | MEDIUM | Monitor trend
OCR | "Timeout from OCR service" | MEDIUM | Fallback + alert
Payment | "Failed to charge card" | CRITICAL | Auto-page + email
UI | "Button unresponsive" | LOW | Add to sprint
```

---

## 🔔 **Part 2: Alert Rules Configuration**

### Sentry Alert Rules (Backend Errors)

**Rule 1: High Error Rate**

```yaml
Alert Name: High Error Rate
Condition: Error rate > 1% in last 5 minutes
Affected: All services
Severity: CRITICAL (SEV-1)

Actions:
  - Send to Slack: #critical-alerts
  - Send SMS: On-call engineer
  - Page PagerDuty: If > 5% for 5 min
  - Email: ganesh@freightflow.in

Example Trigger:
├── Time: May 15, 2:30 PM
├── Error Rate: 3.2%
├── Errors: 45 in 5 minutes
├── Primary Error: "Database connection timeout"
├── Affected Users: 120
```

**Rule 2: Unusual Error Pattern**

```yaml
Alert Name: New Error Type
Condition: New error type with 5+ occurrences
Affected: All services
Severity: HIGH (SEV-2)

Actions:
  - Send to Slack: #alerts
  - Email: tech@freightflow.in
  - Auto-create Jira ticket

Example Trigger:
├── New Error: "OutOfMemoryError in Node.js"
├── Occurrences: 7 in 30 minutes
├── Stack trace: https://sentry.io/issues/xxxxx
└── Action: Check for memory leak
```

**Rule 3: Database Issues**

```yaml
Alert Name: Database Connection Error
Condition: 3+ "Connection timeout" errors in 2 min
Affected: Database critical
Severity: CRITICAL (SEV-1)

Actions:
  - SMS: All on-call
  - Slack: #critical-alerts + @channel
  - Email: Emergency notification
  - Trigger: Auto-restart Railway container

Example Trigger:
├── Time: May 15, 3:15 PM
├── Error: "Connection to MongoDB timeout"
├── Attempts Failed: 15
├── Recovery Time: 120 seconds
└── Action: Check MongoDB Atlas status
```

**Rule 4: Authentication Failures**

```yaml
Alert Name: Spike in Auth Errors
Condition: Auth error rate > 2% in last 10 minutes
Affected: Login, protected APIs
Severity: HIGH (SEV-2)

Actions:
  - Send to Slack: #alerts
  - Email: tech@freightflow.in
  - Review: JWT secret rotation?

Example Trigger:
├── Error Type: "Invalid JWT token"
├── Spike: 8% (from normal 0.1%)
├── Possible Cause: JWT_SECRET mismatch
├── Action: Verify Railway env variables
```

### Metrics Alert Rules (Railway)

**Rule 5: High CPU Usage**

```yaml
Alert Name: CPU Usage > 80%
Condition: CPU > 80% for 5 minutes
Severity: HIGH (SEV-2)

Actions:
  - Slack: #alerts
  - Scale: Auto-scale to 2-3 instances
  - Email: ops@freightflow.in

Investigation:
├── Check Railway dashboard
├── Identify slow endpoints
├── Kill long-running requests
├── Review load test results
```

**Rule 6: High Memory Usage**

```yaml
Alert Name: Memory Usage > 400 MB
Condition: Memory > 400 MB (80% of 512 MB)
Severity: MEDIUM (SEV-3)

Actions:
  - Slack: #alerts
  - Email: tech@freightflow.in
  - Note: Restart container if > 450 MB

Investigation:
├── Check for memory leak
├── Look for large objects
├── Review recent code changes
├── Consider cache size
```

**Rule 7: Response Time Degradation**

```yaml
Alert Name: High Latency
Condition: p95 response time > 1 second
Severity: MEDIUM (SEV-3)

Actions:
  - Slack: #alerts
  - Email: tech@freightflow.in
  - Auto-investigation: Check slow queries

Investigation:
├── Database query performance
├── API endpoint bottleneck
├── N+1 query problem
├── Missing index
```

---

## 🚨 **Part 3: Incident Response Runbook**

### SEV-1 Critical Incident Response (Database Down)

**IMMEDIATE ACTIONS (0-5 minutes):**

```
1. DETECT & ALERT (automatic)
   ├── Sentry alert fires: "Database connection failed"
   ├── SMS sent to on-call engineer
   └── Slack: #critical-alerts notified

2. INVESTIGATE (30 seconds)
   ├── Open Railway dashboard
   ├── Check MongoDB Atlas status
   ├── Curl /api/health endpoint
   └── Confirm database is unreachable

3. DECLARE INCIDENT
   ├── Incident ID: INC-20260515-001
   ├── Severity: SEV-1
   ├── Start Time: 2:30 PM UTC
   ├── Lead: [On-call engineer name]
   └── Slack post: "@channel INCIDENT: Database unavailable, investigating..."

4. NOTIFY STAKEHOLDERS (2 minutes)
   ├── Slack #general: "We're experiencing issues, stand by"
   ├── Email to ganesh@freightflow.in
   ├── Post to status page: "Investigating service interruption"
   └── Do NOT make false promises about timeline
```

**MITIGATION (5-15 minutes):**

```
5. CHECK MONGO ATLAS STATUS PAGE
   ├── Visit: status.mongodb.com
   ├── Is there a known outage? If yes, wait for recovery
   ├── If no, proceed to Step 6

6. RESTART DATABASE CONNECTION
   ├── Option A (If using Railway PostgreSQL):
   │  └── Kill and restart: railway down && railway up
   ├── Option B (If using MongoDB Atlas):
   │  ├── Go to Atlas → Cluster → Servers
   │  ├── Check network connectivity
   │  ├── Verify IP whitelist includes Railway IP
   │  └── Restart connection

7. TEST CONNECTION
   ├── Curl: curl https://api.freightflow.in/api/health
   ├── Expect: { "status": "healthy", "database": { "connected": true } }
   ├── If still failing, go to Step 8
   └── If success, go to Step 10

8. CHECK RAILWAY ENV VARIABLES
   ├── Go to Railway dashboard → Variables
   ├── Verify DATABASE_URL is correct
   ├── Verify no recent changes
   ├── If changed, revert to previous version
   └── Redeploy backend service

9. ROLLBACK DEPLOYMENT (if recent deploy)
   ├── Go to Railway → Deployments
   ├── Find previous successful deployment
   ├── Click "Restore" → "Confirm"
   ├── Wait 2 minutes for rollback
   └── Test /api/health again

10. DECLARE RECOVERY
    ├── Test smoke tests pass
    ├── Verify no error spike in Sentry
    ├── Post to Slack: "✅ Database recovered at 2:35 PM"
    ├── Close incident: INC-20260515-001
    └── Go to Step 11 (Postmortem)
```

**COMMUNICATION (Throughout):**

```
Slack Updates (every 2-3 minutes):
├── 2:30 PM: 🚨 Incident started, investigating
├── 2:33 PM: Found database connectivity issue
├── 2:35 PM: Restarting connection...
├── 2:36 PM: ✅ Database recovered
└── 2:37 PM: Monitoring for issues, full update in 1 hour

Customer Communication:
├── Email subject: "Service Interruption - Update"
├── Message: "We experienced a database connectivity issue
│  from 2:30-2:36 PM UTC. All systems are now operational.
│  We're investigating the root cause. Apologies for any
│  inconvenience. — FreightFlow Team"
└── Post: Link to incident post-mortem (next day)
```

---

### SEV-2 High Severity Response (OCR Service Down)

**IMMEDIATE (0-3 minutes):**

```
1. CONFIRM ISSUE
   ├── Sentry: 50+ "OCR timeout" errors in 2 minutes
   ├── Error rate: 15% of invoice processing
   ├── Affected users: 8 in past hour

2. CLASSIFY INCIDENT
   ├── Severity: SEV-2 (not full outage)
   ├── Slack: Post to #alerts (NOT #critical)
   ├── Email: ops@freightflow.in
   ├── Start time: Track for SLA

3. INVESTIGATE
   ├── Check OCR service status: ocr-service.com/status
   ├── Check API key validity
   ├── Review recent code changes
   ├── Check rate limits
```

**MITIGATION (3-15 minutes):**

```
4. OPTIONS:
   
   A. Wait for OCR service recovery (if external issue)
      └── Monitor status page, update Slack every 5 min
   
   B. Use fallback mechanism (if implemented)
      ├── Manual review queue for failed invoices
      ├── Send to support team for processing
      ├── Continue accepting invoice uploads
   
   C. Temporary rate limit reduction
      ├── Reduce OCR concurrent requests to prevent timeout
      ├── Accept slower processing
      └── Add to queue for later retry

5. UPDATE CUSTOMERS
   ├── Slack: "OCR processing experiencing delays"
   ├── Email affected users: Expected resolution time
```

**RECOVERY:**

```
6. RESOLUTION VERIFICATION
   ├── 5 test invoices processed successfully
   ├── Error rate < 1%
   ├── No spike in complaints
   └── Incident closed with postmortem scheduled
```

---

## 📝 **Part 4: Postmortem Process**

### Incident Postmortem Template

**File: `postmortems/INC-20260515-001.md`**

```markdown
# Incident Postmortem: Database Connection Failure

**Date:** May 15, 2026  
**Duration:** 6 minutes (2:30 PM - 2:36 PM UTC)  
**Severity:** SEV-1 (Critical)  
**Lead:** Ganesh Kumar  
**Participants:** [List team members involved]  

## Summary

Brief description of what happened and impact.

**Impact:**
- Duration: 6 minutes
- Affected Users: ~50
- Estimated Revenue Loss: ₹0 (recovered before checkout failures)
- Customers Affected: 0 (no transaction failures)

## Timeline

| Time | Event | Action |
|------|-------|--------|
| 2:30 PM | Database connectivity lost | Automated alert fired |
| 2:30 PM | On-call engineer paged | Started investigation |
| 2:32 PM | Confirmed MongoDB timeout | Checked Atlas status page |
| 2:33 PM | No platform outage found | Checked Railway config |
| 2:34 PM | Restarted connection | DB connection restored |
| 2:36 PM | Health checks passed | Incident resolved |

## Root Cause Analysis

**Immediate Cause:**
- MongoDB Atlas connection pool limit reached (498/500)
- Old connections not properly closed by Railway container

**Contributing Factors:**
- Connection pool timeout too aggressive (30s)
- No connection cleanup on error
- Load spike from background jobs

**Why It Happened:**
- Background job released connections incorrectly after error
- Connection leak accumulated over 3 hours
- Hit limit during peak traffic window

## Corrective Actions

**Immediate (Done):**
- ✅ Restarted Railway container to clear connections
- ✅ Deployed hotfix for connection cleanup

**Short-term (This Week):**
- [ ] Increase connection pool timeout to 60s
- [ ] Add connection pool monitoring
- [ ] Review and fix connection close patterns

**Long-term (Next Month):**
- [ ] Implement connection pooling middleware
- [ ] Add automated tests for connection leaks
- [ ] Document connection management best practices

## Prevention

**What will prevent this happening again:**

1. **Connection Monitoring**
   - Alert if connection count > 90% of limit
   - Dashboard widget showing connection pool health

2. **Automated Testing**
   - Add test: "100 failed requests don't leak connections"
   - Run monthly to catch regressions

3. **Documentation**
   - Add to runbook: "Connection pool troubleshooting"
   - Engineer training on proper connection cleanup

## Lessons Learned

1. **What went well:**
   - Alert detected issue within 30 seconds ✅
   - On-call engineer responded in < 2 minutes ✅
   - Automated health check helped diagnose issue ✅

2. **What could be better:**
   - Should have connection pool monitoring proactive
   - Background jobs should have separate connection pool
   - Documentation was unclear on connection lifecycle

## Action Items

| Action | Owner | Deadline | Status |
|--------|-------|----------|--------|
| Deploy connection cleanup fix | Ganesh | May 15 EOD | ✅ Done |
| Implement connection pool alert | Ganesh | May 17 | In Progress |
| Add load test for connection leaks | QA Team | May 20 | Not Started |
| Update documentation | Ganesh | May 18 | Not Started |

---

**Postmortem Conducted:** May 15, 2026 at 3:30 PM  
**Next Review:** May 22, 2026 (ensure action items complete)
```

### Postmortem Schedule

```
When to conduct postmortem:
├── SEV-1 incidents: Within 24 hours
├── SEV-2 incidents: Within 48 hours
├── SEV-3+ incidents: Within 1 week or never (optional)

Participants:
├── Incident lead (who managed response)
├── On-call engineer(s)
├── Engineering lead
├── Product lead (if customer impact)
└── Optional: Customer support

Duration: 30-45 minutes

Format:
├── Timeline review (5 min)
├── What went right (5 min)
├── What went wrong (10 min)
├── Root cause (10 min)
├── Action items (10 min)
└── Close discussion (5 min)
```

---

## 📊 **Part 5: Incident Dashboard**

### Track Incidents Over Time

```
Incident Metrics (Monthly):

SEV-1 Incidents: 0 (Target: 0-1)
├── Average response time: N/A
├── Average resolution time: N/A
└── Total downtime: 0 minutes

SEV-2 Incidents: 2 (Target: < 5)
├── Average response time: 5 minutes ✅
├── Average resolution time: 18 minutes ✅
├── Categories: 
│  ├── OCR service timeout (1)
│  └── High memory usage (1)

SEV-3 Incidents: 8 (Target: < 15)
├── Average resolution time: 2 hours
├── Categories:
│  ├── Authentication errors (3)
│  ├── Rate limiting (2)
│  ├── UI bugs (2)
│  └── Performance (1)

Trends:
├── Week 1: 2 incidents (high activity)
├── Week 2: 1 incident (improving)
├── Week 3: 0 incidents (great!)
└── Week 4: 0 incidents (stable)

Target SLAs:
├── SEV-1: Detect < 5 min, Resolve < 30 min ✅
├── SEV-2: Detect < 10 min, Resolve < 1 hour ✅
├── SEV-3: Resolve within business hours ✅
```

---

## ✅ **Error Tracking Setup Checklist**

**Day 1: Sentry Configuration**
- [ ] Sentry project created for backend
- [ ] Sentry project created for frontend
- [ ] DSN configured in Railway & Netlify
- [ ] Test error captured successfully

**Day 2: Alert Rules**
- [ ] High error rate rule created
- [ ] Database error rule created
- [ ] New error pattern rule created
- [ ] Slack integration working
- [ ] Test alert verification

**Day 3: Incident Response**
- [ ] Runbook created and shared
- [ ] Severities defined
- [ ] On-call schedule set
- [ ] Team trained on procedures
- [ ] Escalation rules documented

**Day 4: Automation**
- [ ] Auto-restart on critical error (optional)
- [ ] Auto-scale on load spike
- [ ] Auto-rollback on deployment error
- [ ] Auto-notify on threshold exceeded

**Day 5: Testing**
- [ ] Simulate SEV-1 incident
- [ ] Verify alert response
- [ ] Test runbook execution
- [ ] Conduct team drill
- [ ] Measure MTTD, MTTR

**Day 6: Postmortem Process**
- [ ] Template created
- [ ] Process documented
- [ ] Team trained
- [ ] First postmortem completed

**Day 7: Ongoing**
- [ ] Daily incident check-in
- [ ] Weekly metrics review
- [ ] Monthly trend analysis
- [ ] Quarterly SLA review

---

## 📚 **Resources**

- **Sentry Setup:** https://docs.sentry.io/
- **Incident Response:** https://incident.io/blog/incident-response-101
- **Postmortem Guide:** https://www.blameless.com/blameless-postmortem-template
- **On-Call Runbook:** https://www.pagerduty.com/resources/

---

**Owner:** Ganesh Kumar  
**Duration:** 1-2 days (Phase 3.7)  
**Status:** Ready for Implementation  
**Last Updated:** May 15, 2026
