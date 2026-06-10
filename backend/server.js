const express = require('express');
const cors = require('cors');
const path = require('path');
const tracksRouter = require('./routes/tracks');
const streamRouter = require('./routes/stream');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Routes
app.use('/api/tracks', tracksRouter);
app.use('/api/stream', streamRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
