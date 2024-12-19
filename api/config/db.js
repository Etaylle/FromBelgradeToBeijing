require("dotenv").config();
const { Sequelize } = require("sequelize");


// Create a Sequelize instance for MySQL connection
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
  host: process.env.DB_HOST,
  dialect: "mysql",
  logging: console.log, // Disable SQL query logging in the console
});
sequelize
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .catch((err) => {
    console.error("Unable to connect to the database:", err);
  });
// Authenticate the connection
const connectDB = async () => {
  try {
    await sequelize.authenticate();
    console.log("MySQL database connected successfully!");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};

// Export the sequelize instance and the connectDB function
module.exports = { sequelize, connectDB };