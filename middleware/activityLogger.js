const { ActivityLog } = require('../models/modelRelations');

const activityLogger = async (req, res, next) => {
  try {
    if (req.user) {
      // Log the action
      await ActivityLog.create({
        userId: req.user.id,
        action: req.method + ' ' + req.originalUrl,
        details: JSON.stringify(req.body),
      });
    }
    next();
  } catch (err) {
    console.error('Error logging activity:', err);
    next();
  }
};

module.exports = activityLogger;