import express from "express";
import User from "../User/User.js";
import BotDetection from "../User/BotDetection.js";
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";
import { honeypotCheck, deviceFingerprinting, analyzeIP, botDetection } from "../middleware/botProtection.js";

const router = express.Router();
const saltRounds = 10;
// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${Date.now()}${ext}`);
  },
});
const upload = multer({ storage });

// Helper function to log bot detection
const logBotDetection = async (req, botScore = 0.5, blockedRequest = false, reason = '') => {
  try {
    const botDetection = new BotDetection({
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent'] || '',
      deviceFingerprint: req.deviceFingerprint || 'unknown',
      botScore,
      ipScore: req.ipScore || 0.5,
      behaviorScore: req.behaviorScore || 0.5,
      detectionReason: reason,
      requestPath: req.originalUrl,
      requestMethod: req.method,
      blockedRequest,
      captchaRequired: botScore > 0.7,
      captchaCompleted: false
    });
    
    await botDetection.save();
  } catch (error) {
    console.error('Error logging bot detection:', error);
  }
};

// SIGNUP
router.post("/signup", [honeypotCheck, deviceFingerprinting, analyzeIP, upload.single("profilePhoto")], async (req, res) => {
  try {
    const { fullName, userName, emailAddress, phoneNumber, passWord, captchaToken } = req.body;
    
    // Check if bot score is high and no CAPTCHA token provided
    if ((req.botScore > 0.7 || req.ipScore > 0.8) && !captchaToken) {
      await logBotDetection(req, req.botScore || 0.8, true, 'Signup attempt without CAPTCHA');
      return res.status(403).json({
        message: "Security verification required",
        requireCaptcha: true
      });
    }
    
    // Input validation
    if (!fullName || !userName || !emailAddress || !phoneNumber || !passWord) {
      return res.status(400).json({ message: "All fields are required" });
    }
    
    // Validate email format
    const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(emailAddress)) {
      return res.status(400).json({ message: "Invalid email format" });
    }
    
    // Validate username length
    if (userName.length < 3) {
      return res.status(400).json({ message: "Username must be at least 3 characters" });
    }
    
    // Validate password strength
    if (passWord.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }
    
    try {
      // Check for existing user by email or username (using Promise.all for efficiency)
      const [existingEmail, existingUsername] = await Promise.all([
        User.findOne({ emailAddress }),
        User.findOne({ userName })
      ]);
      
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      const hashedPassword = await bcrypt.hash(passWord, saltRounds);
      const newUser = new User({
        fullName,
        userName,
        emailAddress,
        phoneNumber,
        passWord: hashedPassword,
        profilePhoto: req.file ? req.file.path : "",
        // New fields with default values are handled by the schema
      });
      
      const savedUser = await newUser.save();
      
      // Log successful signup
      await logBotDetection(req, 0.1, false, 'Successful signup');
      
      res.status(201).json({
        message: "✅ User registered successfully",
        user: {
          _id: savedUser._id,
          userName: savedUser.userName,
          fullName: savedUser.fullName,
          emailAddress: savedUser.emailAddress,
          phoneNumber: savedUser.phoneNumber,
          profilePhoto: savedUser.profilePhoto,
          accountStatus: savedUser.accountStatus,
          emailVerified: savedUser.emailVerified,
          createdAt: savedUser.createdAt
        },
      });
    } catch (dbError) {
      // Handle database validation errors
      if (dbError.name === 'ValidationError') {
        const validationErrors = Object.values(dbError.errors).map(err => err.message);
        return res.status(400).json({ message: "Validation error", errors: validationErrors });
      }
      // Handle duplicate key errors
      if (dbError.code === 11000) {
        return res.status(400).json({ message: "User with this email or username already exists" });
      }
      throw dbError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error(`❌ ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

// LOGIN
router.post("/login", [honeypotCheck, deviceFingerprinting, analyzeIP, botDetection], async (req, res) => {
  try {
    const { emailAddress, userName, passWord, captchaToken } = req.body;
    
    // Input validation
    if (!emailAddress || !userName || !passWord) {
      return res.status(400).json({ message: "Email, username and password are required" });
    }
    
    // Check for suspicious activity
    const recentFailedAttempts = await BotDetection.countDocuments({
      ipAddress: req.ip || req.connection.remoteAddress,
      blockedRequest: true,
      timestamp: { $gt: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
    });
    
    // If there have been multiple failed attempts or the bot score is high, require CAPTCHA
    if ((recentFailedAttempts > 3 || req.botScore > 0.7 || req.ipScore > 0.8) && !captchaToken) {
      await logBotDetection(req, Math.max(req.botScore || 0.5, 0.8), true, 'Login attempt after multiple failures');
      return res.status(403).json({
        message: "Security verification required",
        requireCaptcha: true
      });
    }
    
    const user = await User.findOne({ emailAddress });
    
    // Generic error message for security (don't reveal which credential was wrong)
    const genericErrorMessage = "Invalid credentials";
    
    if (!user) {
      await logBotDetection(req, 0.6, true, 'Login attempt with invalid email');
      return res.status(401).json({ message: genericErrorMessage });
    }
    
    // Check if account is suspended or inactive
    if (user.accountStatus !== 'active') {
      await logBotDetection(req, 0.7, true, `Login attempt to ${user.accountStatus} account`);
      return res.status(403).json({ message: "Account is not active. Please contact support." });
    }
    
    if (user.userName !== userName) {
      await logBotDetection(req, 0.7, true, 'Login attempt with valid email but invalid username');
      return res.status(401).json({ message: genericErrorMessage });
    }
    
    const isPasswordMatch = await bcrypt.compare(passWord, user.passWord);
    if (!isPasswordMatch) {
      await logBotDetection(req, 0.8, true, 'Login attempt with valid email and username but invalid password');
      return res.status(401).json({ message: genericErrorMessage });
    }
    
    // Update last login timestamp
    user.lastLogin = new Date();
    await user.save();
    
    // Log successful login
    await logBotDetection(req, 0.1, false, 'Successful login');
    
    res.status(200).json({
      message: "✅ Login Successful",
      user: {
        _id: user._id,
        userName: user.userName,
        fullName: user.fullName,
        emailAddress: user.emailAddress,
        phoneNumber: user.phoneNumber,
        profilePhoto: user.profilePhoto,
        role: user.role,
        accountStatus: user.accountStatus,
        emailVerified: user.emailVerified,
        lastLogin: user.lastLogin
      },
    });
  } catch (error) {
    console.error(`❌ ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET USER BY USERNAME
router.get("/user/:userName", [deviceFingerprinting, analyzeIP], async (req, res) => {
  try {
    const { userName } = req.params;
    // Exclude password and other sensitive fields
    const user = await User.findOne({ userName: userName })
      .select("-passWord -__v");

    if (!user) {
      await logBotDetection(req, 0.6, false, 'User profile lookup with invalid username');
      return res.status(404).json({ message: "❌ User not found" });
    }
    
    // Check if account is active
    if (user.accountStatus !== 'active') {
      await logBotDetection(req, 0.5, false, `Access attempt to ${user.accountStatus} account profile`);
      return res.status(403).json({ message: "This account is not active" });
    }
    
    await logBotDetection(req, 0.2, false, 'User profile lookup');
    res.status(200).json({
      _id: user._id,
      userName: user.userName,
      fullName: user.fullName,
      emailAddress: user.emailAddress,
      phoneNumber: user.phoneNumber,
      profilePhoto: user.profilePhoto,
      accountStatus: user.accountStatus,
      emailVerified: user.emailVerified,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error(`❌ ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

// UPDATE USER
router.put("/user/id/:id", [deviceFingerprinting, analyzeIP, upload.single("profilePhoto")], async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  try {
    // Check for suspicious activity
    if (req.botScore > 0.7 || req.ipScore > 0.8) {
      await logBotDetection(req, req.botScore || 0.8, true, 'Profile update attempt from suspicious source');
      return res.status(403).json({
        message: "Security verification required",
        requireCaptcha: true
      });
    }
    
    const existingUser = await User.findById(id);
    if (!existingUser) {
      await logBotDetection(req, 0.7, true, 'Profile update attempt for non-existent user');
      return res.status(404).json({ message: "User not found" });
    }
    
    // Validate inputs if provided
    if (updates.fullName && updates.fullName.trim() === '') {
      return res.status(400).json({ message: "Full name cannot be empty" });
    }
    
    if (updates.userName) {
      if (updates.userName.length < 3) {
        return res.status(400).json({ message: "Username must be at least 3 characters" });
      }
      
      // Check if the new username is already taken by another user
      if (updates.userName !== existingUser.userName) {
        const usernameExists = await User.findOne({
          userName: updates.userName,
          _id: { $ne: id } // Exclude current user
        });
        
        if (usernameExists) {
          return res.status(400).json({ message: "Username is already taken" });
        }
      }
    }
    
    if (updates.emailAddress) {
      const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(updates.emailAddress)) {
        return res.status(400).json({ message: "Invalid email format" });
      }
      
      // Check if the new email is already registered to another user
      if (updates.emailAddress !== existingUser.emailAddress) {
        const emailExists = await User.findOne({
          emailAddress: updates.emailAddress,
          _id: { $ne: id } // Exclude current user
        });
        
        if (emailExists) {
          return res.status(400).json({ message: "Email is already registered" });
        }
      }
    }
    
    // Update fields
    if (updates.fullName) existingUser.fullName = updates.fullName;
    if (updates.userName) existingUser.userName = updates.userName;
    if (updates.emailAddress) existingUser.emailAddress = updates.emailAddress;
    if (updates.phoneNumber) existingUser.phoneNumber = updates.phoneNumber;
    if (req.file) existingUser.profilePhoto = req.file.path;
    
    // Only allow admins to update these fields
    // In a real app, you'd have role checking middleware
    if (updates.role && existingUser.role === 'admin') {
      existingUser.role = updates.role;
    }
    
    if (updates.accountStatus && existingUser.role === 'admin') {
      existingUser.accountStatus = updates.accountStatus;
    }
    
    try {
      const updatedUser = await existingUser.save();
      
      await logBotDetection(req, 0.2, false, 'Successful profile update');
      
      res.status(200).json({
        message: "Profile updated successfully",
        user: {
          _id: updatedUser._id,
          userName: updatedUser.userName,
          fullName: updatedUser.fullName,
          emailAddress: updatedUser.emailAddress,
          phoneNumber: updatedUser.phoneNumber,
          profilePhoto: updatedUser.profilePhoto,
          role: updatedUser.role,
          accountStatus: updatedUser.accountStatus,
          emailVerified: updatedUser.emailVerified,
          lastLogin: updatedUser.lastLogin,
          updatedAt: updatedUser.updatedAt
        }
      });
    } catch (dbError) {
      // Handle validation errors from mongoose
      if (dbError.name === 'ValidationError') {
        const validationErrors = Object.values(dbError.errors).map(err => err.message);
        return res.status(400).json({ message: "Validation error", errors: validationErrors });
      }
      
      // Handle duplicate key errors
      if (dbError.code === 11000) {
        return res.status(400).json({ message: "This email or username is already in use" });
      }
      
      throw dbError; // Re-throw for the outer catch block
    }
  } catch (error) {
    console.error("❌ Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// GET USER BY ID
router.get("/user/id/:id", [deviceFingerprinting, analyzeIP], async (req, res) => {
  try {
    const { id } = req.params;
    // Exclude password and other sensitive fields
    const user = await User.findById(id).select("-passWord -__v");

    if (!user) {
      await logBotDetection(req, 0.6, false, 'User lookup with invalid ID');
      return res.status(404).json({ message: "❌ User not found" });
    }
    
    // Check if account is active
    if (user.accountStatus !== 'active') {
      await logBotDetection(req, 0.5, false, `Access attempt to ${user.accountStatus} account profile by ID`);
      return res.status(403).json({ message: "This account is not active" });
    }
    
    await logBotDetection(req, 0.2, false, 'User lookup by ID');
    res.status(200).json({
      _id: user._id,
      userName: user.userName,
      fullName: user.fullName,
      emailAddress: user.emailAddress,
      phoneNumber: user.phoneNumber,
      profilePhoto: user.profilePhoto,
      accountStatus: user.accountStatus,
      emailVerified: user.emailVerified,
      role: user.role,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error(`❌ ${error}`);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
