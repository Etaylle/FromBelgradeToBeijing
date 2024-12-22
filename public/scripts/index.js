
let currentUser;
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

document.addEventListener("DOMContentLoaded", async () => {

  const currentUser = await fetchCurrentUser();


  fetchProducts();
  displayUserInfo();
  setupCart();
  displayUserAvatar();
  logo2 = document.querySelector(".credit-info");
  updateCartDisplay();

  // Initialize Stripe
  const stripe = Stripe('your_publishable_key');
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
    checkoutButton.addEventListener("click", initiateCheckout);
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


  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", register);
  }

  const cartContainer = document.querySelector(".cart-container");
  const addAllButton = document.createElement("button");
  addAllButton.textContent = "Add All to Cart";
  cartContainer.appendChild(addAllButton);
  addAllButton.addEventListener("click", () => {
    products.forEach((product) => {
      addToCart(product._id, product.price);
      
    });
  });

  loginBtn.addEventListener("click", openLogin);

  const loginCloseBtn = document.querySelector(".close-login");
  loginCloseBtn.addEventListener("click", closeLogin);
});
async function fetchCurrentUser() {
  try {
    const response = await fetch("http://localhost:8080/api/users/current", {
      method: "GET",
      credentials: "include", // Include cookies
    });

    if (response.ok) {
      const user = await response.json();
      return user;
    } else {
      console.error("Failed to fetch current user:", response.statusText);
      return null;
    }
  } catch (error) {
    console.error("Error fetching current user:", error);
    return null;
  }
}

/*async function checkout() {
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
*/

async function displayUserAvatar() {
  const currentUser = await fetchCurrentUser();
  if (!currentUser || !currentUser.firstname) {
    console.error('User data is missing or invalid');
    return;
  }

  const userAvatarDisplay = document.getElementById("user-avatar-display");
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.firstname)}+${encodeURIComponent(currentUser.lastname)}`;

  userAvatarDisplay.innerHTML = `
    <img src="${avatarUrl}" alt="${currentUser.firstname}'s avatar" />
  `;
}

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
    gridItem.setAttribute("data-product-id", product.product_id);

    // Create image slider
    let imageSlider = '<div class="image-slider">';
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      product.images.forEach((img, index) => {
        imageSlider += `<img src="${img}" alt="${product.name} - Image ${index + 1}" ${index === 0 ? 'class="active"' : ''}>`;
      });
    } else if (product.image_url) {
      imageSlider += `<img src="${product.image_url}" alt="${product.name}" class="active">`;
    } else {
      imageSlider += '<img src="/images/default-product-image.jpg" alt="Default Image" class="active">';
    }
    imageSlider += '</div>';

    gridItem.innerHTML = `
      ${imageSlider}
      <div class="overlay">
        ${product.name} - <span class="price-span">SilkyDinars:${product.price} - Q:${product.stock}</span>
      </div>
    `;
    const addToCartButton = document.createElement("button");
    addToCartButton.textContent = "+";
    gridItem.appendChild(addToCartButton);
    gridContainer.appendChild(gridItem);
  });
// Add event listeners for add to cart buttons
document.querySelectorAll(".add-to-cart-btn").forEach((button) => {
  button.addEventListener("click", (event) => {
    const productId = event.target.closest('.grid-item').getAttribute("data-product-id");
    console.log("Add to cart clicked for product ID:", productId); // Debug log
    addToCart(productId);
  });
});
  // Add event listeners for image slider
  document.querySelectorAll('.image-slider').forEach(slider => {
    const images = slider.querySelectorAll('img');
    let currentIndex = 0;

    setInterval(() => {
      images[currentIndex].classList.remove('active');
      currentIndex = (currentIndex + 1) % images.length;
      images[currentIndex].classList.add('active');
    }, 3000); // Change image every 3 seconds
  });

  document.querySelectorAll(".grid-item button").forEach((button) => {
    button.addEventListener("click", () => {
      const productId = button.parentElement.getAttribute("data-product-id");
      addToCart(productId);
      updateCartDisplay();
    });
  });
}
function addToCart(productId) {
  console.log("Adding to cart, product ID:", productId);

  fetch('http://localhost:8080/api/cart/add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ 
      productId: productId,
      quantity: 1 
    }),
    credentials: 'include'
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Failed to add to cart');
    }
    return response.json();
  })
  .then(data => {
    console.log("Add to cart successful, response:", data);
    updateCartDisplay();  // Call this function to update the cart display
    // Show success message
    const message = document.createElement('div');
    message.textContent = 'Added to cart!';
    message.className = 'success-message';
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 2000);
  })
  .catch(error => {
    console.error('Error:', error);
    // Show error message
    const message = document.createElement('div');
    message.textContent = 'Failed to add to cart';
    message.className = 'error-message';
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 2000);
  });
}


function setupCart() {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
  updateCartDisplay();
}
function updateCartDisplay() {
  fetch('http://localhost:8080/api/cart', {
    credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
    const cartContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    cartContainer.innerHTML = '';

    if (!data.cart || !data.cart.items || data.cart.items.length === 0) {
      cartContainer.innerHTML = '<li>Your cart is empty</li>';
      cartTotal.textContent = 'Total: 0';
      return;
    }

    let total = 0;
    data.cart.items.forEach(item => {
      const listItem = document.createElement('li');
      listItem.className = 'cart-item';

      // Handle image URL
      let imageUrl = '/images/1.jpg'; // Default image
      if (item.images && Array.isArray(item.images) && item.images.length > 0) {
        imageUrl = item.images[0];
      } else if (item.image_url) {
        imageUrl = item.image_url;
      }

      let productName = item.name || 'Unknown Product';
      let productPrice = item.price || 0;
      let productId = item.product_id || '';
      listItem.innerHTML = `
        <img src="${imageUrl}" alt="${productName}" class="cart-item-image">
        <div class="cart-item-details">
          <span class="item-name">${productName}</span>
          <span class="item-price">Dinars: ${parseFloat(productPrice).toFixed(2)}</span>
          <span class="item-quantity">Quantity: ${item.quantity}</span>
        </div>
        <div class="cart-item-controls">
          <button class="quantity-btn minus" data-id="${productId}">-</button>
          <button class="quantity-btn plus" data-id="${productId}">+</button>
          <button class="remove-btn" data-id="${productId}">Remove</button>
        </div>
      `;

      cartContainer.appendChild(listItem);
      total += productPrice * item.quantity;
    });

    cartTotal.textContent = `Total: ${total.toFixed(2)}`;

    // Add event listeners for quantity buttons and remove buttons
    document.querySelectorAll('.quantity-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        const isIncrement = this.classList.contains('plus');
        updateCartItemQuantity(productId, isIncrement);
      });
    });

    document.querySelectorAll('.remove-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const productId = this.getAttribute('data-id');
        removeFromCart(productId);
      });
    });
  })
  .catch(error => {
    console.error('Error updating cart display:', error);
    const cartContainer = document.getElementById('cart-items');
    cartContainer.innerHTML = '<li>Error loading cart</li>';
  });
}

function updateCartItem(productId, quantity) {
  fetch('http://localhost:8080/api/cart/update', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId, quantity }),
    credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
    updateCartDisplay();
  })
  .catch(error => console.error('Error:', error));
}

function removeFromCart(productId) {
  fetch('http://localhost:8080/api/cart/remove', {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ productId }),
    credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
    updateCartDisplay();
  })
  .catch(error => console.error('Error:', error));
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
    displayProducts(products);
}

function initiateCheckout() {
  fetch('/api/create-checkout-session', {
    method: 'POST',
    credentials: 'include'
  })
  .then(response => response.json())
  .then(data => {
    // Redirect to Stripe Checkout
    return stripe.redirectToCheckout({ sessionId: data.id });
  })
  .then(result => {
    if (result.error) {
      alert(result.error.message);
    }
  })
  .catch(error => console.error('Error:', error));
}