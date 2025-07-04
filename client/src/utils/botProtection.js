import FingerprintJS from '@fingerprintjs/fingerprintjs';
import axios from 'axios';

// Initialize fingerprint library
const fpPromise = FingerprintJS.load();

// Store mouse movement data
const mouseMovements = [];
const clickTimes = [];
let formStartTime = null;
let formEndTime = null;

// Track user behavior
export const trackUserBehavior = () => {
  // Track mouse movements
  document.addEventListener('mousemove', (event) => {
    // Only store every 10th movement to avoid excessive data
    if (mouseMovements.length % 10 === 0) {
      mouseMovements.push({
        x: event.clientX,
        y: event.clientY,
        timestamp: Date.now()
      });
      
      // Keep only the last 100 movements
      if (mouseMovements.length > 100) {
        mouseMovements.shift();
      }
    }
  });
  
  // Track clicks
  document.addEventListener('click', () => {
    clickTimes.push(Date.now());
    
    // Keep only the last 20 clicks
    if (clickTimes.length > 20) {
      clickTimes.shift();
    }
  });
  
  // Track form interactions
  document.addEventListener('focusin', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      if (!formStartTime) {
        formStartTime = Date.now();
      }
    }
  });
  
  document.addEventListener('focusout', (event) => {
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
      formEndTime = Date.now();
    }
  });
};

// Calculate average click speed (time between clicks)
const calculateClickSpeed = () => {
  if (clickTimes.length < 2) return null;
  
  let totalDiff = 0;
  for (let i = 1; i < clickTimes.length; i++) {
    totalDiff += clickTimes[i] - clickTimes[i-1];
  }
  
  return totalDiff / (clickTimes.length - 1);
};

// Calculate form fill time
const calculateFormFillTime = () => {
  if (!formStartTime || !formEndTime) return null;
  return formEndTime - formStartTime;
};

// Send behavioral data to the server
export const sendBehavioralData = async () => {
  try {
    // Get fingerprint
    const fp = await fpPromise;
    const result = await fp.get();
    
    // Prepare data to send
    const behavioralData = {
      interactionData: {
        mouseMovements: mouseMovements.slice(-20), // Send only last 20 movements
        clickSpeed: calculateClickSpeed(),
        formFillTime: calculateFormFillTime()
      },
      fingerprint: result.visitorId
    };
    
    // Send data to server
    await axios.post('/api/bot-protection/log-behavior', behavioralData);
    
    // Reset form timing
    formStartTime = null;
    formEndTime = null;
    
  } catch (error) {
    // Silent fail - don't alert the user to errors in behavioral tracking
    console.error('Error sending behavioral data:', error);
  }
};

// Get device fingerprint
export const getDeviceFingerprint = async () => {
  try {
    const fp = await fpPromise;
    const result = await fp.get();
    return result.visitorId;
  } catch (error) {
    console.error('Error getting fingerprint:', error);
    return null;
  }
};

// Add honeypot fields to forms
export const addHoneypotToForm = (formElement) => {
  if (!formElement) return;
  
  // Create honeypot fields (invisible to humans)
  const honeypotField = document.createElement('input');
  honeypotField.type = 'text';
  honeypotField.name = 'website'; // Bots often fill fields named "website"
  honeypotField.id = 'website-url';
  honeypotField.autocomplete = 'off';
  
  // Style to hide from humans but keep accessible to bots
  honeypotField.style.opacity = '0';
  honeypotField.style.position = 'absolute';
  honeypotField.style.height = '0';
  honeypotField.style.width = '0';
  honeypotField.style.zIndex = '-1';
  honeypotField.tabIndex = -1;
  honeypotField.ariaHidden = 'true';
  
  // Add to form
  formElement.appendChild(honeypotField);
};

// Check if browser might be headless
export const detectHeadlessBrowser = () => {
  const redFlags = [];
  
  // Check for navigator properties that headless browsers might lack
  if (navigator.webdriver) {
    redFlags.push('webdriver present');
  }
  
  if (!navigator.languages || navigator.languages.length === 0) {
    redFlags.push('no languages');
  }
  
  // Check for inconsistencies in user agent
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('headless')) {
    redFlags.push('headless in UA');
  }
  
  if (userAgent.includes('phantomjs') || 
      userAgent.includes('selenium') || 
      userAgent.includes('puppeteer')) {
    redFlags.push('automation tool in UA');
  }
  
  // Check for Chrome properties
  if (userAgent.includes('chrome') && !window.chrome) {
    redFlags.push('chrome in UA but no chrome object');
  }
  
  return {
    isHeadless: redFlags.length > 0,
    redFlags: redFlags
  };
};

// Initialize bot protection
export const initBotProtection = () => {
  trackUserBehavior();
  
  // Send behavioral data periodically
  setInterval(sendBehavioralData, 60000); // Every minute
  
  // Send data when user submits forms
  document.addEventListener('submit', () => {
    sendBehavioralData();
  });
  
  // Check for headless browser
  const headlessCheck = detectHeadlessBrowser();
  if (headlessCheck.isHeadless) {
    console.warn('Headless browser detected:', headlessCheck.redFlags);
    // You could trigger CAPTCHA here
  }
  
  // Add honeypot to all forms
  document.querySelectorAll('form').forEach(form => {
    addHoneypotToForm(form);
  });
}; 