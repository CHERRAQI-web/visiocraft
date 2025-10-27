import mongoose from 'mongoose';
import User from '../models/user.models.js';
import Freelancer from '../models/freelancer.models.js';
import Skill from '../models/Skill.models.js'; 
import bcrypt from 'bcryptjs';

// Register Freelancer
// Register Freelancer
export const registerFreelancer = async (req, res) => {
    const { first_name, last_name, email, password, confirmPassword, portfolio_url, skills, bio } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password || !confirmPassword || !skills || !bio) {
        return res.status(400).json({ message: 'All fields are required.' });
    }
    if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match." });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ message: 'Please provide a valid email address.' });
    }

    // Validate password strength
    if (password.length < 8) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    }

    // Validate portfolio URL if provided
    if (portfolio_url) {
        try {
            new URL(portfolio_url);
        } catch (err) {
            return res.status(400).json({ message: 'Please provide a valid portfolio URL.' });
        }
    }

    let session;
    try {
        // Start a session and transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // Check if the user already exists
        const existingUser = await User.findOne({ email }).session(session);
        if (existingUser) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'This email is already in use.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create the main user
        const newUser = await User.create([{
            first_name,
            last_name,
            email,
            password: hashedPassword,
            role: 'Freelancer'
        }], { session });

        const userId = newUser[0]._id;

        // Validate skills
        if (!Array.isArray(skills) || skills.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ message: 'At least one skill is required.' });
        }

        // Clean skill names
        const skillNames = skills.map(skill => skill.trim().toLowerCase());
        
        // Find existing skills
        const existingSkills = await Skill.find({ name: { $in: skillNames } }).session(session);
        const existingSkillNames = existingSkills.map(skill => skill.name);
        
        // Find skills that don't exist yet
        const newSkillNames = skillNames.filter(name => !existingSkillNames.includes(name));
        
        // Create new skills if needed
        const newSkillPromises = newSkillNames.map(name => 
            Skill.create([{
                name,
                category: 'Auto-detected'
            }], { session })
        );
        
        const newSkillResults = await Promise.all(newSkillPromises);
        const newSkills = newSkillResults.flat();
        
        // Combine existing and new skills
        const allSkills = [...existingSkills, ...newSkills];
        const extractedSkillIds = allSkills.map(skill => skill._id);

        // Create freelancer profile
        const newFreelancer = await Freelancer.create([{
            user_id: userId,
            portfolio_url,
            skills: extractedSkillIds,
            bio
        }], { session });

        // Commit and execute transaction
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            message: 'Freelancer registration successful!',
            user: {
                id: userId,
                email: newUser[0].email,
                role: newUser[0].role
            },
            freelancer: newFreelancer[0]
        });

    } catch (error) {
        if (session && session.inTransaction()) {
            await session.abortTransaction();
        }
        if (session) {
            session.endSession();
        }
        console.error("Error creating freelancer:", error);
        res.status(500).json({ message: 'Error creating freelancer.' });
    }
};
// Get My Profile
export const getMyProfile = async (req, res) => {
  try {
    const freelancer = await Freelancer.findById(req.params.id)
      .populate({
        path: 'user_id',
        select: 'first_name last_name email'
      })
      .populate({
        path: 'skills', 
        select: 'name category'
      });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    res.status(200).json(freelancer);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All Freelancers
export const getAllFreelancers = async (req, res) => {
  try {
    // 1. Retrieve parameters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const searchTerm = req.query.search || '';
    const skip = (page - 1) * limit;

    // 2. Create search expression for reuse
    const searchRegex = new RegExp(searchTerm, 'i');

    // 3. Build aggregation pipeline
    const pipeline = [
      // Step 1: Join user data (equivalent to populate)
      {
        $lookup: {
          from: 'users', // Name of the User collection in DB (typically lowercase and plural)
          localField: 'user_id',
          foreignField: '_id',
          as: 'user_id'
        }
      },
      // Step 2: Unwind the user_id array to get an object
      {
        $unwind: '$user_id'
      },
      // Step 3: Join skills data
      {
        $lookup: {
          from: 'skills', // Name of the Skill collection
          localField: 'skills',
          foreignField: '_id',
          as: 'skills'
        }
      },
      // Step 4: Filter results if a search term is provided
      ...(searchTerm ? [{
        $match: {
          $or: [
            { 'user_id.first_name': searchRegex },
            { 'user_id.last_name': searchRegex },
            { 'user_id.email': searchRegex },
            { 'skills.name': searchRegex },
            { bio: searchRegex },
          ]
        }
      }] : []),
      // Step 5: Sort results
      {
        $sort: { createdAt: -1 }
      },
      // Step 6: Facet to get paginated list AND total count at once
      {
        $facet: {
          // Pipeline for paginated data
          paginatedResults: [
            { $skip: skip },
            { $limit: limit }
          ],
          // Pipeline for total count
          totalCount: [
            { $count: "count" }
          ]
        }
      }
    ];

    // 4. Execute aggregation
    const [result] = await Freelancer.aggregate(pipeline);

    const freelancers = result.paginatedResults;
    const totalItems = result.totalCount[0] ? result.totalCount[0].count : 0;
    const totalPages = Math.ceil(totalItems / limit);

    // 5. Format data for frontend (already almost in the correct format)
    const formattedFreelancers = freelancers.map(f => ({
      _id: f._id,
      username: `${f.user_id.first_name} ${f.user_id.last_name}`,
      email: f.user_id.email,
      portfolio: f.portfolio_url,
      skills: f.skills.map(skill => skill.name),
      bio: f.bio || 'Not specified',
    }));

    // 6. Return response
    res.status(200).json({
      freelancers: formattedFreelancers,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        totalItems: totalItems,
        itemsPerPage: limit,
      }
    });

  } catch (error) {
    console.error("Error retrieving freelancers:", error);
    res.status(500).json({ message: 'Server error retrieving freelancers.' });
  }
};

// Delete Freelancer
export const deleteFreelancer = async (req, res) => {
  const { id } = req.params;

  let session;

  try {
    // 1. Start session and transaction
    session = await mongoose.startSession();
    session.startTransaction();

    // 2. Check if the freelancer exists
    const freelancer = await Freelancer.findById(id).session(session);
    if (!freelancer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    const userId = freelancer.user_id;

    // 3. Delete freelancer profile first
    const deletedFreelancer = await Freelancer.findByIdAndDelete(id).session(session);
    if (!deletedFreelancer) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Error deleting freelancer' });
    }

    // 4. Delete associated user
    const deletedUser = await User.findByIdAndDelete(userId).session(session);
    if (!deletedUser) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ message: 'Error deleting associated user' });
    }

    // 5. Commit and execute transaction
    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      message: 'Freelancer and user deleted successfully',
      deletedFreelancer: {
        id: deletedFreelancer._id,
        user_id: deletedFreelancer.user_id
      },
      deletedUser: {
        id: deletedUser._id,
        email: deletedUser.email
      }
    });

  } catch (error) {
    // 6. If error, cancel the entire transaction
    if (session && session.inTransaction()) {
      await session.abortTransaction();
    }
    if (session) {
      session.endSession();
    }
    console.error(error);
    res.status(500).json({ message: 'Error deleting freelancer.' });
  }
};

// Get Freelancer by ID
export const getFreelancerById = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if ID is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid freelancer ID' });
    }

    // Retrieve freelancer with populated data
    const freelancer = await Freelancer.findById(id)
      .populate({
        path: 'user_id',
        select: 'first_name last_name email'
      })
      .populate({
        path: 'skills',
        select: 'name category'
      });

    if (!freelancer) {
      return res.status(404).json({ message: 'Freelancer not found' });
    }

    // Format response for frontend
    const formattedFreelancer = {
      _id: freelancer._id,
      username: `${freelancer.user_id.first_name} ${freelancer.user_id.last_name}`,
      email: freelancer.user_id.email,
      portfolio: freelancer.portfolio_url,
      skills: freelancer.skills.map(skill => skill.name),
      bio: freelancer.bio || 'Not specified',
      createdAt: freelancer.createdAt,
      updatedAt: freelancer.updatedAt
    };

    res.status(200).json(formattedFreelancer);

  } catch (error) {
    console.error("Error retrieving freelancer:", error);
    res.status(500).json({ message: 'Server error retrieving freelancer.' });
  }
};
