const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET alle studenten
router.get('/', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM Student');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST nieuwe student toevoegen
router.post('/', async (req, res) => {
  const { voornaam, achternaam, email, linkedin_profiel, opleiding, afstudeerjaar, profiel_foto } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO Student (voornaam, achternaam, email, linkedin_profiel, opleiding, afstudeerjaar, profiel_foto) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [voornaam, achternaam, email, linkedin_profiel, opleiding, afstudeerjaar, profiel_foto]
    );
    res.status(201).json({ student_id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
