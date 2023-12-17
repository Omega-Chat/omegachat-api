import express from 'express';
import { Request, Response } from 'express';
import { MongoDBConnection } from '../services/db_connection/mdb_connection.ts';
import { MongoDBChatUserService } from '../services/db_connection/user.ts';

const UserRouter = express.Router();

const chatUserService = new MongoDBChatUserService(new MongoDBConnection());

// Route to create a new user
UserRouter.post('/users', async (req: Request, res: Response) => {
  try {
    const newUser = req.body; // Assuming the request body contains user data
    const createdUser = await chatUserService.create(newUser);
    res.status(201).json(createdUser);
  } catch (error: any) {
    res.status(400).json({ message: error?.message || 'Error creating a new user' });
  }
});

// Route to find a user by ID
UserRouter.get('/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await chatUserService.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error?.message || 'Error finding user' });
  }
});

// Route to get all users
UserRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    const allUsers = await chatUserService.findAll();
    res.json(allUsers);
  } catch (error: any) {
    res.status(400).json({ message: error?.message || 'Error fetching users' });
  }
});

// Route to delete a user by ID
UserRouter.delete('/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    await chatUserService.deleteById(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ message: error?.message || 'Error deleting user' });
  }
});

export default UserRouter;
