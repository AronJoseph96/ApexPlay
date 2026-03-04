const express = require("express");
const router = express.Router();
const {
  addMovie,
  getMovieById,
  getAllMovies
} = require("../controllers/movieController");

router.post("/add", addMovie);
router.get("/", getAllMovies);           // ⭐ NEW
router.get("/:id", getMovieById);

module.exports = router;

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/upload",
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "banner", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  uploadMovie
);