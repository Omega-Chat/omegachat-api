import express from 'express';
import { Request, Response } from 'express';
import { MongoDBConnection } from '../services/db_connection/mdb_connection.ts';
import { MongoDBUserService } from '../services/db_connection/user.ts';

const UserRouter = express.Router();

const UserService = new MongoDBUserService(new MongoDBConnection());

// Route to create a new user
UserRouter.post('/users', async (req: Request, res: Response) => {
  try {
    const newUser = req.body; // Assuming the request body contains user data
    const createdUser = await UserService.create(newUser);
    res.status(201).json(createdUser);
  } catch (error: any) {
    res.status(400).json({ message: error?.message || 'Error creating a new user' });
  }
});

UserRouter.post('/loginUser', async (req: Request, res: Response) => {
  const { email, password} = req.body;

  try {
    
    // Check if both email and password are provided
    if (!email || !password) {
      return res.status(400).json({ message: 'Both email and password are required' });
    }
    
    const user = await UserService.findUserByEmailAndPassword(email, password);
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
    } else {
      res.status(200).json(user);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error finding user' });
  }
});

// Route to update pub_key of a user
UserRouter.put('/users/:userId/pub_key', async (req, res) => {
  try {
    const { userId } = req.params;
    const { pub_key } = req.body;
    const updatedUser = await UserService.updatePubKey(userId, pub_key);
    
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating pub_key' });
  }
});

// Route to exit user by ID
UserRouter.put('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { newState } = req.body;
    const updatedUser =  await UserService.exitUserById(userId, newState);
    
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error: any) {
    res.status(500).json({ message: error?.message || 'Error deleting user' });
  }
});

// Route to get all users
UserRouter.get('/users', async (_req: Request, res: Response) => {
  try {
    const allUsers = await UserService.findAll();
    res.json(allUsers);
  } catch (error: any) {
    res.status(400).json({ message: error?.message || 'Error fetching users' });
  }
});

// Route to find a user by ID
UserRouter.get('/users/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const user = await UserService.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    res.status(400).json({ message: error?.message || 'Error finding user' });
  }
});




// Route to update id_addressee of a user
UserRouter.put('/users/:userId/id_addressee', async (req, res) => {
  try {
    const { userId } = req.params;
    const { id_addressee } = req.body;
    const updatedUser = await UserService.updateAddressId(userId, id_addressee);
    
    if (updatedUser) {
      res.status(200).json(updatedUser);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error updating id_addressee' });
  }
});


export default UserRouter;
