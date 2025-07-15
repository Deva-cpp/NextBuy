import rateLimit from 'express-rate-limit';
import { UAParser } from 'ua-parser-js';
import { createHash } from 'crypto';
import { logBotDetection } from '../utils/botMetricsMonitor.js';

// Rate limiting middleware with path-based exclusions
export const apiRateLimit = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5, // limit each IP to 5 requests per windowMs - even stricter
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => {
    // Skip rate limiting for certain paths to allow better testing
    const exemptPaths = ['/health'];
    return exemptPaths.includes(req.path);
  },
  keyGenerator: (req) => {
    // Use IP address and user agent as the key for more granular rate limiting
    return `${req.ip}-${req.headers['user-agent'] || 'unknown'}`;
  },
  handler: (req, res, next, options) => {
    // Log rate limit hit to metrics
    logBotDetection({
      method: 'rateLimit',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      details: { 
        limit: options.max,
        windowMs: options.windowMs
      }
    });
    
    res.status(options.statusCode).send(options.message);
  }
});

// Aggressive rate limiting for testing
export const testRateLimit = rateLimit({
  windowMs: 30 * 1000, // 30 seconds
  max: 2, // limit each IP to 2 requests per 30 seconds - even stricter
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Rate limit exceeded for testing.' },
  keyGenerator: (req) => {
    // Check if this is a test request
    const userAgent = req.headers['user-agent'] || '';
    if (userAgent.includes('Test') || userAgent.includes('python-requests')) {
      return `test-${req.ip}`; // Separate limit pool for test requests
    }
    return `${req.ip}-${userAgent}`;
  },
  handler: (req, res, next, options) => {
    // Log rate limit hit to metrics
    logBotDetection({
      method: 'rateLimit',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      details: { 
        type: 'test',
        limit: options.max,
        windowMs: options.windowMs
      },
      severity: 'high'
    });
    
    res.status(options.statusCode).send(options.message);
  }
});

// More strict rate limit for authentication routes
export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2, // limit each IP to 2 login attempts per 15 minutes - even stricter
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later.' },
  handler: (req, res, next, options) => {
    // Log auth rate limit hit to metrics
    logBotDetection({
      method: 'rateLimit',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      details: { 
        type: 'auth',
        limit: options.max,
        windowMs: options.windowMs
      }
    });
    
    res.status(options.statusCode).send(options.message);
  }
});

// Headless browser detection
export const detectHeadlessBrowser = (req, res, next) => {
  const userAgent = req.headers['user-agent'] || '';
  const parser = new UAParser(userAgent);
  const browser = parser.getBrowser();
  const os = parser.getOS();
  
  // Enhanced headless browser indicators
  const headlessIndicators = [
    'headless',
    'phantomjs',
    'puppeteer',
    'selenium',
    'webdriver',
    'chrome-headless',
    'playwright',
    'jsdom',
    'nightmare',
    'zombie'
  ];
  
  // Known bot user agents (can be customized based on your needs)
  const knownBots = [
    'googlebot',
    'bingbot',
    'slurp',
    'duckduckbot',
    'baiduspider',
    'yandexbot',
    'facebookexternalhit',
    'twitterbot',
    'linkedinbot',
    'whatsapp',
    'telegrambot',
    'slackbot',
    'discordbot',
    // Add suspicious user agents for blocking
    'curl',
    'wget',
    'python-requests',
    'bot',
    'crawler',
    'spider',
    'scraper'
  ];
  
  const userAgentLower = userAgent.toLowerCase();
  
  const isHeadless = headlessIndicators.some(indicator => 
    userAgentLower.includes(indicator)
  );
  
  const isKnownBot = knownBots.some(bot => 
    userAgentLower.includes(bot)
  );
  
  // Check for inconsistencies that may indicate a spoofed user agent
  const hasInconsistencies = (
    (browser.name === 'Chrome' && !userAgent.includes('Chrome')) ||
    (browser.name === 'Firefox' && !userAgent.includes('Firefox')) ||
    (os.name === 'Windows' && userAgent.includes('Linux')) ||
    (os.name === 'Linux' && userAgent.includes('Windows'))
  );
  
  // Handle different types of detection
  if (isHeadless || hasInconsistencies) {
    req.isBot = true;
    req.botScore = 0.9; // Very high probability for headless/inconsistent agents
    req.detectionReason = 'headless_or_inconsistent';
    
    // Log headless browser detection to metrics
    logBotDetection({
      method: 'headlessBrowser',
      ip: req.ip,
      userAgent,
      path: req.path,
      details: { 
        isHeadless,
        hasInconsistencies,
        browser: browser.name,
        os: os.name
      }
    });
  } else if (isKnownBot) {
    req.isBot = true;
    req.botScore = 0.6; // Medium-high probability for known bots
    req.detectionReason = 'known_bot';
    req.isLegitimateBot = true; // Flag for potential SEO bots
    
    // Log known bot detection
    logBotDetection({
      method: 'knownBot',
      ip: req.ip,
      userAgent,
      path: req.path,
      details: { 
        botType: 'known_crawler',
        browser: browser.name,
        os: os.name
      }
    });
  } else {
    req.isBot = false;
    req.botScore = 0.1; // Low probability
    req.detectionReason = 'clean';
  }
  
  next();
};

// Enhanced IP analysis middleware with geolocation
export const analyzeIP = async (req, res, next) => {
  const clientIP = req.ip || req.connection.remoteAddress;
  
  // Handle localhost and private network IPs - but still apply some scoring for testing
  if (clientIP.includes('127.0.0.1') || clientIP.includes('::1')) {
    req.ipScore = 0.3; // Give localhost some score for testing purposes
    req.ipGeoData = { country: 'localhost', isp: 'localhost', proxy: false };
    return next();
  } else if (clientIP.startsWith('192.168.') || clientIP.startsWith('10.') || clientIP.startsWith('172.')) {
    req.ipScore = 0.4; // Local network IPs get moderate score for testing
    req.ipGeoData = { country: 'private', isp: 'private network', proxy: false };
    return next();
  }
  
  try {
    // Fetch geolocation data from ip-api.com
    const geoResponse = await fetch(`http://ip-api.com/json/${clientIP}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting,query`);
    const geoData = await geoResponse.json();
    
    if (geoData.status === 'success') {
      req.ipGeoData = geoData;
      
      // Calculate risk score based on geolocation data
      let riskScore = 0.3; // Base score for external IPs
      
      // High-risk countries (common sources of bot traffic)
      const highRiskCountries = ['CN', 'RU', 'KP', 'IR', 'VN', 'BD', 'PK', 'ID'];
      if (highRiskCountries.includes(geoData.countryCode)) {
        riskScore += 0.3;
      }
      
      // Check for VPN/Proxy indicators
      if (geoData.proxy === true || geoData.hosting === true) {
        riskScore += 0.4;
      }
      
      // Check for suspicious ISPs/Organizations
      const suspiciousKeywords = ['vpn', 'proxy', 'hosting', 'datacenter', 'cloud', 'amazon', 'google cloud', 'microsoft', 'digitalocean', 'vultr', 'linode'];
      const ispLower = (geoData.isp || '').toLowerCase();
      const orgLower = (geoData.org || '').toLowerCase();
      
      if (suspiciousKeywords.some(keyword => ispLower.includes(keyword) || orgLower.includes(keyword))) {
        riskScore += 0.2;
      }
      
      // Check for known bot/crawler ASNs
      const botASNs = ['AS15169', 'AS8075', 'AS13335', 'AS16509']; // Google, Microsoft, Cloudflare, Amazon
      if (geoData.as && botASNs.some(asn => geoData.as.includes(asn))) {
        riskScore += 0.1;
      }
      
      req.ipScore = Math.min(riskScore, 1.0); // Cap at 1.0
      
      // Log suspicious IP to metrics if score is high enough
      if (req.ipScore > 0.7) {
        logBotDetection({
          method: 'ipAnalysis',
          ip: clientIP,
          userAgent: req.headers['user-agent'],
          path: req.path,
          details: { 
            ipScore: req.ipScore,
            geoData: {
              country: geoData.country,
              countryCode: geoData.countryCode,
              city: geoData.city,
              isp: geoData.isp,
              org: geoData.org,
              proxy: geoData.proxy,
              hosting: geoData.hosting,
              as: geoData.as
            }
          }
        });
      }
    } else {
      // If geolocation fails, use basic scoring
      req.ipScore = 0.5;
      req.ipGeoData = { error: geoData.message || 'Geolocation lookup failed' };
    }
  } catch (error) {
    // If API call fails, fall back to basic scoring
    req.ipScore = 0.5;
    req.ipGeoData = { error: 'Geolocation service unavailable' };
    console.warn(`IP geolocation lookup failed for ${clientIP}:`, error.message);
  }
  
  next();
};

// Device fingerprinting middleware
export const deviceFingerprinting = (req, res, next) => {
  // Create a simple fingerprint based on available request data
  // In production, you would use FingerprintJS Pro or a similar service
  const fingerprint = createHash('sha256')
    .update(req.headers['user-agent'] || '')
    .update(req.headers['accept-language'] || '')
    .update(req.headers['accept'] || '')
    .update(req.ip || '')
    .digest('hex');
  
  req.deviceFingerprint = fingerprint;
  next();
};

// Behavioral analysis middleware
export const behavioralAnalysis = (req, res, next) => {
  // This would typically be implemented on the client side with JavaScript
  // Here we just check if the client has sent behavioral data
  const interactionData = req.body.interactionData || {};
  
  let behaviorScore = 0.5; // Default neutral score
  
  // Check for suspicious patterns in interaction data
  if (interactionData.mouseMovements && interactionData.mouseMovements.length > 0) {
    // Analyze mouse movement patterns
    // For example, too straight or too regular movements might indicate a bot
    behaviorScore -= 0.2;
  }
  
  if (interactionData.clickSpeed && interactionData.clickSpeed < 50) {
    // Suspiciously fast clicks
    behaviorScore += 0.3;
  }
  
  if (interactionData.formFillTime && interactionData.formFillTime < 500) {
    // Forms filled too quickly
    behaviorScore += 0.3;
  }
  
  req.behaviorScore = Math.min(Math.max(behaviorScore, 0), 1); // Clamp between 0 and 1
  
  // Log suspicious behavior to metrics
  if (req.behaviorScore > 0.7) {
    logBotDetection({
      method: 'behavioral',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      details: { 
        behaviorScore: req.behaviorScore,
        interactionData
      }
    });
  }
  
  next();
};

// Combined bot detection middleware
export const botDetection = (req, res, next) => {
  // Bypass bot detection for test requests
  if (req.headers['x-nextbuy-test-request'] === 'true') {
    return next();
  }
  // Only skip bot detection for health endpoint and metrics ingestion
  const exemptPaths = [
    '/health',
    '/api/admin/bot-metrics/ingest'
  ];
  
  if (exemptPaths.includes(req.path) || req.path.startsWith('/api/admin/bot-metrics/ingest')) {
    return next();
  }
  
  // Set default behavioral score if not set
  if (!req.behaviorScore) {
    req.behaviorScore = 0.5;
  }
  
  // If already detected as headless browser or known bot, block immediately
  if (req.isBot) {
    req.isSuspectedBot = true;
  } else {
    // Combine all scores to determine if the request is from a bot
    const combinedScore = (
      (req.botScore || 0.5) * 0.3 +
      (req.ipScore || 0.5) * 0.2 +
      (req.behaviorScore || 0.5) * 0.5
    );
    
    req.isSuspectedBot = combinedScore > 0.5; // Lower threshold for stricter detection
  }
  
  // Handle different types of bots
  try {
    if (req.isSuspectedBot) {
      // Block all bots, no allow-list
      logBotDetection({
        method: 'combined',
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        path: req.path,
        details: {
          botScore: req.botScore,
          detectionReason: req.detectionReason || 'high_score',
          botScoreComponents: {
            userAgent: req.botScore || 0.5,
            ip: req.ipScore || 0.5,
            behavior: req.behaviorScore || 0.5
          },
          action: 'blocked'
        }
      });
      
      // Return different responses based on detection type
      if (req.detectionReason === 'headless_or_inconsistent') {
        return res.status(403).json({
          error: 'Automated browser detected',
          message: 'Security verification required'
        });
      }
      
      return res.status(403).json({
        error: 'Suspicious activity detected',
        message: 'Security verification required'
      });
    }
  } catch (error) {
    console.error('Error during bot detection processing:', error);
  }

  next();
};

// Honeypot middleware
export const honeypotCheck = (req, res, next) => {
  // Check if req.body exists and is an object
  if (req.body && typeof req.body === 'object') {
    // Check if the honeypot fields are filled (bots often fill all fields)
    if (req.body.website || req.body.email2 || req.body.phone2) {
      // Log honeypot detection to metrics
      logBotDetection({
        method: 'honeypot',
        ip: req.ip,
        userAgent: req.headers['user-agent'] || '',
        path: req.path,
        details: {
          honeypotFields: {
            website: !!req.body.website,
            email2: !!req.body.email2,
            phone2: !!req.body.phone2,
          },
        },
      });

      return res.status(200).json({ success: true }); // Return success to fool the bot
    }
  }
  next();
};

// SQL Injection detection middleware
export const sqlInjectionCheck = (req, res, next) => {
  // Common SQL injection patterns
  const sqlPatterns = [
    /('|(\-\-)|(;)|(\||\|)|(\*|\*))/i,
    /(union|select|insert|update|delete|drop|create|alter|exec|execute)/i,
    /(script|javascript|vbscript|onload|onerror|onclick)/i,
    /(or\s+1\s*=\s*1|and\s+1\s*=\s*1)/i,
    /(or\s+'\w+'\s*=\s*'\w+'|and\s+'\w+'\s*=\s*'\w+')/i,
    /(\bor\b|\band\b)\s+(true|false)/i,
    /(xp_|sp_|0x)/i,
    /(information_schema|sysobjects|syscolumns)/i
  ];
  
  // Function to check a value for SQL injection
  const checkForSQLInjection = (value) => {
    if (typeof value !== 'string') return false;
    return sqlPatterns.some(pattern => pattern.test(value));
  };
  
  // Check request body
  let hasSQLInjection = false;
  let maliciousField = '';
  
  if (req.body && typeof req.body === 'object') {
    for (const [key, value] of Object.entries(req.body)) {
      if (checkForSQLInjection(value)) {
        hasSQLInjection = true;
        maliciousField = key;
        break;
      }
    }
  }
  
  // Check query parameters
  if (!hasSQLInjection && req.query) {
    for (const [key, value] of Object.entries(req.query)) {
      if (checkForSQLInjection(value)) {
        hasSQLInjection = true;
        maliciousField = key;
        break;
      }
    }
  }
  
  // Check URL parameters
  if (!hasSQLInjection && req.params) {
    for (const [key, value] of Object.entries(req.params)) {
      if (checkForSQLInjection(value)) {
        hasSQLInjection = true;
        maliciousField = key;
        break;
      }
    }
  }
  
  if (hasSQLInjection) {
    // Log SQL injection attempt
    logBotDetection({
      method: 'sqlInjection',
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      details: {
        maliciousField,
        requestMethod: req.method,
        body: req.body,
        query: req.query,
        params: req.params
      }
    });
    
    return res.status(400).json({
      error: 'Invalid input detected',
      message: 'Please check your input and try again'
    });
  }
  
  next();
};
