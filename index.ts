// index.js
const express = require('express');
const userRoutes = require('./ws_routes/user.ts');
const chatRoutes = require('./ws_routes/chat.ts');

const app = express();

// Use the route files in your app
app.use('/api', userRoutes);
app.use('/api', chatRoutes);
// Use other routes if you have more files

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
