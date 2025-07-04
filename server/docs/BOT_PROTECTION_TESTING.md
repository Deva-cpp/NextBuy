# Bot Protection Testing Guide

This guide provides instructions on how to test and verify that the bot protection mechanisms in the NextBuy application are working correctly.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Testing Tools](#testing-tools)
3. [Testing Each Protection Mechanism](#testing-each-protection-mechanism)
4. [Monitoring and Metrics](#monitoring-and-metrics)
5. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin testing, ensure that:

- The NextBuy server is running (`npm run dev` in the server directory)
- You have access to the admin dashboard (admin credentials required)
- You have installed the necessary testing tools

## Testing Tools

We recommend using the following tools for testing bot protection:

1. **Postman** or **Insomnia** - For API testing
2. **curl** - For command-line testing
3. **Puppeteer** or **Playwright** - For headless browser testing
4. **Bot Protection Test Script** - Included in the codebase at `server/tests/botProtectionTest.js`

## Testing Each Protection Mechanism

### 1. Rate Limiting

Rate limiting prevents excessive requests from a single source.

**How to test:**

```bash
# Run the test script with rate limiting enabled
node server/tests/botProtectionTest.js

# Or manually send multiple requests in quick succession
for i in {1..15}; do
  curl -X POST http://localhost:5000/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"password123"}'
  sleep 0.1
done
```

**Expected result:** After several requests, you should receive a 429 Too Many Requests response.

### 2. Headless Browser Detection

This mechanism detects automated browsers commonly used by bots.

**How to test:**

```bash
# Using curl with a headless browser user agent
curl -X GET http://localhost:5000/api/products \
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/88.0.4298.0 Safari/537.36"
```

**Expected result:** You should receive a 403 Forbidden response with a message indicating suspicious activity.

### 3. Behavioral Analysis

This detects suspicious user behavior patterns.

**How to test:**

```bash
# Send a request with suspicious behavioral data
curl -X POST http://localhost:5000/api/behavior/log \
  -H "Content-Type: application/json" \
  -d '{
    "interactionData": {
      "mouseMovements": 0,
      "clickSpeed": 10,
      "formFillTime": 100,
      "navigationSpeed": "very_fast"
    }
  }'
```

**Expected result:** The behavior should be logged as suspicious in the metrics dashboard.

### 4. Honeypot Traps

Honeypots are hidden fields that only bots would fill out.

**How to test:**

```bash
# Submit a form with honeypot fields filled
curl -X POST http://localhost:5000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "website": "http://example.com"
  }'
```

**Expected result:** The request will appear to succeed (200 OK) but the user won't actually be registered, and the bot detection will be logged.

### 5. Device Fingerprinting

This creates a unique identifier for each device to track suspicious patterns.

**How to test:**

This is mostly passive and works in conjunction with other mechanisms. Check the metrics dashboard to see if fingerprints are being generated and tracked.

## Monitoring and Metrics

### Bot Detection Dashboard

Access the bot detection dashboard at:

```
http://localhost:5000/api/admin/bot-dashboard
```

This dashboard provides:

- Total requests and detected bots
- Detection method breakdown
- Top bot IP addresses
- Top suspicious user agents

### API Endpoints for Metrics

For programmatic access to metrics:

```bash
# Get metrics in JSON format
curl http://localhost:5000/api/admin/bot-metrics

# Reset metrics
curl -X POST http://localhost:5000/api/admin/bot-metrics/reset
```

## Troubleshooting

### Common Issues

1. **False Positives**: If legitimate users are being blocked:
   - Adjust detection thresholds in `server/middleware/botProtection.js`
   - Whitelist trusted IP addresses or user agents

2. **False Negatives**: If bots are not being detected:
   - Increase detection sensitivity
   - Add additional detection patterns for emerging bot techniques

3. **Rate Limiting Too Aggressive**: If rate limits are too restrictive:
   - Increase the `max` value in the rate limit configurations
   - Increase the `windowMs` time window

### Logs

Check the server logs and the `logs/bot_metrics.json` file for detailed information about bot detection events.

## Advanced Testing

For more comprehensive testing, run the included test script:

```bash
node server/tests/botProtectionTest.js
```

This script tests all protection mechanisms and provides a detailed report of the results. 