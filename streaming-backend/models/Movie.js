const mongoose = require("mongoose");

const episodeSchema = new mongoose.Schema({
  episodeNumber: { type: Number, required: true },
  title:         { type: String, required: true },
  description:   { type: String, default: "" },
  duration:      { type: String, default: "" },
  videoUrl:      { type: String, default: "" },
  thumbnail:     { type: String, default: "" },
});

const seasonSchema = new mongoose.Schema({
  seasonNumber: { type: Number, required: true },
  title:        { type: String, default: "" },
  episodes:     [episodeSchema],
});

const movieSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String, default: "" },
  poster:      { type: String, default: "" },
  banner:      { type: String, default: "" },
  releaseYear: { type: Number },
  duration:    { type: String, default: "" },
  rating:      { type: Number, default: 0 },
  ageRating:   { type: String, default: "U",
                 enum: ["U", "U/A 7+", "U/A 13+", "U/A 16+", "A", "R"] },
  genres:      [String],
  language:    { type: String, default: "" },
  trailerUrl:  { type: String, default: "" },
  videoUrl:    { type: String, default: "" },
  category:    { type: String, enum: ["Movie", "Series"], required: true },
  seasons:     [seasonSchema],
});

module.exports = mongoose.model("Movie", movieSchema);