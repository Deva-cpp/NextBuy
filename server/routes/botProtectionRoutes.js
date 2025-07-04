import express from "express";
import BotDetection from "../User/BotDetection.js";
import { deviceFingerprinting, analyzeIP, behavioralAnalysis, botDetection } from "../middleware/botProtection.js";

const router = express.Router();

// Endpoint to verify CAPTCHA - supports both GET and POST
router.post("/captcha-verification", [deviceFingerprinting, analyzeIP, botDetection], async (req, res) => {
  try {
    const { captchaToken, deviceFingerprint } = req.body;
    
    if (!captchaToken) {
      return res.status(400).json({ error: "CAPTCHA token is required" });
    }
    
    // In a real implementation, you would verify the captcha token with Google
    // For this example, we'll just check if it exists
    const isValidCaptcha = captchaToken.length > 0;
    
    if (!isValidCaptcha) {
      return res.status(400).json({ error: "Invalid CAPTCHA" });
    }
    
    // Update bot detection record if it exists
    if (req.deviceFingerprint) {
      try {
        await BotDetection.updateMany(
          { deviceFingerprint: req.deviceFingerprint },
          { 
            $set: { 
              captchaCompleted: true,
              botScore: 0.3 // Reduce bot score after CAPTCHA completion
            }
          }
        );
      } catch (dbError) {
        console.warn('Database operation failed, but continuing:', dbError.message);
      }
    }
    
    res.status(200).json({ success: true, message: "CAPTCHA verification successful" });
  } catch (error) {
    console.error(`❌ ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET endpoint for CAPTCHA verification (for testing purposes)
router.get("/captcha-verification", [deviceFingerprinting, analyzeIP, botDetection], async (req, res) => {
  try {
    // For testing purposes, return success for legitimate requests
    // Bot detection middleware will handle blocking before this point
    res.status(200).json({ 
      success: true, 
      message: "CAPTCHA verification endpoint available",
      endpoint: "/api/bot-protection/captcha-verification",
      methods: ["GET", "POST"]
    });
  } catch (error) {
    console.error(`❌ ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Endpoint to log client-side behavioral data
router.post("/log-behavior", [deviceFingerprinting, analyzeIP, behavioralAnalysis, botDetection], async (req, res) => {
  try {
    const { interactionData } = req.body;
    
    // Check if the behavior score indicates a bot
    if (req.behaviorScore && req.behaviorScore > 0.7) {
      return res.status(403).json({ 
        error: 'Suspicious behavior detected',
        message: 'Security verification required'
      });
    }
    
    // Create a new bot detection entry with the behavioral data
    const botDetection = new BotDetection({
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || '',
      deviceFingerprint: req.deviceFingerprint || 'unknown',
      requestPath: req.originalUrl || req.path || '/api/bot-protection/log-behavior',
      requestMethod: 'POST',
      behaviorScore: req.behaviorScore || calculateBehaviorScore(interactionData),
      ipScore: req.ipScore || 0.5,
      botScore: calculateBotScore(interactionData, req.ipScore || 0.5)
    });
    
    try {
      await botDetection.save();
    } catch (dbError) {
      console.warn('Database save failed, but continuing:', dbError.message);
    }
    
    // Don't expose too much information to the client
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(`❌ ${error}`);
    // Still return success to avoid exposing internal errors
    res.status(200).json({ success: true });
  }
});

// Honeypot endpoint - should never be accessed by legitimate users
router.post("/contact-form", async (req, res) => {
  try {
    // Log the bot attempt
    const botDetection = new BotDetection({
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || '',
      deviceFingerprint: 'honeypot',
      requestPath: '/api/bot-protection/contact-form',
      requestMethod: 'POST',
      botScore: 1.0, // Definitely a bot
      detectionReason: 'Accessed honeypot endpoint',
      blockedRequest: true
    });
    
    await botDetection.save();
    
    // Return success to the bot to avoid detection
    res.status(200).json({ success: true, message: "Form submitted successfully" });
  } catch (error) {
    console.error(`❌ ${error}`);
    res.status(200).json({ success: true });
  }
});

// Helper function to calculate behavior score
function calculateBehaviorScore(interactionData) {
  if (!interactionData) return 0.5;
  
  let score = 0.5; // Default neutral score
  
  // Check for suspicious patterns
  if (interactionData.mouseMovements && interactionData.mouseMovements.length > 0) {
    const movements = interactionData.mouseMovements;
    
    // Check if movements are too linear or too regular
    let tooRegular = true;
    let prevDiffX = null;
    let prevDiffY = null;
    
    for (let i = 1; i < movements.length; i++) {
      const diffX = movements[i].x - movements[i-1].x;
      const diffY = movements[i].y - movements[i-1].y;
      
      if (prevDiffX !== null && prevDiffY !== null) {
        // If the movement is not exactly the same as the previous one
        if (Math.abs(diffX - prevDiffX) > 1 || Math.abs(diffY - prevDiffY) > 1) {
          tooRegular = false;
        }
      }
      
      prevDiffX = diffX;
      prevDiffY = diffY;
    }
    
    if (tooRegular && movements.length > 5) {
      score += 0.3;
    }
  }
  
  // Check for suspiciously fast form filling
  if (interactionData.formFillTime && interactionData.formFillTime < 1000) {
    score += 0.2;
  }
  
  // Check for unnatural click patterns
  if (interactionData.clickSpeed && interactionData.clickSpeed < 50) {
    score += 0.2;
  }
  
  return Math.min(Math.max(score, 0), 1); // Clamp between 0 and 1
}

// Helper function to calculate overall bot score
function calculateBotScore(interactionData, ipScore) {
  const behaviorScore = calculateBehaviorScore(interactionData);
  
  // Weight the scores - behavior is most important
  return behaviorScore * 0.7 + ipScore * 0.3;
}

// Simple test endpoint to verify bot detection is working
router.post("/test", [deviceFingerprinting, analyzeIP], async (req, res) => {
  try {
    res.status(200).json({ 
      success: true, 
      message: "Bot detection test endpoint (POST)",
      botScore: req.botScore || 0.5,
      ipScore: req.ipScore || 0.5,
      isSuspectedBot: req.isSuspectedBot || false,
      detectionReason: req.detectionReason || 'none'
    });
  } catch (error) {
    console.error(`❌ ${error}`);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
