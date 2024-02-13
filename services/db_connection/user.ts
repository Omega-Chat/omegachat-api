import mongoose, { Schema } from 'mongoose';
import { DB_URL } from '../../constants.ts';
import { Connection } from '../connection.ts';

interface ElGamalPublicKey {
  p: string;
  g: string;
  e: string;
}

interface User {
  _id?: string,
  email: string,
  name: string,
  password: string,
  pub_key?: ElGamalPublicKey,
  id_addressee?: string,
  id_group?: string,
  online: boolean
}

const UserSchema = new Schema<User>(
  {
    email: String,
    name: String,
    password: String,
    pub_key: {p: String, g: String, e: String},
    id_addressee: {
      type: String,
      ref: 'User',
    },
    id_group: {
      type: String,
      ref: 'ChatGroup',
    },
    online: Boolean
  },
  { timestamps: true }
);

const UserModel = mongoose.model('User', UserSchema);

export class MongoDBUserService {
  constructor(private readonly connection: Connection) {}

  async connect(): Promise<void> {
    if (!DB_URL) throw new Error('DB URL not found.');
    const isConnected = await this.connection.connect(DB_URL);
    if (!isConnected) throw new Error('DB not connected');
  }

  async create(newUser: User): Promise<User> {
    await this.connect();
    const foundUser = await UserModel.find({email: newUser.email})
    if(foundUser.length === 0){
      console.log("Teste 1")
      const createdUser = await UserModel.create(newUser);
      return createdUser;
    } else {
      console.log("Teste 2")
      throw new Error('E-mail já cadastrado!');
    }
  }

  async findById(userId: string): Promise<User | null | undefined> {
    await this.connect();
    return UserModel.findById(userId);
  }

  async findAll(): Promise<User[]> {
    await this.connect();
    return UserModel.find({online: true});
  }

  async exitUserById(userId: string, newState: boolean): Promise<User | null> {
    try {
      await this.connect();
      const exitedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $set: { online: newState } },
        { new: true }
      );
      return exitedUser;

    } catch (error) {
      console.error('Error exiting:', error);
      return null;
    }
  }

  async updatePubKey(userId: string, newPubKey: ElGamalPublicKey): Promise<User | null> {
    try {
      await this.connect();
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $set: { pub_key: newPubKey } },
        { new: true }
      );
      return updatedUser;
    } catch (error) {
      console.error('Error updating pub_key:', error);
      return null;
    }
  }
  
  async updateAddressId(userId: string, newAddressId: string): Promise<User | null> {
    try {
      await this.connect();
      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        { $set: { id_addressee: newAddressId } },
        { new: true }
      );
      return updatedUser;
    } catch (error) {
      console.error('Error updating id_addressee:', error);
      return null;
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    await this.connect();
    return UserModel.findOne({ email});
  }
  
}
