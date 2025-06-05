const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',      // Als je lokaal werkt met XAMPP
  user: 'root',           // Je MySQL gebruikersnaam (standaard 'root' bij XAMPP)
  password: '',           // Je MySQL wachtwoord (standaard leeg bij XAMPP)
  database: 'project_ehb',// Naam van je database
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;
