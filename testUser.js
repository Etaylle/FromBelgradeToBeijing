const { sequelize } = require('./api/config/db');
const User = require('./api/models/user.model');  // Import the User model

async function testDatabase() {
  try {
    // Sync the database to ensure tables are created
    await sequelize.sync({ force: true });  // WARNING: This will drop and recreate the tables
    console.log('Database synced successfully!');

    // Create a new user entry for testing
    const user = await User.create({
      email: 'testuser@example.com',
      password: 'password123',  // It will be hashed automatically by the beforeCreate hook
      firstname: 'Test',
      lastname: 'User',
      address: '123 Test St.',
    });
    console.log('Test user created:', user);
  } catch (error) {
    console.error('Error testing the database:', error);
  }
}

testDatabase();
