const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }]
});

const watchHistorySchema = new mongoose.Schema({
  movie:         { type: mongoose.Schema.Types.ObjectId, ref: "Movie", required: true },
  progress:      { type: Number, default: 0 },   // seconds watched
  duration:      { type: Number, default: 0 },   // total seconds
  seasonNumber:  { type: Number, default: null },
  episodeNumber: { type: Number, default: null },
  watchedAt:     { type: Date,   default: Date.now }
});

const userSchema = new mongoose.Schema({
  name:         String,
  email:        { type: String, unique: true },
  password:     String,
  avatar:       { type: String, default: null },
  role: {
    type: String,
    enum: ["USER", "EMPLOYEE", "ADMIN", "user", "employee", "admin"],
    default: "USER"
  },
  language:     { type: String, default: null },

  // Password reset via OTP
  resetOTP:       { type: String, default: null },
  resetOTPExpiry: { type: Date,   default: null },
  collections:  [collectionSchema],
  watchHistory: [watchHistorySchema]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);