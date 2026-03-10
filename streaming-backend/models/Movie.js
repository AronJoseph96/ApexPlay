const mongoose = require("mongoose");

/* ── Episode ── */
const episodeSchema = new mongoose.Schema({
  episodeNumber: { type: Number, required: true },
  title:         { type: String, required: true },
  description:   { type: String, default: "" },
  duration:      { type: String, default: "" },      // e.g. "45m"
  videoUrl:      { type: String, default: "" },      // Cloudinary video URL
  thumbnail:     { type: String, default: "" },      // optional episode thumbnail
});

/* ── Season ── */
const seasonSchema = new mongoose.Schema({
  seasonNumber: { type: Number, required: true },    // 1, 2, 3 ...
  title:        { type: String, default: "" },       // e.g. "Season 1" or custom name
  episodes:     [episodeSchema],
});

/* ── Movie / Series ── */
const movieSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: "" },
  poster:      { type: String, default: "" },        // Cloudinary image URL
  banner:      { type: String, default: "" },        // Cloudinary image URL
  releaseYear: { type: Number },
  duration:    { type: String, default: "" },        // For movies: "2h 10m". For series: leave empty or "Ongoing"
  rating:      { type: Number, default: 0 },
  genres:      [String],
  language:    { type: String, default: "" },
  trailerUrl:  { type: String, default: "" },        // Cloudinary or YouTube embed URL
  videoUrl:    { type: String, default: "" },        // For movies only (direct video)
  category:    { type: String, enum: ["Movie", "Series"], required: true },

  // Series only — array of seasons, each with their own episodes
  seasons:     [seasonSchema],
});

module.exports = mongoose.model("Movie", movieSchema);