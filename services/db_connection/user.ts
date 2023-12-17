import mongoose, { Schema } from 'mongoose';
import { DB_URL } from '../../constants.ts';
import { Connection } from '../connection.ts';

interface ChatUser {
  email: string
  name: string
  password: string
  pub_key: number[]
  id_addressee?: string
  id_group?: string
}

const ChatUserSchema = new Schema<ChatUser>(
  {
    email: String,
    name: String,
    password: String,
    pub_key: [Number],
    id_addressee: {
      type: String,
      ref: 'ChatUser',
    },
    id_group: {
      type: String,
      ref: 'ChatGroup',
    },
  },
  { timestamps: true }
);

const ChatUserModel = mongoose.model('ChatUser', ChatUserSchema);

export class MongoDBChatUserService {
  constructor(private readonly connection: Connection) {}

  async connect(): Promise<void> {
    if (!DB_URL) throw new Error('DB URL not found.');
    const isConnected = await this.connection.connect(DB_URL);
    if (!isConnected) throw new Error('DB not connected');
  }

  async create(newUser: ChatUser): Promise<ChatUser> {
    await this.connect();
    const createdUser = await ChatUserModel.create(newUser);
    return createdUser;
  }

  async findById(userId: string): Promise<ChatUser | null | undefined> {
    await this.connect();
    return ChatUserModel.findById(userId);
  }

  async findAll(): Promise<ChatUser[]> {
    await this.connect();
    return ChatUserModel.find({});
  }

  async deleteById(userId: string): Promise<void> {
    await this.connect();
    await ChatUserModel.deleteOne({ _id: userId });
  }
}
