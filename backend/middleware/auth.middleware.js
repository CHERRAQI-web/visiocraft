import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import User from '../models/user.models.js'; // Import the User model

dotenv.config();

export const verifyToken = async (req, res, next) => {
  // --- CORRECTION ---
  // 1. Declare 'token' with 'let' and initialize it to 'null' to avoid reassignment errors.
  let token = null;

  // 2. Improved token extraction logic:
  //    - Prioritize the token in the Authorization header (Bearer Token)
  //    - Otherwise, check cookies
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }
  
  if (!token && req.cookies && req.cookies.token) {
    token = req.cookies.token;
  }

  // 3. If no token is found after checking, reject the request.
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized: No token found' });
  }

  try {
    // 4. Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 5. Ensure the payload contains 'userId' (as corrected previously)
    if (!decoded.userId) {
      return res.status(401).json({ message: 'Invalid token: userId is missing' });
    }

    // 6. Search for the user in the database to ensure they still exist
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'User associated with this token not found' });
    }
    
    // 7. Attach the full user object to the request for later use
    req.user = user;
    next();

  } catch (error) {
    console.error("Error during token verification:", error.message);
    // Handles errors like expired or invalid token
    return res.status(401).json({ message: 'Token is invalid or has expired' });
  }
};

// --- The following functions are correct and do not need modification ---

/**
 * Checks if the logged-in user is an administrator.
 * Should be used after the `verifyToken` middleware.
 */
export const isAdmin = (req, res, next) => {
  try {
    if (!req.user || req.user.role !== 'Admin') {
      return res.status(403).json({ message: "Access forbidden. Admins only." });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Access denied' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }

    next();
  };
};