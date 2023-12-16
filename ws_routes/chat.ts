import express from 'express';
import { createServer } from 'http';
import { Server as WebSocketServer } from 'ws';
import { MongoDBConnection } from '../services/db_connection/mdb_connection';
import { MongoDBChatService } from '../services/db_connection/chat';

const ChatRouter = express.Router();
const chatService = new MongoDBChatService(new MongoDBConnection());

// Route to create a new chat between two users
ChatRouter.post('/chats', async (req, res) => {
  try {
    const { id_usuario1, id_usuario2 } = req.body; // Extract user IDs from the request body
    const newChat = await chatService.createChat(id_usuario1, id_usuario2);
    res.status(201).json(newChat);
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error creating a new chat' });
  }
});

// Route to find a chat between two users
ChatRouter.get('/chats/:id_usuario1/:id_usuario2', async (req, res) => {
  try {
    const { id_usuario1, id_usuario2 } = req.params;
    const chat = await chatService.findChatByUsers(id_usuario1, id_usuario2);
    res.json(chat || {});
  } catch (error) {
    res.status(400).json({ message: error.message || 'Error finding chat' });
  }
});

// Create an HTTP server
const app = express();
const httpServer = createServer(app);

// Create a WebSocket server
const wss = new WebSocketServer({ server: httpServer });

// WebSocket message handling
wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      const { chatId, content } = data;

      // Handle adding messages to a chat
      const updatedChat = await chatService.addMessageToChat(chatId, content);

      // Broadcast the updated chat to all connected clients if needed
      wss.clients.forEach((client) => {
        if (client !== ws && client.readyState === WebSocketServer.OPEN) {
          client.send(JSON.stringify({ type: 'UPDATED_CHAT', data: updatedChat }));
        }
      });
    } catch (error) {
      console.error('WebSocket error:', error);
    }
  });

  // Other WebSocket event handling (e.g., close, error) if needed...
});

// Exports the chat router
export default ChatRouter;
