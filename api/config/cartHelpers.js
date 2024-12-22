const { callProcedure } = require("./db");

const getCartDetails = async (userId) => {
  try {
    const cartDetails = await callProcedure("get_cart_details", { p_user_id: userId });
    return cartDetails;
  } catch (error) {
    console.error("Error fetching cart details:", error);
    throw error;
  }
};

module.exports = { getCartDetails };
