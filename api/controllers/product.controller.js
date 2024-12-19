const Product = require("../models/product.model");

//* GET ALL PRODUCTS
const getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll(); // Sequelize query to fetch all products
    res.json(products); // Send the products as a response
  } catch (error) {
    console.error(error); // Log any errors
    res.status(500).json({ message: "Error fetching products" }); // Send error response if anything fails
  }
};

//* GET PRODUCT BY ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id); // Find by primary key (ProductID)
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* GET FILTERED PRODUCTS
const getProductsByFilter = async (req, res) => {
  const { priceRange, categoryID, name, tag, id } = req.query;

  if (!priceRange && !categoryID && !name && !tag && !id) {
    return res.status(400).json({ message: "At least one filter parameter must be provided" });
  }

  try {
    const filterConditions = {};
    if (priceRange) {
      const [minPrice, maxPrice] = priceRange.split("-").map(Number);
      if (isNaN(minPrice) || isNaN(maxPrice)) {
        return res.status(400).json({ message: "Invalid priceRange format. Expected format: minPrice-maxPrice" });
      }
      filterConditions.Price = { [Sequelize.Op.between]: [minPrice, maxPrice] }; // Price range filter
    }

    if (categoryID) {
      filterConditions.CategoryID = categoryID;
    }

    if (name) {
      filterConditions.Name = { [Sequelize.Op.like]: `%${name}%` }; // Case-insensitive name search
    }

    if (id) {
      filterConditions.ProductID = id;
    }

    if (tag) {
      filterConditions.Tags = { [Sequelize.Op.like]: `%${tag}%` }; // Assuming tags are stored as a comma-separated string
    }

    const products = await Product.findAll({ where: filterConditions });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* CREATE PRODUCT
const createProduct = async (req, res) => {
  const { name, description, price, stock, images, categoryID } = req.body;

  if (!name || !description || !price || !images) {
    return res.status(400).json({ message: "Name, description, price, and images are required" });
  }

  try {
    const product = await Product.create({
      Name: name,
      Description: description,
      Price: price,
      Stock: stock || 0,
      Images: images,
      CategoryID: categoryID || null,
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* UPDATE PRODUCT
const updateProduct = async (req, res) => {
  const { id } = req.params;
  const { name, price, stock } = req.body;

  if (!name || !price || !stock) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    product.Name = name;
    product.Price = price;
    product.Stock = stock;
    await product.save(); // Save updated product

    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* DELETE PRODUCT
const deleteProduct = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.destroy(); // Delete the product
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//* BUY PRODUCT (you can adjust this method based on your logic)
const buyProduct = async (req, res) => {
  // Logic for buying a product goes here
};

module.exports = {
  getAllProducts,
  getProductsByFilter,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  buyProduct,
};