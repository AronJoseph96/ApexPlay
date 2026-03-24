const User   = require("../models/User");
const bcrypt = require("bcryptjs");

const AGE_RATING_ORDER = ["U", "U/A 7+", "U/A 13+", "U/A 16+", "A"];
const ratingIndex = r => AGE_RATING_ORDER.indexOf(r);

// ─── ADMIN: USERS ─────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try { res.json(await User.find()); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try { await User.findByIdAndDelete(req.params.id); res.json({ message: "Deleted" }); }
  catch (err) { res.status(500).json({ error: err.message }); }
};

exports.makeEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.role = "EMPLOYEE"; user.language = req.body.language;
    await user.save(); res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.demoteEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.role = "USER"; user.language = null;
    await user.save(); res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateEmployeeLanguage = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.language = req.body.language;
    await user.save(); res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── ACCOUNT PROFILE (name, avatar, password) ─────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatarUrl, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (name?.trim())  user.name   = name.trim();
    if (avatarUrl)     user.avatar = avatarUrl;
    if (newPassword) {
      if (!currentPassword) return res.status(400).json({ error: "Current password required" });
      const ok = await bcrypt.compare(currentPassword, user.password);
      if (!ok) return res.status(400).json({ error: "Current password is incorrect" });
      user.password = await bcrypt.hash(newPassword, 10);
    }
    await user.save();
    const { password, ...safe } = user.toObject();
    res.json(safe);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── SUB-PROFILES ─────────────────────────────────────────
exports.getProfiles = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user.profiles);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createProfile = async (req, res) => {
  try {
    const { name, avatar, pin, editPin, ageRating, isKids, screenTimeLimit } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "Not found" });
    if (user.profiles.length >= 5)
      return res.status(400).json({ error: "Maximum 5 profiles allowed" });
    const hashedPin    = pin     ? await bcrypt.hash(pin, 10)     : null;
    const hashedEditPin = editPin ? await bcrypt.hash(editPin, 10) : null;
    user.profiles.push({
      name, avatar: avatar || "/avatars/1.jpg",
      pin: hashedPin, editPin: hashedEditPin, ageRating: ageRating || "A",
      isKids: !!isKids,
      screenTimeLimit: isKids ? (screenTimeLimit || 60) : null,
      collections: []
    });
    await user.save();
    res.json(user.profiles);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateProfileById = async (req, res) => {
  try {
    const { name, avatar, pin, editPin, ageRating, isKids, screenTimeLimit } = req.body;
    const user = await User.findById(req.params.id);
    const profile = user.profiles.id(req.params.profileId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    if (name)   profile.name      = name;
    if (avatar) profile.avatar    = avatar;
    if (ageRating) profile.ageRating = ageRating;
    if (typeof isKids === "boolean") profile.isKids = isKids;
    if (screenTimeLimit !== undefined) profile.screenTimeLimit = screenTimeLimit;
    if (pin !== undefined) profile.pin = pin ? await bcrypt.hash(pin, 10) : null;
    if (editPin !== undefined) profile.editPin = editPin ? await bcrypt.hash(editPin, 10) : null;
    await user.save();
    res.json(user.profiles);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.profiles = user.profiles.filter(p => p._id.toString() !== req.params.profileId);
    await user.save();
    res.json(user.profiles);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── SCREEN TIME ──────────────────────────────────────────
exports.updateScreenTime = async (req, res) => {
  try {
    const { minutesWatched } = req.body;
    const today = new Date().toISOString().slice(0, 10);
    const user  = await User.findById(req.params.id);
    const profile = user.profiles.id(req.params.profileId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    // Reset daily counter if new day
    if (profile.screenTimeDate !== today) {
      profile.screenTimeUsed = 0;
      profile.screenTimeDate = today;
    }
    profile.screenTimeUsed += minutesWatched || 0;
    await user.save();
    const limitReached = profile.screenTimeLimit !== null &&
                         profile.screenTimeUsed >= profile.screenTimeLimit;
    res.json({
      screenTimeUsed:  profile.screenTimeUsed,
      screenTimeLimit: profile.screenTimeLimit,
      limitReached
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── COLLECTIONS (per profile) ────────────────────────────
exports.getCollections = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate("profiles.collections.movies");
    const profile = user.profiles.id(req.params.profileId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    res.json(profile.collections);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createCollection = async (req, res) => {
  try {
    const { name } = req.body;
    const user = await User.findById(req.params.id);
    const profile = user.profiles.id(req.params.profileId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });
    profile.collections.push({ name: name.trim(), movies: [] });
    await user.save();
    res.json(profile.collections);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addToCollection = async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.params.id);
    const profile = user.profiles.id(req.params.profileId);
    const col = profile.collections.id(req.params.collectionId);
    if (col.movies.some(m => m.toString() === movieId))
      return res.status(400).json({ error: "Already in collection" });
    col.movies.push(movieId);
    await user.save();
    res.json(profile.collections);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.removeFromCollection = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const profile = user.profiles.id(req.params.profileId);
    const col = profile.collections.id(req.params.collectionId);
    col.movies = col.movies.filter(m => m.toString() !== req.params.movieId);
    await user.save();
    res.json(profile.collections);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteCollection = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const profile = user.profiles.id(req.params.profileId);
    profile.collections = profile.collections.filter(
      c => c._id.toString() !== req.params.collectionId
    );
    await user.save();
    res.json(profile.collections);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── RECOMMENDATIONS ──────────────────────────────────────────────────────
// GET /users/:id/profiles/:profileId/recommendations
// Content-based: looks at continue watching + watchlist genres,
// ranks movies by genre overlap and rating, excludes already-watched content.
exports.getRecommendations = async (req, res) => {
  try {
    const Movie = require("../models/Movie");
    const user  = await User.findById(req.params.id)
      .populate("profiles.collections.movies");
    if (!user) return res.status(404).json({ error: "User not found" });

    const profile = user.profiles.id(req.params.profileId);
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    // ── 1. Collect all movie IDs the profile has interacted with ──
    const watchedIds = new Set();

    // From continue watching (stored in localStorage on client — passed as query)
    const continueIds = req.query.watched ? req.query.watched.split(",") : [];
    continueIds.forEach(id => watchedIds.add(id));

    // From all watchlist collections
    const collectionMovies = profile.collections.flatMap(col => col.movies || []);
    collectionMovies.forEach(m => watchedIds.add((m._id || m).toString()));

    // ── 2. Count genre frequency from interacted content ──
    let interactedMovies = [];
    if (collectionMovies.length > 0) {
      interactedMovies = await Movie.find({
        _id: { $in: collectionMovies.map(m => m._id || m) }
      });
    }

    // Also fetch continue watching movies if IDs provided
    if (continueIds.length > 0) {
      const cwMovies = await Movie.find({ _id: { $in: continueIds } });
      interactedMovies.push(...cwMovies);
    }

    // Build genre frequency map
    const genreCount = {};
    interactedMovies.forEach(m => {
      (m.genres || []).forEach(g => {
        genreCount[g] = (genreCount[g] || 0) + 1;
      });
    });

    const topGenres = Object.entries(genreCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([genre]) => genre);

    // ── 3. Age rating filter ──
    const AGE_ORDER = ["U", "U/A 7+", "U/A 13+", "U/A 16+", "R", "A"];
    const maxIdx    = AGE_ORDER.indexOf(profile.ageRating || "A");

    // ── 4. Cold start — no history → return top rated ──
    if (topGenres.length === 0) {
      const fallback = await Movie.find({})
        .sort({ rating: -1 })
        .limit(20);
      const filtered = fallback.filter(m => {
        const idx = AGE_ORDER.indexOf(m.ageRating || "U");
        return idx <= maxIdx;
      });
      return res.json({ genres: [], movies: filtered.slice(0, 12) });
    }

    // ── 5. Fetch all movies matching top genres, exclude watched ──
    const candidates = await Movie.find({
      genres: { $in: topGenres },
      _id:    { $nin: [...watchedIds] }
    });

    // ── 6. Score each candidate by genre overlap + rating ──
    const scored = candidates
      .filter(m => {
        const idx = AGE_ORDER.indexOf(m.ageRating || "U");
        return idx <= maxIdx;
      })
      .map(m => {
        const overlap = (m.genres || []).filter(g => topGenres.includes(g)).length;
        const score   = overlap * 10 + (m.rating || 0);
        return { movie: m, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 16)
      .map(x => x.movie);

    res.json({ genres: topGenres, movies: scored });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};