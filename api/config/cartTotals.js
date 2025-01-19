const { sequelize } = require("./db");

const getCartTotals = async (userId) => {
  try {
    const [totals] = await sequelize.query(
      "SELECT * FROM cart_totals WHERE user_id = :userId",
      {
        replacements: { userId },
      }
    );
    return totals;
  } catch (error) {
    console.error("Error fetching cart totals:", error);
    throw error;
  }
};

module.exports = { getCartTotals };
