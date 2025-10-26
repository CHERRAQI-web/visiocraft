import mongoose from 'mongoose';
import User from '../models/user.models.js';
import Client from '../models/client.models.js';
import bcrypt from 'bcryptjs'; 
import Project from '../models/project.models.js'

// Register Client
export const registerClient = async (req, res) => {
  const { first_name, last_name, email, password, confirmPassword, company_name, industry } = req.body;

  if (!first_name || !last_name || !email || !password || !confirmPassword || !company_name) {
    return res.status(400).json({ message: 'Please fill in all required fields' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match" });
  }
  let session; 

  try {
    // 2. Start Transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // 3. Check if the user already exists
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'This email is already in use' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Create the user
    const newUser = await User.create([{
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: 'Client'
    }], { session });

    // 5. Correct access to the user ID
    const userId = newUser[0]._id;

    // 6. Create the client profile
    const newClient = await Client.create([{
      user_id: userId,
      company_name,
      industry
    }], { session });

    // 7. Commit the changes
    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Client created successfully',
      user: {
        id: userId,
        email: newUser[0].email,
        role: newUser[0].role
      },
      client: newClient[0]
    });

  } catch (error) {
    // 8. If an error occurs, rollback everything
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error(error);
    res.status(500).json({ message: 'Error' });
  }
};

// Get All Clients
export const getAllClients = async (req, res) => {
  try {
    console.log("Attempting to retrieve clients...");

    const clients = await Client.find()
      .populate({
        path: 'user_id',
        select: 'first_name last_name email'
      })
      .lean();

    // --- CRUCIAL DEBUG LOG ---
    console.log("Database result (clients) :", JSON.stringify(clients, null, 2));
    // --------------------------------

    // 2. Format the data securely
    const formattedClients = clients.map(c => {
      // Check if user_id is populated correctly
      if (!c.user_id) {
        console.error(`Warning: The client with ID ${c._id} has no populated user_id.`);
      }

      return {
        _id: c._id,
        user_id: c.user_id, // Keep the ID if you want to display it
        username: c.user_id ? `${c.user_id.first_name} ${c.user_id.last_name}` : 'User not found',
        email: c.user_id ? c.user_id.email : 'Email not found',
        company_name: c.company_name || 'Not specified',
        industry: c.industry || 'Not specified',
      };
    });
    const totalClient = await Client.countDocuments();
    res.status(200).json(formattedClients);

  } catch (error) {
    console.error("Error retrieving clients:", error);
    res.status(500).json({ message: 'Server error retrieving clients.' });
  }
};

// Get Client Profile
export const getClientProfile = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id)
      .populate({
        path: 'user_id', // The field to populate
        select: 'first_name last_name email' // Fields to retrieve from the User model
      });

    if (!client) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.status(200).json(client);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Client
export const deleteClient = async (req, res) => {
  const { id } = req.params; // Get client ID from URL parameters
  let session;

  try {
    // 1. Start a session for transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // 2. Find the client to get their user_id and check for associated projects
    const client = await Client.findById(id).session(session);
    if (!client) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Client not found' });
    }

    // 3. Check if the client has associated projects
    const associatedProject = await Project.findOne({ client_id: id }).session(session);

    if (associatedProject) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ 
        message: 'Cannot delete this client because they are associated with one or more projects.' 
      });
    }

    // 4. Proceed with deletion if no projects are associated
    const userId = client.user_id;

    // Delete the Client document
    await Client.findByIdAndDelete(id, { session });

    // Delete the associated User document to maintain data integrity
    await User.findByIdAndDelete(userId, { session });

    // 5. Commit the transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({ message: 'Client and associated user have been successfully deleted.' });

  } catch (error) {
    console.error("Error during client deletion:", error);
    
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    if (session) {
      session.endSession();
    }

    res.status(500).json({ message: 'Server error during client deletion.' });
  }
};
