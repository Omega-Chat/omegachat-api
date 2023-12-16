import mongoose, { Schema, Document } from 'mongoose';
import { DB_URL } from '../../constants';
import { Connection } from '../connection';

interface Chat extends Document {
  id_usuario1: string;
  id_usuario2: string;
  msg_list: string[];
  data_hora: Date;
}

const ChatSchema = new Schema<Chat>(
  {
    id_usuario1: {
      type: Schema.Types.ObjectId,
      ref: 'ChatUser', // Reference to user 1
      required: true,
    },
    id_usuario2: {
      type: Schema.Types.ObjectId,
      ref: 'ChatUser', // Reference to user 2
      required: true,
    },
    msg_list: {
      type: [String], // Array of strings (messages)
      default: [],
    },
    data_hora: {
      type: Date,
      default: Date.now,
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
    const newChat = await ChatModel.create({
      id_usuario1,
      id_usuario2,
      msg_list: [],
    });
    return newChat;
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

  async addMessageToChat(chatId: string, message: string): Promise<Chat | null> {
    await this.connect();
    return ChatModel.findByIdAndUpdate(
      chatId,
      { $push: { msg_list: message }, $set: { data_hora: Date.now() } },
      { new: true }
    );
  }

  async getMessagesFromChat(chatId: string): Promise<string[] | null> {
    await this.connect();
    const chat = await ChatModel.findById(chatId);
    return chat ? chat.msg_list : null;
  }
}
