require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Route for /home (you can also use '/' instead if you want it to be the default)
app.get('/home', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'home.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
