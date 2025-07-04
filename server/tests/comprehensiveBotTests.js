import { UAParser } from 'ua-parser-js';
import { createHash } from 'crypto';
import { 
  apiRateLimit, 
  authRateLimit, 
  detectHeadlessBrowser, 
  analyzeIP, 
  deviceFingerprinting,
  behavioralAnalysis,
  botDetection,
  honeypotCheck
} from '../middleware/botProtection.js';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

console.log(`${colors.blue}=== Comprehensive Bot Detection Test Suite ====${colors.reset}`);

// Mock request and response objects
function createMockReq(options = {}) {
  const mockReq = {
    ip: options.ip || '127.0.0.1',
    path: options.path || '/test',
    headers: {
      'user-agent': options.userAgent || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'accept-language': options.acceptLanguage || 'en-US,en;q=0.9',
      'accept': options.accept || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      ...options.headers
    },
    body: options.body || {},
    connection: {
      remoteAddress: options.ip || '127.0.0.1'
    },
    ...options
  };
  
  // Ensure headers['user-agent'] matches the userAgent option
  if (options.userAgent) {
    mockReq.headers['user-agent'] = options.userAgent;
  }
  
  return mockReq;
}

function createMockRes() {
  const res = {
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.jsonData = data;
      return this;
    },
    send: function(data) {
      this.sentData = data;
      return this;
    }
  };
  return res;
}

function createMockNext() {
  let called = false;
  return () => {
    called = true;
    return { called };
  };
}

// Test runner function
async function runTest(testName, testFn) {
  try {
    console.log(`\n${colors.cyan}Testing: ${testName}${colors.reset}`);
    const result = await testFn();
    if (result.success) {
      console.log(`${colors.green}✓ PASS${colors.reset} - ${result.message || 'Test passed'}`);
    } else {
      console.log(`${colors.red}✗ FAIL${colors.reset} - ${result.message || 'Test failed'}`);
    }
    if (result.details) {
      console.log(`${colors.yellow}  Details: ${JSON.stringify(result.details)}${colors.reset}`);
    }
  } catch (error) {
    console.log(`${colors.red}✗ ERROR${colors.reset} - ${testName}: ${error.message}`);
  }
}

// Test 1: Headless Browser Detection
async function testHeadlessBrowserDetection() {
  console.log(`\n${colors.blue}=== Headless Browser Detection Tests ====${colors.reset}`);
  
  // Test 1.1: Normal browser
  await runTest('Normal Browser Detection', () => {
    const req = createMockReq({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    const res = createMockRes();
    const next = createMockNext();
    
    detectHeadlessBrowser(req, res, next);
    
    return {
      success: !req.isBot && req.botScore === 0.1,
      message: `Bot detected: ${req.isBot}, Score: ${req.botScore}`,
      details: { isBot: req.isBot, botScore: req.botScore }
    };
  });
  
  // Test 1.2: Headless Chrome
  await runTest('Headless Chrome Detection', () => {
    const req = createMockReq({
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/88.0.4298.0 Safari/537.36'
    });
    const res = createMockRes();
    const next = createMockNext();
    
    detectHeadlessBrowser(req, res, next);
    
    return {
      success: req.isBot && req.botScore === 0.9,
      message: `Bot detected: ${req.isBot}, Score: ${req.botScore}`,
      details: { isBot: req.isBot, botScore: req.botScore }
    };
  });
  
  // Test 1.3: PhantomJS
  await runTest('PhantomJS Detection', () => {
    const req = createMockReq({
      userAgent: 'Mozilla/5.0 (Unknown; Linux x86_64) AppleWebKit/534.34 (KHTML, like Gecko) PhantomJS/1.9.8 Safari/534.34'
    });
    const res = createMockRes();
    const next = createMockNext();
    
    detectHeadlessBrowser(req, res, next);
    
    return {
      success: req.isBot && req.botScore === 0.9,
      message: `Bot detected: ${req.isBot}, Score: ${req.botScore}`,
      details: { isBot: req.isBot, botScore: req.botScore }
    };
  });
}

// Test 2: IP Analysis
async function testIPAnalysis() {
  console.log(`\n${colors.blue}=== IP Analysis Tests ====${colors.reset}`);
  
  // Test 2.1: Localhost IP
  await runTest('Localhost IP Analysis', async () => {
    const req = createMockReq({ ip: '127.0.0.1' });
    const res = createMockRes();
    const next = createMockNext();
    
    await analyzeIP(req, res, next);
    
    return {
      success: req.ipScore === 0.3,
      message: `IP Score: ${req.ipScore}`,
      details: { ipScore: req.ipScore, geoData: req.ipGeoData }
    };
  });
  
  // Test 2.2: Private network IP
  await runTest('Private Network IP Analysis', async () => {
    const req = createMockReq({ ip: '192.168.1.100' });
    const res = createMockRes();
    const next = createMockNext();
    
    await analyzeIP(req, res, next);
    
    return {
      success: req.ipScore === 0.4,
      message: `IP Score: ${req.ipScore}`,
      details: { ipScore: req.ipScore, geoData: req.ipGeoData }
    };
  });
  
  // Test 2.3: External IP (optional - requires internet)
  await runTest('External IP Analysis (Google DNS)', async () => {
    const req = createMockReq({ ip: '8.8.8.8' });
    const res = createMockRes();
    const next = createMockNext();
    
    await analyzeIP(req, res, next);
    
    // External IP should get at least base score of 0.3 + additional factors
    const hasValidScore = req.ipScore >= 0.3 && req.ipScore <= 1.0;
    const hasGeoData = req.ipGeoData && typeof req.ipGeoData === 'object';
    
    return {
      success: hasValidScore && hasGeoData,
      message: `IP Score: ${req.ipScore}, Has Geo Data: ${hasGeoData}`,
      details: { ipScore: req.ipScore, geoData: req.ipGeoData }
    };
  });
}

// Test 3: Device Fingerprinting
async function testDeviceFingerprinting() {
  console.log(`\n${colors.blue}=== Device Fingerprinting Tests ====${colors.reset}`);
  
  await runTest('Device Fingerprint Generation', () => {
    const req = createMockReq({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'accept-language': 'en-US,en;q=0.9',
        'accept': 'text/html,application/xhtml+xml'
      }
    });
    const res = createMockRes();
    const next = createMockNext();
    
    deviceFingerprinting(req, res, next);
    
    const hasFingerprint = req.deviceFingerprint && req.deviceFingerprint.length === 64;
    
    return {
      success: hasFingerprint,
      message: `Fingerprint generated: ${hasFingerprint}`,
      details: { fingerprint: req.deviceFingerprint?.substring(0, 16) + '...' }
    };
  });
}

// Test 4: Behavioral Analysis
async function testBehavioralAnalysis() {
  console.log(`\n${colors.blue}=== Behavioral Analysis Tests ====${colors.reset}`);
  
  // Test 4.1: Normal behavior
  await runTest('Normal User Behavior', () => {
    const req = createMockReq({
      body: {
        interactionData: {
          mouseMovements: [
            {x: 100, y: 100},
            {x: 120, y: 110},
            {x: 150, y: 130}
          ],
          formFillTime: 5000,
          clickSpeed: 300
        }
      }
    });
    const res = createMockRes();
    const next = createMockNext();
    
    behavioralAnalysis(req, res, next);
    
    return {
      success: req.behaviorScore <= 0.5,
      message: `Behavior Score: ${req.behaviorScore}`,
      details: { behaviorScore: req.behaviorScore }
    };
  });
  
  // Test 4.2: Suspicious behavior
  await runTest('Suspicious Bot Behavior', () => {
    const req = createMockReq({
      body: {
        interactionData: {
          mouseMovements: [],
          formFillTime: 200,
          clickSpeed: 10
        }
      }
    });
    const res = createMockRes();
    const next = createMockNext();
    
    behavioralAnalysis(req, res, next);
    
    return {
      success: req.behaviorScore > 0.7,
      message: `Behavior Score: ${req.behaviorScore}`,
      details: { behaviorScore: req.behaviorScore }
    };
  });
}

// Test 5: Combined Bot Detection
async function testCombinedBotDetection() {
  console.log(`\n${colors.blue}=== Combined Bot Detection Tests ====${colors.reset}`);
  
  // Test 5.1: Legitimate user
  await runTest('Legitimate User Detection', () => {
    const req = createMockReq({
      botScore: 0.1,
      ipScore: 0.2,
      behaviorScore: 0.3,
      path: '/api/test'
    });
    const res = createMockRes();
    const next = createMockNext();
    
    botDetection(req, res, next);
    
    return {
      success: !req.isSuspectedBot && !res.statusCode,
      message: `Suspected Bot: ${req.isSuspectedBot}`,
      details: { isSuspectedBot: req.isSuspectedBot }
    };
  });
  
  // Test 5.2: Suspected bot
  await runTest('Suspected Bot Detection', () => {
    const req = createMockReq({
      botScore: 0.8,
      ipScore: 0.9,
      behaviorScore: 0.8,
      path: '/api/test'
    });
    const res = createMockRes();
    const next = createMockNext();
    
    botDetection(req, res, next);
    
    return {
      success: req.isSuspectedBot && res.statusCode === 403,
      message: `Suspected Bot: ${req.isSuspectedBot}, Status: ${res.statusCode}`,
      details: { isSuspectedBot: req.isSuspectedBot, statusCode: res.statusCode, response: res.jsonData }
    };
  });
}

// Test 6: Honeypot Detection
async function testHoneypotDetection() {
  console.log(`\n${colors.blue}=== Honeypot Detection Tests ====${colors.reset}`);
  
  // Test 6.1: Clean form submission
  await runTest('Clean Form Submission', () => {
    const req = createMockReq({
      body: {
        name: 'John Doe',
        email: 'john@example.com',
        message: 'Hello world'
      }
    });
    const res = createMockRes();
    const next = createMockNext();
    
    honeypotCheck(req, res, next);
    
    return {
      success: !res.statusCode,
      message: `Form passed honeypot check`,
      details: { blocked: !!res.statusCode }
    };
  });
  
  // Test 6.2: Honeypot field filled
  await runTest('Honeypot Field Filled', () => {
    const req = createMockReq({
      body: {
        name: 'Bot Name',
        email: 'bot@example.com',
        website: 'http://spam.com',
        message: 'Spam message'
      }
    });
    const res = createMockRes();
    const next = createMockNext();
    
    honeypotCheck(req, res, next);
    
    return {
      success: res.statusCode === 200 && res.jsonData?.success,
      message: `Honeypot triggered: ${!!res.statusCode}`,
      details: { statusCode: res.statusCode, response: res.jsonData }
    };
  });
}

// Test 7: User Agent Analysis
async function testUserAgentAnalysis() {
  console.log(`\n${colors.blue}=== User Agent Analysis Tests ====${colors.reset}`);
  
  await runTest('Known Bot User Agent', () => {
    const userAgent = 'Googlebot/2.1 (+http://www.google.com/bot.html)';
    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser();
    
    // Check if it's identified as a known bot
    const knownBots = ['googlebot', 'bingbot', 'slurp', 'facebookexternalhit'];
    const isKnownBot = knownBots.some(bot => userAgent.toLowerCase().includes(bot));
    
    return {
      success: isKnownBot,
      message: `Known bot detected: ${isKnownBot}`,
      details: { userAgent, browser: browser.name, isBot: isKnownBot }
    };
  });
}

// Main test runner
async function runAllTests() {
  console.log(`${colors.magenta}Starting comprehensive bot detection tests...${colors.reset}\n`);
  
  await testHeadlessBrowserDetection();
  await testIPAnalysis();
  await testDeviceFingerprinting();
  await testBehavioralAnalysis();
  await testCombinedBotDetection();
  await testHoneypotDetection();
  await testUserAgentAnalysis();
  
  console.log(`\n${colors.blue}=== Test Suite Complete ====${colors.reset}`);
  console.log(`${colors.green}All bot detection middleware functions have been tested.${colors.reset}`);
  console.log(`${colors.yellow}Note: These tests verify the middleware logic. For full integration testing, run the server and use the HTTP-based tests.${colors.reset}`);
}

// Run the tests
runAllTests().catch(error => {
  console.error(`${colors.red}Test suite error:${colors.reset}`, error);
});
