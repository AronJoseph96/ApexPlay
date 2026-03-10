/**
 * Run this ONCE to fix any documents in your DB
 * that are missing the category field.
 *
 * Usage: node fixCategories.js
 * Run from your streaming-backend folder.
 */

const mongoose = require("mongoose");
const Movie    = require("./models/Movie");

async function fix() {
  await mongoose.connect("mongodb://127.0.0.1:27017/streamingAppDB");
  console.log("Connected to MongoDB");

  // Any document with no category or empty category → set to "Movie"
  const result = await Movie.updateMany(
    { $or: [{ category: { $exists: false } }, { category: "" }, { category: null }] },
    { $set: { category: "Movie" } }
  );

  console.log(`Fixed ${result.modifiedCount} document(s) — set category to "Movie"`);
  await mongoose.disconnect();
  console.log("Done.");
}

fix().catch(err => { console.error(err); process.exit(1); });