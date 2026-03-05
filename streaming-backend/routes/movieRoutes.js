const express = require("express");
const router = express.Router();
const multer = require("multer");

const movieController = require("../controllers/movieController");

const upload = multer({ dest: "uploads/" });

/*MOVIES */

router.post("/add", movieController.addMovie);
router.get("/", movieController.getAllMovies);
router.get("/:id", movieController.getMovieById);
/*UPLOAD MOVIE*/

router.post(
  "/upload",
  upload.fields([
    { name: "poster", maxCount: 1 },
    { name: "banner", maxCount: 1 },
    { name: "video", maxCount: 1 }
  ]),
  movieController.uploadMovie
);

module.exports = router;