const adminMiddleware = (req, res, next) => {
    const user = req.user; // Get the user from the request object
  
    // Check if the user is an admin or superadmin
    if (user.role !== 'admin' && user.role !== 'superadmin') {
      return res.status(403).json({ message: 'Access denied. Admins or superadmins only.' });
    }
  
    next(); // Allow access for admins and superadmins
  };
  
  module.exports = adminMiddleware;