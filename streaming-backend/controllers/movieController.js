const Movie      = require("../models/Movie");
const cloudinary = require("../config/cloudinary");
const fs         = require("fs");

const uploadToCloudinary = async (filePath, options = {}) => {
  const result = await cloudinary.uploader.upload(filePath, options);
  try { fs.unlinkSync(filePath); } catch (_) {}
  return result;
};

exports.getAllMovies = async (req, res) => {
  try {
    const { q, genres, lang, yearFrom, yearTo, category } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (q)        filter.title = { $regex: q, $options: "i" };
    if (genres)   filter.genres = { $in: genres.split(",") };
    if (lang)     filter.language = { $regex: new RegExp(lang, "i") };
    if (yearFrom || yearTo) {
      filter.releaseYear = {};
      if (yearFrom) filter.releaseYear.$gte = Number(yearFrom);
      if (yearTo)   filter.releaseYear.$lte = Number(yearTo);
    }
    const movies = await Movie.find(filter);
    res.json(movies);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.json(movie);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.uploadMovie = async (req, res) => {
  try {
    if (!req.files?.poster || !req.files?.banner || !req.files?.video)
      return res.status(400).json({ error: "poster, banner and video are required" });

    const { title, description, releaseYear, duration, rating, ageRating, genres, language, category } = req.body;
    const [posterUp, bannerUp, videoUp] = await Promise.all([
      uploadToCloudinary(req.files.poster[0].path, { folder: "posters" }),
      uploadToCloudinary(req.files.banner[0].path, { folder: "banners" }),
      uploadToCloudinary(req.files.video[0].path,  { resource_type: "video", folder: "movies" }),
    ]);

    const movie = await Movie.create({
      title, description,
      poster: posterUp.secure_url, banner: bannerUp.secure_url,
      videoUrl: videoUp.secure_url, trailerUrl: videoUp.secure_url,
      releaseYear: Number(releaseYear), duration, rating: Number(rating),
      ageRating: ageRating || "U",
      genres: genres ? JSON.parse(genres) : [],
      language, category: category || "Movie", seasons: [],
    });
    res.status(201).json({ message: "Movie uploaded successfully", movie });
  } catch (err) { console.error(err); res.status(500).json({ error: "Upload failed: " + err.message }); }
};

exports.uploadSeries = async (req, res) => {
  try {
    if (!req.files?.poster || !req.files?.banner)
      return res.status(400).json({ error: "poster and banner are required" });

    const { title, description, releaseYear, rating, ageRating, genres, language, trailerUrl } = req.body;
    const [posterUp, bannerUp] = await Promise.all([
      uploadToCloudinary(req.files.poster[0].path, { folder: "posters" }),
      uploadToCloudinary(req.files.banner[0].path, { folder: "banners" }),
    ]);

    const series = await Movie.create({
      title, description,
      poster: posterUp.secure_url, banner: bannerUp.secure_url,
      trailerUrl: trailerUrl || "",
      releaseYear: Number(releaseYear), rating: Number(rating),
      ageRating: ageRating || "U",
      genres: genres ? JSON.parse(genres) : [],
      language, category: "Series", seasons: [],
    });
    res.status(201).json({ message: "Series created successfully", series });
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed: " + err.message }); }
};

exports.updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Not found" });

    const { title, description, releaseYear, duration, rating, ageRating, genres, language, trailerUrl } = req.body;
    if (title)       movie.title       = title;
    if (description !== undefined) movie.description = description;
    if (releaseYear) movie.releaseYear = Number(releaseYear);
    if (duration)    movie.duration    = duration;
    if (rating)      movie.rating      = Number(rating);
    if (language)    movie.language    = language;
    if (trailerUrl !== undefined) movie.trailerUrl = trailerUrl;
    if (ageRating)   movie.ageRating   = ageRating;
    if (genres)      movie.genres      = JSON.parse(genres);

    if (req.files?.poster) {
      const up = await uploadToCloudinary(req.files.poster[0].path, { folder: "posters" });
      movie.poster = up.secure_url;
    }
    if (req.files?.banner) {
      const up = await uploadToCloudinary(req.files.banner[0].path, { folder: "banners" });
      movie.banner = up.secure_url;
    }
    if (req.files?.video) {
      const up = await uploadToCloudinary(req.files.video[0].path, { resource_type: "video", folder: "movies" });
      movie.videoUrl = up.secure_url;
      movie.trailerUrl = up.secure_url;
    }

    await movie.save();
    res.json({ message: "Updated successfully", movie });
  } catch (err) { console.error(err); res.status(500).json({ error: "Update failed: " + err.message }); }
};

exports.deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    if (!movie) return res.status(404).json({ error: "Not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addSeason = async (req, res) => {
  try {
    const { seasonNumber, title } = req.body;
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Not found" });
    const exists = movie.seasons.find(s => s.seasonNumber === Number(seasonNumber));
    if (exists) return res.status(400).json({ error: "Season already exists" });
    movie.seasons.push({ seasonNumber: Number(seasonNumber), title: title || `Season ${seasonNumber}`, episodes: [] });
    await movie.save();
    res.json(movie);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteSeason = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Not found" });
    movie.seasons = movie.seasons.filter(s => s.seasonNumber !== Number(req.params.seasonNumber));
    await movie.save();
    res.json(movie);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addEpisode = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Not found" });
    const season = movie.seasons.find(s => s.seasonNumber === Number(req.params.seasonNumber));
    if (!season) return res.status(404).json({ error: "Season not found" });
    if (!req.files?.video) return res.status(400).json({ error: "Video file required" });

    const { episodeNumber, title, description, duration } = req.body;
    const videoUp = await uploadToCloudinary(req.files.video[0].path, { resource_type: "video", folder: "episodes" });
    let thumbnailUrl = "";
    if (req.files?.thumbnail) {
      const thumbUp = await uploadToCloudinary(req.files.thumbnail[0].path, { folder: "thumbnails" });
      thumbnailUrl = thumbUp.secure_url;
    }
    season.episodes.push({ episodeNumber: Number(episodeNumber), title, description, duration, videoUrl: videoUp.secure_url, thumbnail: thumbnailUrl });
    await movie.save();
    res.json(movie);
  } catch (err) { console.error(err); res.status(500).json({ error: err.message }); }
};

exports.deleteEpisode = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) return res.status(404).json({ error: "Not found" });
    const season = movie.seasons.find(s => s.seasonNumber === Number(req.params.seasonNumber));
    if (!season) return res.status(404).json({ error: "Season not found" });
    season.episodes = season.episodes.filter(e => e.episodeNumber !== Number(req.params.episodeNumber));
    await movie.save();
    res.json(movie);
  } catch (err) { res.status(500).json({ error: err.message }); }
};