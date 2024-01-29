import express from 'express';
import { MongoDBConnection } from '../services/db_connection/mdb_connection.ts';
import { MongoDBChatGroupService } from '../services/db_connection/group.ts'; // Adjust the import path accordingly

const ChatGroupRouter = express.Router();
const chatGroupService = new MongoDBChatGroupService(new MongoDBConnection());

// Route to create a new chat group
ChatGroupRouter.post('/chatGroups', async (req, res) => {
  try {
    const { userIds } = req.body;
    const newChatGroup = await chatGroupService.createChatGroup(userIds);
    console.log("Chat group sucessfully created")
    res.status(201).json(newChatGroup);
  } catch (error) {
    res.status(500).json({ message: 'Error creating chat group' });
  }
});

// Route to add a message to a chat group
ChatGroupRouter.post('/chatGroups/:groupId/messages', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { message, sender, receiver } = req.body;
    const updatedGroup = await chatGroupService.addMessageToGroup(groupId, message, sender, receiver);
    
    if (updatedGroup) {
      res.status(200).json(updatedGroup);
    } else {
      res.status(404).json({ message: 'Chat group not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error adding message to chat group' });
  }
});

// Route to get messages from a chat group
ChatGroupRouter.get('/chatGroups/:groupId/messages', async (req, res) => {
  try {
    const { groupId } = req.params;
    const messages = await chatGroupService.getMessagesFromGroup(groupId);
    res.status(200).json(messages || []);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages from chat group' });
  }
});

// Route to delete a group chat by its ID
ChatGroupRouter.delete('/chatGroups/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;
    const deleted = await chatGroupService.deleteChat(groupId);
    
    if (deleted) {
      res.status(200).json({ message: 'Group chat deleted successfully' });
    } else {
      res.status(404).json({ message: 'Group chat not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting group chat' });
  }
});

// Route to delete a chat by its ID
ChatGroupRouter.delete('/chatGroups/:groupId/:userId', async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const deleted = await chatGroupService.deleteChat(groupId);
    
    if (deleted) {
      res.status(200).json({ message: 'Group chat deleted successfully' });
    } else {
      res.status(404).json({ message: 'Group chat not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error deleting group chat' });
  }
});

export default ChatGroupRouter;
