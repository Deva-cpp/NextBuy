import mongoose from "mongoose";

const botDetectionSchema = new mongoose.Schema({
  ipAddress: {
    type: String,
    required: true,
    index: true
  },
  userAgent: {
    type: String,
    required: true
  },
  deviceFingerprint: {
    type: String,
    required: true,
    index: true
  },
  botScore: {
    type: Number,
    required: true,
    default: 0.5
  },
  behaviorScore: {
    type: Number,
    default: 0.5
  },
  ipScore: {
    type: Number,
    default: 0.5
  },
  detectionReason: {
    type: String,
    default: ''
  },
  requestPath: {
    type: String,
    required: true
  },
  requestMethod: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  blockedRequest: {
    type: Boolean,
    default: false
  },
  captchaRequired: {
    type: Boolean,
    default: false
  },
  captchaCompleted: {
    type: Boolean,
    default: false
  }
});

// Index for querying recent detections from the same IP
botDetectionSchema.index({ ipAddress: 1, timestamp: -1 });

// Index for querying by device fingerprint
botDetectionSchema.index({ deviceFingerprint: 1, timestamp: -1 });

const BotDetection = mongoose.model("BotDetection", botDetectionSchema);
export default BotDetection; 