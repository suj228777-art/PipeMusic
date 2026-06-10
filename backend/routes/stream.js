const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

router.get('/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../public/uploads', filename);
  
  fs.stat(filePath, (err, stats) => {
    if (err) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const range = req.headers.range;
    if (!range) {
      // If no range header, send full file
      res.writeHead(200, {
        'Content-Type': 'audio/mpeg',
        'Content-Length': stats.size
      });
      fs.createReadStream(filePath).pipe(res);
    } else {
      // Partial content for seeking
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : stats.size - 1;
      const chunksize = (end - start) + 1;
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${stats.size}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': 'audio/mpeg',
      });
      
      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
    }
  });
});

module.exports = router;
