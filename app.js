const KEYS = {
  cart: "apnakart-cart",
  users: "apnakart-users",
  currentUser: "apnakart-current-user",
  orders: "apnakart-orders"
};

const state = {
  products: window.PRODUCTS || [],
  selectedCategory: "All",
  authMode: "login"
};

function getData(key, defaultValue) {
  const value = localStorage.getItem(key);
  return value ? JSON.parse(value) : defaultValue;
}

function setData(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(price);
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2000);
}

function getCart() {
  return getData(KEYS.cart, []);
}

function setCart(cart) {
  setData(KEYS.cart, cart);
  updateCartCount();
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("#cartCount").forEach((el) => {
    el.textContent = count;
  });
}

function getProduct(id) {
  return state.products.find((product) => product.id === id);
}

function addToCart(productId) {
  const cart = getCart();
  const item = cart.find((cartItem) => cartItem.productId === productId);

  if (item) {
    item.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }

  setCart(cart);
  renderCart();
  showToast("Product added to cart");
}

function changeQuantity(productId, change) {
  const updated = getCart()
    .map((item) => {
      if (item.productId === productId) {
        return { ...item, quantity: item.quantity + change };
      }
      return item;
    })
    .filter((item) => item.quantity > 0);

  setCart(updated);
  renderCart();
}

function getDetailedCartItems() {
  return getCart()
    .map((item) => {
      const product = getProduct(item.productId);
      return product ? { ...product, quantity: item.quantity } : null;
    })
    .filter(Boolean);
}

function renderFilters() {
  const filterBox = document.getElementById("categoryFilters");
  if (!filterBox) return;

  const categories = ["All", ...new Set(state.products.map((p) => p.category))];

  filterBox.innerHTML = categories.map((category) => `
    <button class="filter-btn ${state.selectedCategory === category ? "active" : ""}" data-category="${category}">
      ${category}
    </button>
  `).join("");

  filterBox.querySelectorAll("[data-category]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.selectedCategory = btn.dataset.category;
      renderFilters();
      renderProducts();
    });
  });
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;

  const products = state.selectedCategory === "All"
    ? state.products
    : state.products.filter((p) => p.category === state.selectedCategory);

  grid.innerHTML = products.map((product) => `
    <div class="product-card">
      <img src="${product.image}" alt="${product.name}">
      <h3>${product.name}</h3>
      <p>${product.shortDesc}</p>
      <p class="price">${formatPrice(product.price)}</p>
      <div class="nav-buttons">
        <a class="btn light" href="product.html?id=${product.id}">View Details</a>
        <button class="btn" data-add="${product.id}">Add to Cart</button>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll("[data-add]").forEach((btn) => {
    btn.addEventListener("click", () => addToCart(btn.dataset.add));
  });
}

function renderProductDetail() {
  const box = document.getElementById("productDetail");
  if (!box) return;

  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const product = getProduct(id) || state.products[0];

  box.innerHTML = `
    <img src="${product.image}" alt="${product.name}">
    <div>
      <h2>${product.name}</h2>
      <p class="price">${formatPrice(product.price)}</p>
      <p>${product.description}</p>
      <h3>Features</h3>
      <ul>
        ${product.specs.map((spec) => `<li>${spec}</li>`).join("")}
      </ul>
      <button id="detailAddBtn" class="btn">Add to Cart</button>
    </div>
  `;

  document.getElementById("detailAddBtn").addEventListener("click", () => {
    addToCart(product.id);
  });
}

function renderCart() {
  const cartItemsBox = document.getElementById("cartItems");
  const cartTotalBox = document.getElementById("cartTotal");
  if (!cartItemsBox || !cartTotalBox) return;

  const items = getDetailedCartItems();

  if (items.length === 0) {
    cartItemsBox.innerHTML = "<p>Your cart is empty.</p>";
    cartTotalBox.textContent = formatPrice(0);
    return;
  }

  let total = 0;

  cartItemsBox.innerHTML = items.map((item) => {
    total += item.price * item.quantity;

    return `
      <div class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h4>${item.name}</h4>
          <p>${formatPrice(item.price)}</p>
          <div class="qty-row">
            <button class="qty-btn" data-id="${item.id}" data-change="-1">-</button>
            <span>${item.quantity}</span>
            <button class="qty-btn" data-id="${item.id}" data-change="1">+</button>
          </div>
        </div>
      </div>
    `;
  }).join("");

  cartTotalBox.textContent = formatPrice(total);

  cartItemsBox.querySelectorAll("[data-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      changeQuantity(btn.dataset.id, Number(btn.dataset.change));
    });
  });
}

function openCart() {
  document.getElementById("cartPanel")?.classList.remove("hidden");
  renderCart();
}

function closeCart() {
  document.getElementById("cartPanel")?.classList.add("hidden");
}

function openAuth() {
  document.getElementById("authPanel")?.classList.remove("hidden");
  updateAuthModeUI();
}

function closeAuth() {
  document.getElementById("authPanel")?.classList.add("hidden");
}

function updateAuthModeUI() {
  const submitBtn = document.getElementById("authSubmitBtn");
  const authText = document.getElementById("authText");
  const authName = document.getElementById("authName");

  if (!submitBtn || !authText || !authName) return;

  if (state.authMode === "login") {
    submitBtn.textContent = "Login";
    authText.textContent = "Login with your email and password.";
    authName.style.display = "none";
  } else {
    submitBtn.textContent = "Register";
    authText.textContent = "Create a new account for demo use.";
    authName.style.display = "block";
  }
}

function handleAuth(event) {
  event.preventDefault();

  const name = document.getElementById("authName").value.trim();
  const email = document.getElementById("authEmail").value.trim().toLowerCase();
  const password = document.getElementById("authPassword").value;
  const users = getData(KEYS.users, []);

  if (state.authMode === "register") {
    if (!name) {
      showToast("Enter your name");
      return;
    }

    const alreadyExists = users.some((user) => user.email === email);
    if (alreadyExists) {
      showToast("Email already registered");
      return;
    }

    users.push({ name, email, password });
    setData(KEYS.users, users);
    setData(KEYS.currentUser, { name, email });
    showToast("Account created");
    closeAuth();
    fillCheckoutUser();
    updateLoginButton();
    return;
  }

  const foundUser = users.find((user) => user.email === email && user.password === password);
  if (!foundUser) {
    showToast("User not found");
    return;
  }

  setData(KEYS.currentUser, { name: foundUser.name, email: foundUser.email });
  showToast("Login successful");
  closeAuth();
  fillCheckoutUser();
  updateLoginButton();
}

function fillCheckoutUser() {
  const user = getData(KEYS.currentUser, null);
  const name = document.getElementById("checkoutName");
  const email = document.getElementById("checkoutEmail");

  if (user && name && email) {
    name.value = user.name;
    email.value = user.email;
  }
}

function updateLoginButton() {
  const btn = document.getElementById("loginBtn");
  const user = getData(KEYS.currentUser, null);
  if (btn) {
    btn.textContent = user ? `Hi, ${user.name}` : "Login";
  }
}

function handleCheckout(event) {
  event.preventDefault();

  const cart = getDetailedCartItems();
  if (cart.length === 0) {
    showToast("Cart is empty");
    return;
  }

  const name = document.getElementById("checkoutName").value.trim();
  const email = document.getElementById("checkoutEmail").value.trim();
  const address = document.getElementById("checkoutAddress").value.trim();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const itemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const orders = getData(KEYS.orders, []);
  orders.unshift({
    id: "ORD-" + Date.now(),
    customer: name,
    email,
    address,
    total,
    itemCount,
    date: new Date().toLocaleString("en-IN")
  });

  setData(KEYS.orders, orders);
  setCart([]);
  event.target.reset();
  renderCart();
  closeCart();
  showToast("Order placed successfully");
}

function renderAdmin() {
  const productsBox = document.getElementById("adminProducts");
  const usersBox = document.getElementById("adminUsers");
  const ordersBox = document.getElementById("adminOrders");
  if (!productsBox || !usersBox || !ordersBox) return;

  const users = getData(KEYS.users, []);
  const orders = getData(KEYS.orders, []);
  const categoryMap = {};

  state.products.forEach((product) => {
    categoryMap[product.category] = (categoryMap[product.category] || 0) + 1;
  });

  productsBox.innerHTML = Object.keys(categoryMap)
    .map((category) => `<p>${category}: ${categoryMap[category]}</p>`)
    .join("");

  usersBox.innerHTML = users.length
    ? users.map((user) => `<p>${user.name} - ${user.email}</p>`).join("")
    : "<p>No users yet.</p>";

  ordersBox.innerHTML = orders.length
    ? orders.map((order) => `
        <div class="box" style="margin-bottom:10px;">
          <p><strong>${order.id}</strong></p>
          <p>${order.customer} - ${order.email}</p>
          <p>${formatPrice(order.total)} | ${order.itemCount} items</p>
          <p>${order.date}</p>
        </div>
      `).join("")
    : "<p>No orders yet.</p>";
}

function bindEvents() {
  document.getElementById("cartBtn")?.addEventListener("click", openCart);
  document.getElementById("closeCartBtn")?.addEventListener("click", closeCart);
  document.getElementById("loginBtn")?.addEventListener("click", openAuth);
  document.getElementById("closeAuthBtn")?.addEventListener("click", closeAuth);
  document.getElementById("checkoutForm")?.addEventListener("submit", handleCheckout);
  document.getElementById("authForm")?.addEventListener("submit", handleAuth);

  document.querySelectorAll("[data-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.authMode = btn.dataset.mode;
      updateAuthModeUI();
    });
  });

  document.getElementById("clearOrdersBtn")?.addEventListener("click", () => {
    setData(KEYS.orders, []);
    renderAdmin();
    showToast("Orders cleared");
  });
}

function init() {
  updateCartCount();
  updateLoginButton();
  fillCheckoutUser();
  bindEvents();
  renderCart();

  const page = document.body.dataset.page;

  if (page === "home") {
    renderFilters();
    renderProducts();
  }

  if (page === "product") {
    renderProductDetail();
  }

  if (page === "admin") {
    renderAdmin();
  }
}

document.addEventListener("DOMContentLoaded", init);
