import mongoose, { Schema, Document } from 'mongoose';
import { DB_URL } from '../../constants.js';
import { Connection } from '../connection.js';

interface Chat {
  id_usuario1?: string;
  id_usuario2?: string;
  msg_list: string[][];
}

const ChatSchema = new Schema<Chat>(
  {
    id_usuario1: {
      type: String,
      ref: 'ChatUser',
    },
    id_usuario2: {
      type: String,
      ref: 'ChatUser',
    },
    msg_list: {
      type: [[String, String]],
      default: [],
    },
},
  { timestamps: true }
);

const ChatModel = mongoose.model<Chat>('Chat', ChatSchema);

export class MongoDBChatService {
  constructor(private readonly connection: Connection) {}

  async connect(): Promise<void> {
    if (!DB_URL) throw new Error('DB URL not found.');
    const isConnected = await this.connection.connect(DB_URL);
    if (!isConnected) throw new Error('DB not connected');
  }

  async createChat(id_usuario1: string, id_usuario2: string): Promise<Chat> {
    await this.connect();

    // Check if a chat already exists between the two users in the given order
    const existingChat = await ChatModel.findOne({
        $or: [
            { id_usuario1: id_usuario1, id_usuario2: id_usuario2 },
            { id_usuario1: id_usuario2, id_usuario2: id_usuario1 }
        ]
    });

    // If an existing chat is found, return it; otherwise, create a new chat
    if (existingChat) {
        return existingChat;
    } else {
        const newChat = await ChatModel.create({
            id_usuario1,
            id_usuario2,
        });
        return newChat;
    }
}

  async findChatByUsers(id_usuario1: string, id_usuario2: string): Promise<Chat | null> {
    await this.connect();
    return ChatModel.findOne({
      $or: [
        { id_usuario1, id_usuario2 },
        { id_usuario1: id_usuario2, id_usuario2: id_usuario1 }, // Reversed order as well
      ],
    });
  }

  async findAll(): Promise<Chat[]> {
    await this.connect();
    return ChatModel.find({});
  }

  async addMessageToChat(chatId: string, message: string, sender: string): Promise<Chat | null> {
    try {
      await this.connect();
      const updatedChat = await ChatModel.findByIdAndUpdate(
        chatId,
        { 
          $push: { 
            msg_list: [ message, sender ]  // Push an object with both message and sender
          }, 
          $set: { data_hora: Date.now() } 
        },
        { new: true }
      );
      if (!updatedChat) {
        throw new Error('Chat not found');
      }
      return updatedChat;
    } catch (error) {
      console.error('Error adding message to chat:', error);
      return null;
    }
  }

  async getMessagesFromChat(chatId: string): Promise<string[][] | undefined | null> {
    await this.connect();
    const chat = await ChatModel.findById(chatId)
    return chat?.msg_list;
  }

    async getChatById(chatId: string): Promise<Chat | null> {
    await this.connect();
    return ChatModel.findById(chatId);
  }
  
  async deleteChat(chatId: string): Promise<boolean> {
    try {
      await this.connect();
      const deletedChat = await ChatModel.findByIdAndDelete(chatId);
      return !!deletedChat; // Returns true if the chat was successfully deleted, false otherwise
    } catch (error) {
      console.error('Error deleting chat:', error);
      return false;
    }
  }  
  
}
