import mongoose, { Schema, Document } from 'mongoose';
import { DB_URL } from '../../constants.js';
import { Connection } from '../connection.js';

interface ChatGroup extends Document {
  name: string;
  msg_list: string[][];
  user_ids: string[];
}

const ChatGroupSchema = new Schema<ChatGroup>(
  {
    name: String,
    msg_list: {
      type: [[String, String, String]],
      default: [],
    },
    user_ids: {
      type: [String], // Array of user IDs 
    },
  },
  { timestamps: true }
);

const ChatGroupModel = mongoose.model<ChatGroup>('ChatGroup', ChatGroupSchema);

export class MongoDBChatGroupService {
  constructor(private readonly connection: Connection) {}

  async connect(): Promise<void> {
    if (!DB_URL) throw new Error('DB URL not found.');
    const isConnected = await this.connection.connect(DB_URL);
    if (!isConnected) throw new Error('DB not connected');
  }

  async createChatGroup(userIds: string[], name: string): Promise<ChatGroup | null> {
    const sortedUserIds = userIds.slice().sort(); 
    await this.connect();
    
    // Encontre um chat em grupo com os mesmos IDs de usuário
    const existingChatGroup = await ChatGroupModel.findOne({ name: name});
  
    // Se o chat em grupo já existir, retorne-o
    if (existingChatGroup) {
      console.log("uptade group.")
      return existingChatGroup;
    }
  
    // Caso contrário, crie um novo chat em grupo
    const newChatGroup = await ChatGroupModel.create({
      name: name,
      msg_list: [],
      user_ids: sortedUserIds,
    });
  
    return newChatGroup;
  }
  

  async addMessageToGroup(groupId: string, message: string, sender: string, receiver: string): Promise<ChatGroup | null> {
    try {
      await this.connect();
      const updatedGroup = await ChatGroupModel.findByIdAndUpdate(
        groupId,
        { $push: { msg_list: [ message, sender, receiver ] }, $set: { updatedAt: Date.now() } },
        { new: true }
      );
      if (!updatedGroup) {
        throw new Error('Chat group not found');
      }
      return updatedGroup;
    } catch (error) {
      console.error('Error adding message to chat group:', error);
      return null;
    }
  }  

  async getMessagesFromGroup(groupId: string): Promise<string[][] | null> {
    await this.connect();
    const group = await ChatGroupModel.findById(groupId);
    return group ? group.msg_list : null;
  }

  async getUsersInGroup(groupId: string): Promise<string[] | null> {
    try {
      await this.connect();

      // Encontra o grupo de chat pelo ID
      const group = await ChatGroupModel.findById(groupId);
      if (!group) {
        throw new Error('Chat group not found');
      }

      // Retorna o array de user_ids do grupo
      return group.user_ids;
    } catch (error) {
      console.error('Error getting users in chat group:', error);
      return null;
    }
  }

  async getChatGroupsByUser(userId: string): Promise<string[] | null> {
    try {
        await this.connect();

        // Encontra os grupos de chat que contêm o ID do usuário
        const groups = await ChatGroupModel.find({ user_ids: userId });
        if (!groups || groups.length === 0) {
            throw new Error('No chat groups found for the user');
        }

        // Retorna um array com os IDs dos grupos
        const groupIds = groups.map(group => group.name);
        return groupIds;
    } catch (error) {
        console.error('Error getting chat groups for the user:', error);
        return null;
    }
}


  async removeUserFromGroup(groupId: string, userIdToRemove: string): Promise<ChatGroup | null> {
    try {
      await this.connect();

      // Atualiza o grupo removendo o userIdToRemove do array user_ids
      const updatedGroup = await ChatGroupModel.findByIdAndUpdate(
        groupId,
        { $pull: { user_ids: userIdToRemove }, $set: { updatedAt: Date.now() } },
        { new: true }
      );

      if (!updatedGroup) {
        throw new Error('Failed to update chat group');
      }

      return updatedGroup;
    } catch (error) {
      console.error('Error removing user from chat group:', error);
      return null;
    }
  }

  async deleteChat(chatId: string): Promise<boolean> {
    try {
      await this.connect();
      const deletedGroupChat = await ChatGroupModel.findByIdAndDelete(chatId);
      return !!deletedGroupChat; // Returns true if the chat was successfully deleted, false otherwise
    } catch (error) {
      console.error('Error deleting group chat:', error);
      return false;
    }
  }  
}
