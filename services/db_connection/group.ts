import mongoose, { Schema, Document } from 'mongoose';
import { DB_URL } from '../../constants.ts';
import { Connection } from '../connection.ts';

interface ChatGroup extends Document {
  msg_list: string[][];
  user_ids: string[];
}

const ChatGroupSchema = new Schema<ChatGroup>(
  {
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

  async createChatGroup(userIds: string[]): Promise<ChatGroup | null> {
    const sortedUserIds = userIds.slice().sort(); 
    await this.connect();
    
    // Encontre um chat em grupo com os mesmos IDs de usuário
    const existingChatGroup = await ChatGroupModel.findOne({ user_ids: sortedUserIds });
  
    // Se o chat em grupo já existir, retorne-o
    if (existingChatGroup) {
      console.log("uptade group.")
      return existingChatGroup;
    }
  
    // Caso contrário, crie um novo chat em grupo
    const newChatGroup = await ChatGroupModel.create({
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
}
