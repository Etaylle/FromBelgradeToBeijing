let currentUser;
//let token;
let cart = {};
let products = [];
let productStocks = {};
let logo2;
displayUserInfo();

// login modal functions
const openLogin = (e) => {
  const loginContainer = document.querySelector("#login");
  loginContainer.style.display = "grid";
};
const closeLogin = (e) => {
  const loginContainer = document.querySelector("#login");
  loginContainer.style.display = "none";
};
// register modal functions
const openRegister = (e) => {
  const registerContainer = document.querySelector("#register");
  registerContainer.style.display = "grid";
};
const closeRegister = (e) => {
  const registerContainer = document.querySelector("#register");
  registerContainer.style.display = "none";
};
document.addEventListener("DOMContentLoaded", () => {
  //currentUser = JSON.parse(localStorage.getItem("currentUser"));
  //token = localStorage.getItem("token");

  fetchProducts();
  displayUserInfo();
  setupCart();
  //displayUserAvatar();
  logo2 = document.querySelector(".credit-info");

  const registerBtn = document.getElementById("register-btn");
  const closeRegisterBtn = document.querySelector(".close-register");

  if (closeRegisterBtn) {
    closeRegisterBtn.addEventListener("click", closeRegister);
  }

  registerBtn.addEventListener("click", openRegister);

  const loginBtn = document.getElementById("login-btn");
  const logoutBtn = document.getElementById("logout-button");

  if (currentUser) {
    loginBtn.style.display = "none";
    registerBtn.style.display = "none";
    logoutBtn.style.display = "block";
    logo2.style.display = "flex";
  } else {
    loginBtn.style.display = "block";
    registerBtn.style.display = "block";
    logoutBtn.style.display = "none";
    logo2.style.display = "none";
  }

  const checkoutButton = document.querySelector('button[onclick="checkout()"]');
  if (checkoutButton) {
    checkoutButton.addEventListener("click", checkout);
  }

  const emptyCartButton = document.getElementById("empty-cart-button");
  if (emptyCartButton) {
    emptyCartButton.addEventListener("click", emptyCart);
  }

  const logoutButton = document.getElementById("logout-button");
  if (logoutButton) {
    logoutButton.addEventListener("click", logout);
  }

  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", login);
  }

  const cartContainer = document.querySelector(".cart-container");
  const addAllButton = document.createElement("button");
  addAllButton.textContent = "Add All to Cart";
  cartContainer.appendChild(addAllButton);
  addAllButton.addEventListener("click", () => {
    products.forEach((product) => {
      addToCart(product._id, product.price);
      updateCartTotal();
    });
  });

  loginBtn.addEventListener("click", openLogin);

  const loginCloseBtn = document.querySelector(".close-login");
  loginCloseBtn.addEventListener("click", closeLogin);
});

async function fetchCurrentUser() {
  const response = await fetch("http://localhost:8080/api/auth/currentUser");
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    console.error("Failed to fetch current user:", response.statusText);
    return null;
  }
}
async function checkout() {
  const total = Object.values(cart).reduce((sum, product) => sum + product.price * product.quantity, 0);

  if (total > currentUser.credits) {
    alert("Insufficient credits!");
    return;
  }

  const productIds = Object.keys(cart);

  try {
    const response = await fetch("http://localhost:8080/api/users/purchase-product", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: currentUser._id,
        productIds: productIds,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    currentUser.credits = data.user.credits;
    cart = {};
    localStorage.removeItem("cart");
    updateCartDisplay();
    displayUserInfo();
    alert("Purchase successful!");
    displayProducts(products);
  } catch (error) {
    console.error("Error during purchase:", error);
    alert("Purchase failed!");
    displayProducts(products);
  }
}


/*async function displayUserAvatar() {
if (!user || !user.firstname) {
        console.error('User data is missing or invalid');
        return;
    }
     document.getElementById('user-avatar-display').innerHTML = `
        <img src="${user.avatarUrl}" alt="${user.firstname}'s avatar" />
    `;
  const userAvatarDisplay = document.getElementById("user-avatar-display");
  const currentUser = await fetchCurrentUser();
  
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.firstname)}+${encodeURIComponent(currentUser.lastname)}`;
    
  const img = document.createElement('img');
  img.src = avatarUrl;  
  userAvatarDisplay.appendChild(img);
}*/
async function fetchProducts() {
  try {
    const response = await fetch("http://localhost:8080/api/products");
    products = await response.json();
    products.forEach((product) => {
      productStocks[product._id] = product.stock;
    });
    for (let productId in cart) {
      if (productStocks[productId]) {
        productStocks[productId] -= cart[productId].quantity;
      }
    }
    displayProducts(products);
  } catch (error) {
    console.error("Error fetching products:", error);
  }
}

function displayProducts(products) {
  const gridContainer = document.querySelector(".grid-container");
  gridContainer.innerHTML = "";

  products.forEach((product) => {
    const gridItem = document.createElement("div");
    gridItem.classList.add("grid-item", "grid-item-xl");
    gridItem.setAttribute("data-product-id", product._id);
    gridItem.innerHTML = `
      <img src="${product.images[0].url}" alt="${product.name}">
      <div class="overlay">
        ${product.name} - <span class="price-span">SilkyDinars:${product.price} - Q:${productStocks[product._id]}</span>
      </div>
    `;
    const addToCartButton = document.createElement("button");
    addToCartButton.textContent = "+";
    gridItem.appendChild(addToCartButton);
    gridContainer.appendChild(gridItem);
  });

  document.querySelectorAll(".grid-item button").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.parentElement.getAttribute("data-product-id");
      addToCart(productId);
      updateCartDisplay();
      updateCartTotal();
    });
  });
}

function addToCart(productId) {
  const product = products.find((p) => p._id === productId);
  if (!product) {
    console.error("Product not found");
    return;
  }
  if (productStocks[productId] < 1) {
    alert("Product is out of stock");
    return;
  }

  if (!cart[productId]) {
    cart[productId] = { ...product, quantity: 0 };
  }
  cart[productId].quantity++;
  productStocks[productId]--;

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartDisplay();
  displayProducts(products);
  updateCartTotal();
}

function setupCart() {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  updateCartDisplay();
}

function updateCartDisplay() {
  const cartItems = document.getElementById("cart-items");
  cartItems.innerHTML = "";
  for (let itemId in cart) {
    const item = cart[itemId];
    const listItem = document.createElement("li");
    listItem.textContent = `Name: ${item.name}, Price: $${item.price}, Quantity: ${item.quantity}`;
    cartItems.appendChild(listItem);
  }
  const cartContainer = document.querySelector(".cart-container");
  if (Object.keys(cart).length > 0) {
    cartContainer.style.zIndex = 3;
    cartContainer.style.opacity = 1;
  } else {
    cartContainer.style.zIndex = -8;
    cartContainer.style.opacity = 0;
  }
}



function updateCartTotal() {
  const total = Object.values(cart).reduce((sum, product) => sum + product.price * product.quantity, 0);
  document.getElementById("cart-total").textContent = "Total: " + total.toFixed(2);
}

async function login(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  console.log("Logging in with:", { email, password });

  try {
    const response = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    console.log("Login response:", data);

    if (response.ok) {
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      document.getElementById("login-status").textContent = "Login successful!";
      displayUserInfo();
      window.location.reload();
    } else {
      document.getElementById("login-status").textContent = "Login failed: " + data.message;
    }
  } catch (error) {
    document.getElementById("login-status").textContent = "Error: " + error.message;
  }
}


/*async function login(event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("http://localhost:8080/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();
    if (response.ok) {
      // Store session information in localStorage
      localStorage.setItem("currentUser", JSON.stringify(data.user));
      document.getElementById("login-status").textContent = "Login successful!";
      displayUserInfo(); // Refresh user info on UI
      window.location.reload(); // Optionally reload the page
    } else {
      document.getElementById("login-status").textContent =
        "Login failed: " + data.message;
    }
  } catch (error) {
    document.getElementById("login-status").textContent =
      "Error: " + error.message;
  }
}*/
async function register(event) {
  event.preventDefault();

  const username = document.getElementById("username").value;
  const firstname = document.getElementById("firstname").value;
  const lastname = document.getElementById("lastname").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;

  console.log("Registering with:", { username, firstname, lastname, email, password });

  try {
    const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, firstname, lastname, email, password }),
    });

    // Check if response status is OK
    if (response.ok) {
      const data = await response.json();
      console.log("Register response:", data);
      document.getElementById("register-status").textContent = "Registration successful!";
      window.location.href = "index.html"; // Redirect to index page or another page
    } else {
      const data = await response.json();
      console.log("Registration failed:", data.message);
      document.getElementById("register-status").textContent = "Registration failed: " + data.message;
    }
  } catch (error) {
    // Handle network or unexpected errors
    console.error("Error during registration:", error);
    document.getElementById("register-status").textContent = "Error: " + error.message;
  }
}


/*async function register(event) {
  event.preventDefault();

  const username = document.getElementById("username").value; // Add username field//+
  const firstname = document.getElementById("firstname").value;
  const lastname = document.getElementById("lastname").value;
  const email = document.getElementById("reg-email").value;
  const password = document.getElementById("reg-password").value;
  const address = document.getElementById("address").value;//-
  // const address = document.getElementById("address").value; // Remove if not needed//+

  try {
    const response = await fetch("http://localhost:8080/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    
      body: JSON.stringify({ username, firstname, lastname, email, password }),//+
    });

    const data = await response.json();
    if (response.ok) {
      document.getElementById("register-status").textContent =//-
        "Registration successful!";//-
      document.getElementById("register-status").textContent = "Registration successful!";//+
      // You might want to do something with the returned user data here//+
      // For example, set up a user session or update UI//+
      window.location.href = "index.html"; // Redirect on success
    } else {
      document.getElementById("register-status").textContent =//-
        "Registration failed: " + data.message;//-
      document.getElementById("register-status").textContent = "Registration failed: " + data.message;//+
    }
  } catch (error) {
    document.getElementById("register-status").textContent =//-
      "Error: " + error.message;//-
    document.getElementById("register-status").textContent = "Error: " + error.message;//+
  }
}
*/

async function logout() {
  try {
    const response = await fetch("http://localhost:8080/api/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      localStorage.removeItem("currentUser");
      window.location.reload(); // Refresh to update UI
    } else {
      console.error("Failed to log out:", response.statusText);
    }
  } catch (error) {
    console.error("Error logging out:", error);
  }
}




async function displayUserInfo() {
  const userInfoDisplay = document.getElementById("user-info-display");
  const currentUser = await fetchCurrentUser();

  if (currentUser) {
    userInfoDisplay.textContent = `Logged in as: ${currentUser.firstname} ${currentUser.lastname}`;
  } else {
    userInfoDisplay.textContent = "Not logged in";
  }
}


function emptyCart() {
  cart = {};
  localStorage.removeItem("cart");
  updateCartDisplay();
  updateCartTotal();
  displayProducts(products);
}
