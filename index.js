const express = require("express");
const rateLimit = require("express-rate-limit");
const crypto = require("crypto");


const app = express();
app.use(express.json());

/* ---------------- In-memory DB ---------------- */
let notes = [];

/* ---------------- Rate Limiter ---------------- */
const createNoteLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,
  message: { error: "Rate limit exceeded. Max 5 notes per minute." }
});

/* ---------------- Helpers ---------------- */
const cleanString = (str) => str?.trim();

const isEmptyString = (str) => !str || str.trim().length === 0;

/* ---------------- Create Note ---------------- */
app.post("/notes", createNoteLimiter, (req, res) => {
  let { title, content } = req.body;

  title = cleanString(title);
  content = cleanString(content);

  if (isEmptyString(title) || isEmptyString(content)) {
    return res.status(400).json({
      error: "Title and content are required and cannot be empty"
    });
  }

  const now = new Date();

  const note = {
    id: crypto.randomUUID(),
    title,
    content,
    created_at: now,
    updated_at: now
  };

  notes.push(note);
  res.status(201).json(note);
});

/* ---------------- Get All Notes ---------------- */
app.get("/notes", (req, res) => {
  const sortedNotes = [...notes].sort(
    (a, b) => new Date(b.updated_at) - new Date(a.updated_at)
  );
  res.json(sortedNotes);
});

/* ---------------- Update Note ---------------- */
app.put("/notes/:id", (req, res) => {
  const note = notes.find(n => n.id === req.params.id);
  if (!note) {
    return res.status(404).json({ error: "Note not found" });
  }

  let { title, content } = req.body;

  title = title !== undefined ? cleanString(title) : undefined;
  content = content !== undefined ? cleanString(content) : undefined;

  if (title !== undefined && isEmptyString(title)) {
    return res.status(400).json({ error: "Title cannot be empty" });
  }
  if (content !== undefined && isEmptyString(content)) {
    return res.status(400).json({ error: "Content cannot be empty" });
  }

  const noChange =
    (title === undefined || title === note.title) &&
    (content === undefined || content === note.content);

  if (noChange) {
    return res.status(200).json({
      message: "No changes detected"
    });
  }

  if (title !== undefined) note.title = title;
  if (content !== undefined) note.content = content;

  note.updated_at = new Date();
  res.json(note);
});

/* ---------------- Search Notes ---------------- */
app.get("/notes/search", (req, res) => {
  let q = req.query.q;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: "Search query cannot be empty" });
  }

  q = q.trim().toLowerCase();

  const results = notes.filter(note =>
    note.title.toLowerCase().includes(q) ||
    note.content.toLowerCase().includes(q)
  );

  res.json(results);
});

/* ---------------- Start Server ---------------- */
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
