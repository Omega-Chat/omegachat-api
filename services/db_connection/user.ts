import mongoose, { Schema, Document } from 'mongoose';
import { DB_URL } from '../../constants';
import { Connection } from '../connection';

interface ChatUser extends Document {
  email: string;
  name: string;
  password: string;
  pub_key: number[];
  id_addressee: string; // Assuming this refers to another user
  id_group: string; // Assuming this refers to a chat group
}

const ChatUserSchema = new Schema<ChatUser>(
  {
    email: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    pub_key: {
      type: [Number], // Array of numbers (assuming public key)
      default: [],
    },
    id_addressee: {
      type: Schema.Types.ObjectId,
      ref: 'ChatUser', // Reference to another user
    },
    id_group: {
      type: Schema.Types.ObjectId,
      ref: 'ChatGroup', // Reference to a chat group
    },
  },
  { timestamps: true }
);

const ChatUserModel = mongoose.model<ChatUser>('ChatUser', ChatUserSchema);

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
