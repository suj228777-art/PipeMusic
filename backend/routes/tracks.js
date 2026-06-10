const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const uploadsDir = path.join(__dirname, '../public/uploads');

// Get list of all tracks
router.get('/', (req, res) => {
  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to read tracks' });
    }
    
    const tracks = files
      .filter(file => file.match(/\.(mp3|wav|ogg|m4a)$/i))
      .map((file, index) => ({
        id: index,
        title: path.parse(file).name,
        url: `http://localhost:3001/uploads/${file}`,
        duration: '3:45' // You can add real duration using music-metadata library
      }));
    
    res.json(tracks);
  });
});

module.exports = router;
