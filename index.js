import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import UserRouter from './ws_routes/user.js';
import ChatRouter from './ws_routes/chat.js';
import ChatGroupRouter from './ws_routes/group.js'
import 'dotenv/config'

const app = express();

app.use(cors());

// Middleware to parse incoming JSON payloads
app.use(bodyParser.json());

// Use the route
app.use('/', UserRouter);
app.use('/', ChatRouter);
app.use('/', ChatGroupRouter);

const PORT = 8081;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});