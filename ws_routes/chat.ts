import express from 'express';
import { MongoDBConnection } from '../services/db_connection/mdb_connection.ts';
import { MongoDBChatService } from '../services/db_connection/chat.ts';

const ChatRouter = express.Router();
const chatService = new MongoDBChatService(new MongoDBConnection());

// Route to create a new chat between two users
ChatRouter.post('/chats', async (req, res) => {
  try {
    const { id_usuario1, id_usuario2 } = req.body; // Extract user IDs from the request body
    const newChat = await chatService.createChat(id_usuario1, id_usuario2);
    res.status(201).json(newChat);
  } catch (error) {
    res.status(400).json({ message: (error as any).message || 'Error creating a new chat' });
  }
});

// Route to find a chat between two users
ChatRouter.get('/chats/:id_usuario1/:id_usuario2', async (req, res) => {
  try {
    const { id_usuario1, id_usuario2 } = req.params;
    const chat = await chatService.findChatByUsers(id_usuario1, id_usuario2);
    res.json(chat || {});
  } catch (error) {
    res.status(400).json({ message: (error as any).message || 'Error finding chat' });
  }
});

// Route to add a message to a chat
ChatRouter.post('/chats/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { message } = req.body;
    console.log(message)
    const updatedChat = await chatService.addMessageToChat(chatId, message);
    res.status(201).json(updatedChat);
  } catch (error) {
    res.status(400).json({ message: (error as any).message || 'Error adding message to chat' });
  }
});

// Route to get a chat by id
ChatRouter.get('/chats/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await chatService.getChatById(chatId);
    console.log(chat?.msg_list)
    if (!chat) {
      res.status(404).json({ message: 'Chat not found' });
      return;
    }
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching chat' });
  }
});


// Route to delete a chat by its ID
ChatRouter.delete('/chats/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    const deleted = await chatService.deleteChat(chatId);
    
    if (deleted) {
      res.status(200).json({ message: 'Chat deleted successfully' });
    } else {
      res.status(404).json({ message: 'Chat not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting chat' });
  }
});

// Exports the chat router
export default ChatRouter;
