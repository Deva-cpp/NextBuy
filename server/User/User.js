import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Full name is required"],
    trim: true
  },
  userName: {
    type: String,
    required: [true, "Username is required"],
    unique: true,
    trim: true,
    minlength: [3, "Username must be at least 3 characters"]
  },
  emailAddress: {
    type: String,
    required: [true, "Email address is required"],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email address"]
  },
  phoneNumber: {
    type: String, // Changed from Number to String to handle international formats
    required: [true, "Phone number is required"],
    trim: true
  },
  passWord: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"]
  },
  profilePhoto: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  accountStatus: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active"
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps automatically
});

// No need to redefine indexes as 'unique: true' in the schema fields already creates them
// Just add any additional indexes that aren't already defined by field properties
userSchema.index({ lastLogin: -1 }); // Index for sorting users by last login date

const User = mongoose.model("User", userSchema);
export default User;
