// index.js
const express = require('express');
const app = express();

// Import route files
const userRoutes = require('C:/Users/guita/OneDrive/Documentos/GitHub/omegachat-api/ws_routes/user.ts');
const chatRoutes = require('./ws_routes/chat/ChatRouter');
// You can import other route files similarly

// Use the route files in your app
app.use('/api', userRoutes);
app.use('/api', chatRoutes);
// Use other routes if you have more files

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
