const express = require('express');
const cors = require('cors');
const studentsRouter = require('./routes/students'); // Vergeet niet deze map en bestand aan te maken
const app = express();

// Middleware
app.use(cors()); // Sta cross-origin requests toe (handig voor frontend-backend communicatie)
app.use(express.json()); // JSON body parser

// Root route (optioneel)
app.get('/', (req, res) => {
  res.send('Welkom bij de API van jouw project!');
});

// Gebruik de studenten routes onder /api/students
app.use('/api/students', studentsRouter);

// Start server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server gestart op http://localhost:${port}`);
});
