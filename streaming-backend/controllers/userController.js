const User   = require("../models/User");
const bcrypt = require("bcryptjs");

// ─── USERS ────────────────────────────────────────────────
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.makeEmployee = async (req, res) => {
  try {
    const { language } = req.body;
    const user = await User.findById(req.params.id);
    user.role = "EMPLOYEE";
    user.language = language;
    await user.save();
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.demoteEmployee = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    user.role = "USER";
    user.language = null;
    await user.save();
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.updateEmployeeLanguage = async (req, res) => {
  try {
    const { language } = req.body;
    const user = await User.findById(req.params.id);
    user.language = language;
    await user.save();
    res.json(user);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── PROFILE UPDATE ───────────────────────────────────────
// PUT /users/:id/profile
// body: { name?, avatarUrl?, currentPassword?, newPassword? }
exports.updateProfile = async (req, res) => {
  try {
    const { name, avatarUrl, currentPassword, newPassword } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (name && name.trim())  user.name   = name.trim();
    if (avatarUrl)            user.avatar = avatarUrl;

    if (newPassword) {
      if (!currentPassword)
        return res.status(400).json({ error: "Current password required" });
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch)
        return res.status(400).json({ error: "Current password is incorrect" });
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();
    const { password, ...safe } = user.toObject();
    res.json(safe);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ─── COLLECTIONS ──────────────────────────────────────────
exports.getCollections = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate("collections.movies");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user.collections);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.createCollection = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: "Name required" });
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.collections.push({ name: name.trim(), movies: [] });
    await user.save();
    const updated = await User.findById(req.params.id).populate("collections.movies");
    res.json(updated.collections);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.addToCollection = async (req, res) => {
  try {
    const { movieId } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const col = user.collections.id(req.params.collectionId);
    if (!col) return res.status(404).json({ error: "Collection not found" });
    if (col.movies.some(m => m.toString() === movieId))
      return res.status(400).json({ error: "Already in collection" });
    col.movies.push(movieId);
    await user.save();
    const updated = await User.findById(req.params.id).populate("collections.movies");
    res.json(updated.collections);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.removeFromCollection = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    const col = user.collections.id(req.params.collectionId);
    if (!col) return res.status(404).json({ error: "Collection not found" });
    col.movies = col.movies.filter(m => m.toString() !== req.params.movieId);
    await user.save();
    const updated = await User.findById(req.params.id).populate("collections.movies");
    res.json(updated.collections);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

exports.deleteCollection = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    user.collections = user.collections.filter(
      c => c._id.toString() !== req.params.collectionId
    );
    await user.save();
    const updated = await User.findById(req.params.id).populate("collections.movies");
    res.json(updated.collections);
  } catch (err) { res.status(500).json({ error: err.message }); }
};