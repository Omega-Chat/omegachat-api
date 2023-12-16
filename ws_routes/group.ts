import express from 'express';
import { createServer } from 'http';
import { Server as WebSocketServer } from 'ws';
import { MongoDBConnection } from '../services/db_connection/mdb_connection';
import { MongoDBChatGroupService } from '../services/db_connection/group';

const ChatGroupRouter = express.Router();
const chatGroupService = new MongoDBChatGroupService(new MongoDBConnection());

// Your WebSocket server setup
const app = express();
const httpServer = createServer(app);
const wss = new WebSocketServer({ server: httpServer });

// WebSocket message handling for group messages
wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      const { action, groupId, content } = data;

      // Handle actions, here 'GET_MESSAGES' is a specific action for retrieving messages
      if (action === 'GET_MESSAGES') {
        const messages = await chatGroupService.getMessagesFromGroup(groupId);
        ws.send(JSON.stringify({ type: 'GROUP_MESSAGES', data: messages || [] }));
      } else {
        // Handle other actions or message types if needed
      }
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  });

  // Other WebSocket event handling (e.g., close, error) if needed...
});

// HTTP route to create a new chat group
ChatGroupRouter.post('/chatgroups', async (req, res) => {
  try {
    const newChatGroup = await chatGroupService.createChatGroup();
    res.status(201).json(newChatGroup);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error creating a new chat group' });
  }
});

export default ChatGroupRouter;
