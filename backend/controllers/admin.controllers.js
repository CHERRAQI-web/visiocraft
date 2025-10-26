import mongoose from 'mongoose';
import User from '../models/user.models.js';
import Admin from '../models/admin.models.js';
import bcrypt from 'bcryptjs';

// Register Admin
export const registerAdmin = async (req, res) => {
  const { first_name, last_name, email, password } = req.body; // adminRole = 'super_admin' or 'project_manager'

  if (!first_name || !last_name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  let session;
  try {
    session = await mongoose.startSession();
    session.startTransaction();

    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ message: 'This email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create([{
      first_name,
      last_name,
      email,
      password: hashedPassword,
      role: 'Admin'
    }], { session });

    const userId = newUser[0]._id;

    const newAdmin = await Admin.create([{
      user_id: userId,
    }], { session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      message: 'Admin created successfully',
      user: { id: userId, email: newUser[0].email, role: newUser[0].role },
      admin: newAdmin[0]
    });

  } catch (error) {
    if (session?.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get Admin Profile
export const getMyProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.id)
      .populate({ path: 'user_id', select: 'first_name last_name email' });

    if (!admin) {
      return res.status(404).json({ message: 'Admin not found' });
    }

    res.status(200).json(admin);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
