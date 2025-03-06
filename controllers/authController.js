const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/modelRelations');
const dotenv = require('dotenv');

dotenv.config();

// Register a new user
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create the user
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
    });

    res.status(201).json({ message: 'User registered successfully', user: newUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// Login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the user exists
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id ,role: user.role}, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.status(200).json({ message: 'Login successful', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Update user profile
const updateProfile = async (req, res) => {
    const { username, email, password } = req.body;
    const userId = req.user.id; // Get the user ID from the authenticated request
  
    try {
      // Find the user
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update the user's profile
      if (username) user.username = username;
      if (email) user.email = email;
      if (password) {
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);
      }
  
      await user.save();
  
      res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };


//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Change password
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;
  
    try {
      console.log('Full Request Body:', req.body); // Debugging Line
  
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both currentPassword and newPassword are required' });
      }
  
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      console.log('Current Password:', currentPassword);
      console.log('User Password (Hashed):', user.password);
  
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
  
      user.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
      console.error('Error changing password:', err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Delete a user
const deleteUser = async (req, res) => {
    const { userId } = req.params; // ID of the user to delete
    const requestingUserId = req.user.id; // ID of the user making the request
    const requestingUserRole = req.user.role; // Role of the user making the request

    try {
        // Debug logs
        console.log('Requesting User ID (Type):', typeof requestingUserId, requestingUserId);
        console.log('Requesting User Role:', requestingUserRole);
        console.log('User ID to Delete (Type):', typeof userId, userId);

        // Find the user to delete
        const userToDelete = await User.findOne({ where: { id: userId } });
        if (!userToDelete) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Ensure ID types match
        if (requestingUserRole === 'admin' || 
            requestingUserRole === 'superadmin' || 
            Number(requestingUserId) === Number(userId)) { 

            await userToDelete.destroy();
            return res.status(200).json({ message: 'User deleted successfully' });

        } else {
            return res.status(403).json({ message: 'You do not have permission to delete this user' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Get all users
const getAllUsers = async (req, res) => {
    const requestingUserRole = req.user.role;
  
    try {
      // Only admins can fetch all users
      if (requestingUserRole !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }
  
      // Fetch all users
      const users = await User.findAll({
        attributes: ['id', 'username', 'email', 'role'], // Exclude sensitive data like passwords
      });
  
      res.status(200).json({ users });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
  
  

  //--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Promote a user to admin

const promoteToAdmin = async (req, res) => {
    const { userId } = req.params;
    const requestingUserRole = req.user.role;

    try {
        // Only super admins can promote users
        if (requestingUserRole !== 'superadmin') {
            return res.status(403).json({ message: 'Only super admins can promote users.' });
        }

        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Promote to admin
        user.role = 'admin';
        await user.save();

        res.status(200).json({ message: 'User promoted to admin successfully', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};


//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Demote a user from admin to regular user

const demoteFromAdmin = async (req, res) => {
    const { userId } = req.params;
    const requestingUserRole = req.user.role;

    try {
        // Only super admins can demote admins
        if (requestingUserRole !== 'superadmin') {
            return res.status(403).json({ message: 'Only super admins can demote admins.' });
        }

        const user = await User.findOne({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.role !== 'admin') {
            return res.status(400).json({ message: 'User is not an admin.' });
        }

        user.role = 'user';
        await user.save();

        res.status(200).json({ message: 'User demoted to regular user successfully', user });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Upload profile picture
const uploadProfilePicture = async (req, res) => {
    const userId = req.user.id; // Get the user ID from the authenticated request
  
    try {
      // Check if a file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
  
      // Get the file path
      const filePath = req.file.path;
  
      // Find the user
      const user = await User.findOne({ where: { id: userId } });
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Update the user's profile picture
      user.profilePicture = filePath;
      await user.save();
  
      res.status(200).json({ message: 'Profile picture uploaded successfully', user });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };

// Export both functions
module.exports = {
    registerUser,
    loginUser,
    promoteToAdmin,
    updateProfile,
    getAllUsers,
    demoteFromAdmin,
    uploadProfilePicture,
    changePassword,
    deleteUser,
  };
