
const {sequelize} = require("../config/db");
const { DataTypes } = require("sequelize");
const Category = sequelize.define("Category", {
  categoryID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.STRING,
  },
});

module.exports = Category;