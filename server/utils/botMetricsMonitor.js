import fs from 'fs';
import path from 'path';

// Configuration
const LOG_DIR = path.join(process.cwd(), 'logs');
const BOT_METRICS_FILE = path.join(LOG_DIR, 'bot_metrics.json');
const REPORT_INTERVAL = 3600000; // 1 hour in milliseconds

// Ensure log directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Initialize metrics storage
let metrics = {
  totalRequests: 0,
  detectedBots: 0,
  detectionMethods: {
    rateLimit: 0,
    headlessBrowser: 0,
    userAgent: 0,
    behavioral: 0,
    honeypot: 0,
    captchaFailed: 0,
    ipAnalysis: 0,
    sqlInjection: 0,
    combined: 0
  },
  ipAddresses: {},
  userAgents: {},
  geoLocations: {},
  requestPaths: {},
  hourlyStats: {},
  suspiciousPatterns: {
    rapidRequests: 0,
    headlessDetections: 0,
    vpnProxyRequests: 0,
    honeypotTriggers: 0
  },
  lastReset: Date.now()
};

// Load existing metrics if available
try {
  if (fs.existsSync(BOT_METRICS_FILE)) {
    const data = fs.readFileSync(BOT_METRICS_FILE, 'utf8');
    const loadedMetrics = JSON.parse(data);
    
    // Merge with default structure to ensure all fields exist
    metrics = {
      ...metrics,
      ...loadedMetrics,
      detectionMethods: {
        ...metrics.detectionMethods,
        ...loadedMetrics.detectionMethods
      },
      suspiciousPatterns: {
        ...metrics.suspiciousPatterns,
        ...loadedMetrics.suspiciousPatterns
      }
    };
  }
} catch (error) {
  console.error('Error loading bot metrics:', error);
}

/**
 * Determine severity level of a bot detection
 * @param {Object} data - Detection data
 * @returns {string} Severity level (low, medium, high, critical)
 */
function determineSeverity(data) {
  if (!data.method) return 'low';
  
  // Critical severity
  if (data.method === 'combined' || data.method === 'headlessBrowser') {
    return 'critical';
  }
  
  // High severity
  if (data.method === 'rateLimit' || data.method === 'honeypot') {
    return 'high';
  }
  
  // Medium severity
  if (data.method === 'ipAnalysis' || data.method === 'behavioral') {
    return 'medium';
  }
  
  // Low severity
  return 'low';
}

/**
 * Log a bot detection event
 * @param {Object} data - Detection data
 * @param {string} data.method - Detection method
 * @param {string} data.ip - IP address
 * @param {string} data.userAgent - User agent string
 * @param {string} data.path - Request path
 * @param {Object} data.details - Additional details
 */
export function logBotDetection(data) {
  metrics.totalRequests++;
  metrics.detectedBots++;
  
  // Increment detection method counter
  if (data.method && metrics.detectionMethods[data.method] !== undefined) {
    metrics.detectionMethods[data.method]++;
  }
  
  // Track IP addresses
  if (data.ip) {
    metrics.ipAddresses[data.ip] = (metrics.ipAddresses[data.ip] || 0) + 1;
  }
  
  // Track user agents
  if (data.userAgent) {
    metrics.userAgents[data.userAgent] = (metrics.userAgents[data.userAgent] || 0) + 1;
  }
  
  // Track request paths
  if (data.path) {
    metrics.requestPaths[data.path] = (metrics.requestPaths[data.path] || 0) + 1;
  }
  
  // Track geolocation data if available
  if (data.details && data.details.geoData) {
    const country = data.details.geoData.country || 'Unknown';
    metrics.geoLocations[country] = (metrics.geoLocations[country] || 0) + 1;
  }
  
// Track hourly statistics
  const hour = new Date().getHours();
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  const hourKey = `${date}-${hour}`;
  
  if (!metrics.hourlyStats[hour]) {
    metrics.hourlyStats[hour] = { total: 0, bots: 0 };
  }
  metrics.hourlyStats[hour].bots++;
  
  // Track detailed logs for dashboard tables
  if (!metrics.detailedLogs) {
    metrics.detailedLogs = [];
  }
  
  // Add detailed log entry
  metrics.detailedLogs.push({
    timestamp: new Date().toISOString(),
    method: data.method,
    ip: data.ip,
    userAgent: data.userAgent,
    path: data.path,
    details: data.details,
    severity: determineSeverity(data)
  });
  
  // Keep only last 1000 log entries
  if (metrics.detailedLogs.length > 1000) {
    metrics.detailedLogs = metrics.detailedLogs.slice(-1000);
  }
  
  // Track suspicious patterns
  if (data.method === 'headlessBrowser') {
    metrics.suspiciousPatterns.headlessDetections++;
  }
  if (data.method === 'rateLimit') {
    metrics.suspiciousPatterns.rapidRequests++;
  }
  if (data.method === 'honeypot') {
    metrics.suspiciousPatterns.honeypotTriggers++;
  }
  if (data.details && (data.details.geoData?.proxy || data.details.geoData?.hosting)) {
    metrics.suspiciousPatterns.vpnProxyRequests++;
  }
  
  // Save metrics to file
  saveMetrics();
}

/**
 * Log a regular request (not detected as bot)
 * @param {Object} data - Request data
 */
export function logRequest(data = {}) {
  metrics.totalRequests++;
  saveMetrics();
}

/**
 * Save metrics to file
 */
function saveMetrics() {
  try {
    // Ensure the directory exists
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    
    fs.writeFileSync(BOT_METRICS_FILE, JSON.stringify(metrics, null, 2));
  } catch (error) {
    console.warn('Warning: Could not save bot metrics to file:', error.message);
    // Continue execution even if file save fails
  }
}

/**
 * Generate a report of bot detection metrics
 * @returns {Object} Metrics report
 */
export function generateReport() {
  const now = Date.now();
  const timeFrame = now - metrics.lastReset;
  const timeFrameHours = (timeFrame / 3600000).toFixed(2);
  
  // Calculate percentages
  const botPercentage = metrics.totalRequests > 0 
    ? ((metrics.detectedBots / metrics.totalRequests) * 100).toFixed(2) 
    : 0;
  
  // Find top IPs and user agents
  const topIPs = Object.entries(metrics.ipAddresses)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
    
  const topUserAgents = Object.entries(metrics.userAgents)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
    
  // Find top countries
  const topCountries = Object.entries(metrics.geoLocations)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
    
  // Find top targeted paths
  const topPaths = Object.entries(metrics.requestPaths)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
    
  // Calculate hourly distribution
  const hourlyDistribution = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    bots: metrics.hourlyStats[hour]?.bots || 0,
    total: metrics.hourlyStats[hour]?.total || 0
  }));
  
  return {
    timeFrame: `${timeFrameHours} hours`,
    totalRequests: metrics.totalRequests,
    detectedBots: metrics.detectedBots,
    legitimateRequests: metrics.totalRequests - metrics.detectedBots,
    botPercentage: `${botPercentage}%`,
    detectionMethods: metrics.detectionMethods,
    suspiciousPatterns: metrics.suspiciousPatterns,
    topIPs,
    topUserAgents,
    topCountries,
    topPaths,
    hourlyDistribution,
    averageBotsPerHour: (metrics.detectedBots / Math.max(parseFloat(timeFrameHours), 1)).toFixed(2),
    generatedAt: new Date().toISOString()
  };
}

/**
 * Ingest external test results into the metrics
 * @param {Object} testResults - The results from a test run
 */
export function ingestTestResults(testResults) {
  if (!testResults || !Array.isArray(testResults)) {
    return;
  }

  for (const result of testResults) {
    metrics.totalRequests++;
    if (result.status_code !== 200) {
      metrics.detectedBots++;
      const method = result.test.toLowerCase().replace(/\s/g, '');
      if (metrics.detectionMethods[method] !== undefined) {
        metrics.detectionMethods[method]++;
      } else {
        metrics.detectionMethods[method] = 1;
      }

      if (result.status_code === 429) {
        metrics.suspiciousPatterns.rapidRequests++;
      }
    }
  }
  saveMetrics();
}

/**
 * Reset metrics
 */
export function resetMetrics() {
  metrics = {
    totalRequests: 0,
    detectedBots: 0,
    detectionMethods: {
      rateLimit: 0,
      headlessBrowser: 0,
      userAgent: 0,
      behavioral: 0,
      honeypot: 0,
      captchaFailed: 0,
      ipAnalysis: 0,
      sqlInjection: 0,
      combined: 0
    },
    ipAddresses: {},
    userAgents: {},
    geoLocations: {},
    requestPaths: {},
    hourlyStats: {},
    suspiciousPatterns: {
      rapidRequests: 0,
      headlessDetections: 0,
      vpnProxyRequests: 0,
      honeypotTriggers: 0
    },
    lastReset: Date.now()
  };
  saveMetrics();
}

// Set up periodic reporting
setInterval(() => {
  const report = generateReport();
  console.log('=== Bot Detection Report ===');
  console.log(JSON.stringify(report, null, 2));
}, REPORT_INTERVAL);

export default {
  logBotDetection,
  logRequest,
  generateReport,
  resetMetrics,
  ingestTestResults
};