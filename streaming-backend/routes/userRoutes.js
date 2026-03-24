const express = require("express");
const router  = express.Router();
const {
  getUsers, deleteUser, makeEmployee, demoteEmployee, updateEmployeeLanguage,
  updateProfile, updateProfile: updateAccountProfile,
  getProfiles, createProfile, updateProfileById, deleteProfile,
  getCollections, createCollection,
  addToCollection, removeFromCollection, deleteCollection,
  updateScreenTime,
  getRecommendations,
} = require("../controllers/userController");

router.get   ("/",                 getUsers);
router.delete("/:id",              deleteUser);
router.put   ("/makeEmployee/:id", makeEmployee);
router.put   ("/demote/:id",       demoteEmployee);
router.put   ("/updateLang/:id",   updateEmployeeLanguage);

// Account profile (name, avatar, password)
router.put("/:id/profile", updateAccountProfile);

// Sub-profiles (Netflix-style)
router.get   ("/:id/profiles",            getProfiles);
router.post  ("/:id/profiles",            createProfile);
router.put   ("/:id/profiles/:profileId", updateProfileById);
router.delete("/:id/profiles/:profileId", deleteProfile);

// Screen time
router.put("/:id/profiles/:profileId/screentime", updateScreenTime);

// Collections (per profile)
router.get   ("/:id/profiles/:profileId/collections",                               getCollections);
router.post  ("/:id/profiles/:profileId/collections",                               createCollection);
router.post  ("/:id/profiles/:profileId/collections/:collectionId/movies",          addToCollection);
router.delete("/:id/profiles/:profileId/collections/:collectionId/movies/:movieId", removeFromCollection);
router.delete("/:id/profiles/:profileId/collections/:collectionId",                 deleteCollection);

router.get("/:id/profiles/:profileId/recommendations", getRecommendations);

module.exports = router;