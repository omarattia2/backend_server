const adminMiddleware = (req, res, next) => {
    const user = req.user; // Get the user from the request object
  
    // Check if the user is an admin
    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  
    next(); // Allow access for admins
  };
  
  module.exports = adminMiddleware;