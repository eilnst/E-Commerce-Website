const STORAGE_KEYS = {
  cart: "ecokart-cart",
  user: "ecokart-user",
  users: "ecokart-users",
  orders: "ecokart-orders"
};

const state = {
  products: window.NORTHSTAR_PRODUCTS || [],
  category: "All"
};

function readStorage(key, fallbackValue) {
  try {
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : fallbackValue;
  } catch {
    return fallbackValue;
  }
}

function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getCart() {
  return readStorage(STORAGE_KEYS.cart, []);
}

function setCart(cart) {
  writeStorage(STORAGE_KEYS.cart, cart);
  updateCartCount();
}

function getUsers() {
  return readStorage(STORAGE_KEYS.users, []);
}

function setUsers(users) {
  writeStorage(STORAGE_KEYS.users, users);
}

function getCurrentUser() {
  return readStorage(STORAGE_KEYS.user, null);
}

function setCurrentUser(user) {
  writeStorage(STORAGE_KEYS.user, user);
}

function getOrders() {
  return readStorage(STORAGE_KEYS.orders, []);
}

function setOrders(orders) {
  writeStorage(STORAGE_KEYS.orders, orders);
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
  if (!toast) {
    return;
  }

  toast.textContent = message;
  toast.classList.add("visible");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("visible");
  }, 2200);
}

function updateCartCount() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  document.querySelectorAll("#cartCount").forEach((countBox) => {
    countBox.textContent = totalItems;
  });
}

function getProductById(productId) {
  return state.products.find((product) => product.id === productId);
}

function addToCart(productId) {
  const cart = getCart();
  const existingItem = cart.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }

  setCart(cart);
  renderCart();
  showToast("Product added to cart.");
}

function changeQuantity(productId, changeValue) {
  const updatedCart = getCart()
    .map((item) => {
      if (item.productId === productId) {
        return { ...item, quantity: item.quantity + changeValue };
      }
      return item;
    })
    .filter((item) => item.quantity > 0);

  setCart(updatedCart);
  renderCart();
}

function getCartItemsWithDetails() {
  return getCart()
    .map((item) => {
      const product = getProductById(item.productId);
      return product ? { ...product, quantity: item.quantity } : null;
    })
    .filter(Boolean);
}

function renderCart() {
  const cartItemsBox = document.getElementById("cartItems");
  const cartTotalBox = document.getElementById("cartTotal");

  if (!cartItemsBox || !cartTotalBox) {
    return;
  }

  const items = getCartItemsWithDetails();

  if (items.length === 0) {
    cartItemsBox.innerHTML = '<p class="empty-state">Your cart is empty. Add some plants first.</p>';
    cartTotalBox.textContent = formatPrice(0);
    return;
  }

  let total = 0;

  cartItemsBox.innerHTML = items.map((item) => {
    total += item.price * item.quantity;

    return `
      <article class="cart-item">
        <img src="${item.image}" alt="${item.name}">
        <div>
          <h4>${item.name}</h4>
          <p>${formatPrice(item.price)}</p>
          <div class="quantity-row">
            <button type="button" data-product-id="${item.id}" data-change="-1">-</button>
            <span>${item.quantity}</span>
            <button type="button" data-product-id="${item.id}" data-change="1">+</button>
          </div>
        </div>
      </article>
    `;
  }).join("");

  cartTotalBox.textContent = formatPrice(total);

  cartItemsBox.querySelectorAll("[data-product-id]").forEach((button) => {
    button.addEventListener("click", () => {
      changeQuantity(button.dataset.productId, Number(button.dataset.change));
    });
  });
}

function toggleCart(showCart) {
  const cartDrawer = document.getElementById("cartDrawer");
  if (!cartDrawer) {
    return;
  }

  cartDrawer.classList.toggle("open", showCart);
  cartDrawer.setAttribute("aria-hidden", String(!showCart));
}

function renderFilters() {
  const filterBox = document.getElementById("categoryFilters");
  if (!filterBox) {
    return;
  }

  const categories = ["All", ...new Set(state.products.map((product) => product.category))];

  filterBox.innerHTML = categories.map((category) => `
    <button class="filter-chip ${state.category === category ? "active" : ""}" type="button" data-category="${category}">
      ${category}
    </button>
  `).join("");

  filterBox.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      state.category = button.dataset.category;
      renderFilters();
      renderCatalog();
    });
  });
}

function renderCatalog() {
  const productGrid = document.getElementById("productGrid");
  if (!productGrid) {
    return;
  }

  const filteredProducts = state.category === "All"
    ? state.products
    : state.products.filter((product) => product.category === state.category);

  productGrid.innerHTML = filteredProducts.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.name}">
        <span class="badge">${product.badge}</span>
      </div>
      <div class="product-meta">
        <div class="product-heading">
          <div>
            <p class="mini-label">${product.category}</p>
            <h3>${product.name}</h3>
          </div>
          <strong>${formatPrice(product.price)}</strong>
        </div>
        <p>${product.summary}</p>
        <div class="product-footer">
          <a class="text-link" href="product.html?id=${product.id}">View Details</a>
          <button class="pill-button alt" type="button" data-add="${product.id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join("");

  productGrid.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.add));
  });
}

function renderProductDetail() {
  const detailBox = document.getElementById("productDetail");
  if (!detailBox) {
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const selectedId = urlParams.get("id");
  const product = getProductById(selectedId) || state.products[0];

  detailBox.innerHTML = `
    <section class="detail-gallery">
      <img src="${product.image}" alt="${product.name}">
    </section>
    <section class="detail-copy">
      <p class="eyebrow">${product.category}</p>
      <h1>${product.name}</h1>
      <div class="detail-meta">
        <strong>${formatPrice(product.price)}</strong>
        <span>${product.rating} / 5 Rating</span>
      </div>
      <p class="detail-text">${product.description}</p>
      <div class="spec-list">
        ${product.specs.map((spec) => `<span>${spec}</span>`).join("")}
      </div>
      <div class="hero-actions">
        <button class="pill-button" type="button" id="detailAddToCart">Add to Cart</button>
        <a class="ghost-button" href="index.html#catalog">Continue Shopping</a>
      </div>
    </section>
  `;

  document.getElementById("detailAddToCart").addEventListener("click", () => {
    addToCart(product.id);
  });
}

function updateAuthButton() {
  const authButton = document.getElementById("authButton");
  const user = getCurrentUser();

  if (authButton) {
    authButton.textContent = user ? `Hi, ${user.name.split(" ")[0]}` : "Login";
  }
}

function openAuthDialog(mode) {
  const dialog = document.getElementById("authDialog");
  if (!dialog) {
    return;
  }

  setAuthMode(mode);
  dialog.showModal();
}

function setAuthMode(mode) {
  const dialog = document.getElementById("authDialog");
  const submitButton = document.getElementById("authSubmitButton");
  const statusText = document.getElementById("authStatus");
  const nameInput = document.getElementById("authName");

  if (!dialog || !submitButton || !statusText || !nameInput) {
    return;
  }

  dialog.dataset.mode = mode;
  submitButton.textContent = mode === "signin" ? "Login" : "Create Account";
  statusText.textContent = mode === "signin"
    ? "Login with your registered email and password."
    : "Create a demo account to save your plant orders.";
  nameInput.style.display = mode === "signin" ? "none" : "block";

  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.classList.toggle("active", button.dataset.authMode === mode);
  });
}

function fillCheckoutForm() {
  const user = getCurrentUser();
  const nameInput = document.getElementById("checkoutName");
  const emailInput = document.getElementById("checkoutEmail");

  if (user && nameInput && emailInput) {
    nameInput.value = user.name;
    emailInput.value = user.email;
  }
}

function handleAuthSubmit(event) {
  event.preventDefault();

  const dialog = document.getElementById("authDialog");
  const mode = dialog ? dialog.dataset.mode : "signin";
  const name = document.getElementById("authName").value.trim();
  const email = document.getElementById("authEmail").value.trim().toLowerCase();
  const password = document.getElementById("authPassword").value;
  const users = getUsers();

  if (mode === "register") {
    if (!name) {
      showToast("Please enter your name.");
      return;
    }

    const emailExists = users.some((user) => user.email === email);
    if (emailExists) {
      showToast("This email is already registered.");
      return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    setUsers(users);
    setCurrentUser({ name, email });
    dialog.close();
    updateAuthButton();
    fillCheckoutForm();
    showToast("Account created successfully.");
    return;
  }

  const foundUser = users.find((user) => user.email === email && user.password === password);
  if (!foundUser) {
    showToast("User not found. Please register first.");
    return;
  }

  setCurrentUser({ name: foundUser.name, email: foundUser.email });
  dialog.close();
  updateAuthButton();
  fillCheckoutForm();
  showToast("Login successful.");
}

function handleCheckout(event) {
  event.preventDefault();

  const items = getCartItemsWithDetails();
  if (items.length === 0) {
    showToast("Your cart is empty.");
    return;
  }

  const name = document.getElementById("checkoutName").value.trim();
  const email = document.getElementById("checkoutEmail").value.trim();
  const address = document.getElementById("checkoutAddress").value.trim();
  const currentUser = getCurrentUser();

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const order = {
    id: `ORD-${Date.now()}`,
    customer: currentUser ? currentUser.name : name,
    email,
    address,
    total,
    itemCount: totalItems,
    createdAt: new Date().toLocaleString("en-IN")
  };

  const orders = getOrders();
  orders.unshift(order);
  setOrders(orders);
  setCart([]);
  event.target.reset();
  renderCart();
  toggleCart(false);
  showToast("Order placed successfully.");
}

function renderAdmin() {
  const productSummaryBox = document.getElementById("adminCatalog");
  const usersBox = document.getElementById("adminUsers");
  const ordersBox = document.getElementById("adminOrders");

  if (!productSummaryBox || !usersBox || !ordersBox) {
    return;
  }

  const users = getUsers();
  const orders = getOrders();
  const categoryCount = {};

  state.products.forEach((product) => {
    if (!categoryCount[product.category]) {
      categoryCount[product.category] = 0;
    }
    categoryCount[product.category] += 1;
  });

  productSummaryBox.innerHTML = `
    <div class="admin-list">
      ${Object.keys(categoryCount).map((category) => `<p><strong>${categoryCount[category]}</strong> ${category} products</p>`).join("")}
      <p><strong>${state.products.length}</strong> total products</p>
    </div>
  `;

  usersBox.innerHTML = users.length > 0
    ? `<div class="admin-list">${users.map((user) => `<p><strong>${user.name}</strong><span>${user.email}</span></p>`).join("")}</div>`
    : '<p class="empty-state">No users registered yet.</p>';

  ordersBox.innerHTML = orders.length > 0
    ? `<div class="order-table">${orders.map((order) => `
      <article class="order-row">
        <div>
          <strong>${order.id}</strong>
          <p>${order.customer} | ${order.email}</p>
        </div>
        <div>
          <strong>${formatPrice(order.total)}</strong>
          <p>${order.itemCount} items | ${order.createdAt}</p>
        </div>
      </article>
    `).join("")}</div>`
    : '<p class="empty-state">No orders placed yet.</p>';
}

function bindGlobalEvents() {
  document.querySelectorAll("#cartButton").forEach((button) => {
    button.addEventListener("click", () => {
      renderCart();
      toggleCart(true);
    });
  });

  const closeCartButton = document.getElementById("closeCartButton");
  if (closeCartButton) {
    closeCartButton.addEventListener("click", () => {
      toggleCart(false);
    });
  }

  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) {
    fillCheckoutForm();
    checkoutForm.addEventListener("submit", handleCheckout);
  }

  const authButton = document.getElementById("authButton");
  if (authButton) {
    authButton.addEventListener("click", () => {
      openAuthDialog("signin");
    });
  }

  const heroAuthButton = document.getElementById("heroAuthButton");
  if (heroAuthButton) {
    heroAuthButton.addEventListener("click", () => {
      openAuthDialog("register");
    });
  }

  const authForm = document.getElementById("authFormShell");
  if (authForm) {
    authForm.addEventListener("submit", handleAuthSubmit);
  }

  const closeAuthButton = document.getElementById("closeAuthButton");
  const authDialog = document.getElementById("authDialog");
  if (closeAuthButton && authDialog) {
    closeAuthButton.addEventListener("click", () => {
      authDialog.close();
    });
  }

  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      setAuthMode(button.dataset.authMode);
    });
  });

  const resetOrdersButton = document.getElementById("resetOrdersButton");
  if (resetOrdersButton) {
    resetOrdersButton.addEventListener("click", () => {
      setOrders([]);
      renderAdmin();
      showToast("Order history cleared.");
    });
  }
}

function init() {
  updateCartCount();
  updateAuthButton();
  bindGlobalEvents();
  renderCart();

  const currentPage = document.body.dataset.page;

  if (currentPage === "home") {
    renderFilters();
    renderCatalog();
  }

  if (currentPage === "product") {
    renderProductDetail();
  }

  if (currentPage === "admin") {
    renderAdmin();
  }
}

document.addEventListener("DOMContentLoaded", init);
