const { Category } = require("../models/category.model"); // Import Sequelize models

//* GET ALL CATEGORIES
const getCategories = async (req, res) => {
  try {
    const data = await Category.findAll(); // Fetch all categories
    res.json(data);
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).send("Internal Server Error");
  }
};

//* CREATE CATEGORY
const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;

    // Check if a category with the same name exists
    const categoryExists = await Category.findOne({ where: { name } });
    if (categoryExists) {
      res.status(400).send(`A Category with the name: ${name} already exists`);
      return;
    }

    // Find the maximum category ID
    const lastCategory = await Category.findOne({
      order: [["categoryID", "DESC"]],
    });
    const newCategoryID = lastCategory ? lastCategory.categoryID + 1 : 1;

    // Create the new category
    const newCategory = await Category.create({
      name,
      description,
      categoryID: newCategoryID,
    });

    res.status(201).send(newCategory);
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).send("Internal Server Error");
  }
};

module.exports = { getCategories, createCategory };