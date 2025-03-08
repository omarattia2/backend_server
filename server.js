const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/dbConfig');
const authRoutes = require('./routes/authRoutes');
const folderRoutes = require('./routes/folderRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const adminDashboardRoutes = require('./routes/adminDashboardRoutes');
const rateLimit = require('express-rate-limit');  
const limiter = require('./middleware/rateLimiter'); // Import the rate limiter
// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(limiter);

// Use auth routes
app.use('/api/auth', authRoutes);

// Use folder routes
app.use('/api', folderRoutes);

// Use media routes
app.use('/api', mediaRoutes);

// Use admin routes
app.use('/api', adminRoutes);

// Test route
app.get('/', (req, res) => {
  res.send('Media Uploader Backend is running!');
});


app.use(adminDashboardRoutes); // Use admin dashboard routes

// Database connection and model synchronization
sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected.');
    return sequelize.sync();
  })
  .then(() => {
    console.log('Database synced.');
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});