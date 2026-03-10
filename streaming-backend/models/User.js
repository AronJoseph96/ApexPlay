const mongoose = require("mongoose");

const collectionSchema = new mongoose.Schema({
  name:   { type: String, required: true },
  movies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Movie" }]
});

const userSchema = new mongoose.Schema({
  name:  String,
  email: { type: String, unique: true },
  password: String,

  role: {
    type: String,
    enum: ["USER", "EMPLOYEE", "ADMIN", "user", "employee", "admin"],
    default: "USER"
  },

  language: { type: String, default: null },

  // Watchlist + custom collections
  collections: [collectionSchema]
});

module.exports = mongoose.model("User", userSchema);