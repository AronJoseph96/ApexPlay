const express = require("express");
const router  = express.Router();
const {
  getUsers, makeEmployee,
  getCollections, createCollection,
  addToCollection, removeFromCollection, deleteCollection,
} = require("../controllers/userController");

router.get("/", getUsers);
router.put("/makeEmployee/:id", makeEmployee);

router.get   ("/:id/collections",                               getCollections);
router.post  ("/:id/collections",                               createCollection);
router.post  ("/:id/collections/:collectionId/movies",          addToCollection);
router.delete("/:id/collections/:collectionId/movies/:movieId", removeFromCollection);
router.delete("/:id/collections/:collectionId",                 deleteCollection);

module.exports = router;