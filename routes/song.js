const express = require("express");
const Song = require("../models/songModel");
const redis = require("../config/redis")
const router = express.Router();

// CREATE
router.post("/", async (req, res) => {
  try {
    const song = new Song(req.body);
    await song.save();
    res.status(201).json(song);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// READ ALL
router.get("/", async (req, res) => {


  try {
    const { title } = req.query;

    // 🔹 Cache key based on title or all songs
    const cacheKey = title ? `songs:title:${title}` : "songs:all";

    // 🔹 1. Check Redis Cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      console.log("Cache HIT");
      return res.json(JSON.parse(cachedData));
    }

    console.log("Cache MISS");

    // 🔹 2. Create filter (for title search)
    let filter = {};
    if (title) {
      filter.title = { $regex: title, $options: "i" }; // case-insensitive search
    }

    // 🔹 3. Fetch from MongoDB
    const songs = await Song.find(filter);

    // 🔹 4. Store in Redis (TTL = 60 seconds)
    await redis.set(cacheKey, JSON.stringify(songs), "EX", 60);

    // 🔹 5. Send response
    res.json(songs);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// READ ONE
router.get("/:id", async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) return res.status(404).json({ message: "Not found" });
    res.json(song);
  } catch {
    res.status(400).json({ message: "Invalid ID" });
  }
});

// UPDATE
router.put("/:id", async (req, res) => {
  try {
    const song = await Song.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(song);
  } catch {
    res.status(400).json({ message: "Update failed" });
  }
});

// DELETE
router.delete("/:id", async (req, res) => {
  try {
    await Song.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted successfully" });
  } catch {
    res.status(400).json({ message: "Delete failed" });
  }
});

module.exports = router;