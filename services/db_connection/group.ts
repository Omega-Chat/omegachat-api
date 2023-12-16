import mongoose, { Schema, Document } from 'mongoose';
import { DB_URL } from '../../constants';
import { Connection } from '../connection';

interface ChatGroup extends Document {
  msg_list: string[];
}

const ChatGroupSchema = new Schema<ChatGroup>(
  {
    msg_list: {
      type: [String], // Array of strings (messages)
      default: [],
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

  async createChatGroup(): Promise<ChatGroup> {
    await this.connect();
    const newChatGroup = await ChatGroupModel.create({
      msg_list: [],
    });
    return newChatGroup;
  }

  async addMessageToGroup(groupId: string, message: string): Promise<ChatGroup | null> {
    await this.connect();
    return ChatGroupModel.findByIdAndUpdate(
      groupId,
      { $push: { msg_list: message }, $set: { updatedAt: Date.now() } },
      { new: true }
    );
  }

  async getMessagesFromGroup(groupId: string): Promise<string[] | null> {
    await this.connect();
    const group = await ChatGroupModel.findById(groupId);
    return group ? group.msg_list : null;
  }
}
