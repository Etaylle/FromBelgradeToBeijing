const { sequelize } = require('./api/config/db');
require('./api/models/associations'); // Ensure all models and associations are loaded

(async () => {
  try {
    await sequelize.sync({ alter: true }); // Use `alter: true` for development
    console.log('Database synchronized successfully.');
  } catch (err) {
    console.error('Error during database synchronization:', err);
  }
})();
