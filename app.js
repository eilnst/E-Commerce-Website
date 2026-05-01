const STORAGE_KEYS = {
  cart: "northstar-cart",
  user: "northstar-user",
  users: "northstar-users",
  orders: "northstar-orders"
  cart: "apnakart-cart",
  user: "apnakart-user",
  users: "apnakart-users",
  orders: "apnakart-orders"
};

const state = {
  category: "All"
};

function readStorage(key, fallback) {
function readStorage(key, fallbackValue) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
    const savedValue = localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : fallbackValue;
  } catch {
    return fallback;
    return fallbackValue;
  }
}

function setCart(cart) {
  writeStorage(STORAGE_KEYS.cart, cart);
  updateCartCount();
}

function getCurrentUser() {
  return readStorage(STORAGE_KEYS.user, null);
}

function getUsers() {
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
  writeStorage(STORAGE_KEYS.orders, orders);
}

function currency(value) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
function formatPrice(price) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(price);
}

function showToast(message) {

  toast.textContent = message;
  toast.classList.add("visible");
  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => toast.classList.remove("visible"), 2200);

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => {
    toast.classList.remove("visible");
  }, 2200);
}

function updateCartCount() {
  const count = getCart().reduce((sum, item) => sum + item.quantity, 0);
  document.querySelectorAll("#cartCount").forEach((node) => {
    node.textContent = count;
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
  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  const existingItem = cart.find((item) => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }

  setCart(cart);
  renderCart();
  showToast("Item added to cart.");
  showToast("Product added to cart.");
}

function updateQuantity(productId, delta) {
  const cart = getCart()
    .map((item) => item.productId === productId ? { ...item, quantity: item.quantity + delta } : item)
function changeQuantity(productId, changeValue) {
  const updatedCart = getCart()
    .map((item) => {
      if (item.productId === productId) {
        return { ...item, quantity: item.quantity + changeValue };
      }
      return item;
    })
    .filter((item) => item.quantity > 0);
  setCart(cart);

  setCart(updatedCart);
  renderCart();
}

function cartLineItems() {
  return getCart().map((item) => {
    const product = state.products.find((entry) => entry.id === item.productId);
    return product ? { ...product, quantity: item.quantity } : null;
  }).filter(Boolean);
function getCartItemsWithDetails() {
  return getCart()
    .map((item) => {
      const product = getProductById(item.productId);
      return product ? { ...product, quantity: item.quantity } : null;
    })
    .filter(Boolean);
}

function renderCart() {
  const cartItemsNode = document.getElementById("cartItems");
  const cartTotalNode = document.getElementById("cartTotal");
  if (!cartItemsNode || !cartTotalNode) {
  const cartItemsBox = document.getElementById("cartItems");
  const cartTotalBox = document.getElementById("cartTotal");

  if (!cartItemsBox || !cartTotalBox) {
    return;
  }

  const items = cartLineItems();
  if (!items.length) {
    cartItemsNode.innerHTML = '<p class="empty-state">Your cart is empty. Add a few products to start checkout.</p>';
    cartTotalNode.textContent = currency(0);
  const items = getCartItemsWithDetails();

  if (items.length === 0) {
    cartItemsBox.innerHTML = '<p class="empty-state">Your cart is empty. Add some products first.</p>';
    cartTotalBox.textContent = formatPrice(0);
    return;
  }

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartItemsNode.innerHTML = items.map((item) => `
    <article class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div>
        <h4>${item.name}</h4>
        <p>${currency(item.price)}</p>
        <div class="quantity-row">
          <button type="button" data-qty="${item.id}" data-delta="-1">−</button>
          <span>${item.quantity}</span>
          <button type="button" data-qty="${item.id}" data-delta="1">+</button>
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
      </div>
    </article>
  `).join("");
  cartTotalNode.textContent = currency(total);
      </article>
    `;
  }).join("");

  cartTotalBox.textContent = formatPrice(total);

  cartItemsNode.querySelectorAll("[data-qty]").forEach((button) => {
    button.addEventListener("click", () => updateQuantity(button.dataset.qty, Number(button.dataset.delta)));
  cartItemsBox.querySelectorAll("[data-product-id]").forEach((button) => {
    button.addEventListener("click", () => {
      changeQuantity(button.dataset.productId, Number(button.dataset.change));
    });
  });
}

function toggleCart(show) {
  const drawer = document.getElementById("cartDrawer");
  if (!drawer) {
function toggleCart(showCart) {
  const cartDrawer = document.getElementById("cartDrawer");
  if (!cartDrawer) {
    return;
  }
  drawer.classList.toggle("open", show);
  drawer.setAttribute("aria-hidden", String(!show));

  cartDrawer.classList.toggle("open", showCart);
  cartDrawer.setAttribute("aria-hidden", String(!showCart));
}

function renderFilters() {
  const row = document.getElementById("categoryFilters");
  if (!row) {
  const filterBox = document.getElementById("categoryFilters");
  if (!filterBox) {
    return;
  }

  const categories = ["All", ...new Set(state.products.map((item) => item.category))];
  row.innerHTML = categories.map((category) => `
    <button class="filter-chip ${category === state.category ? "active" : ""}" type="button" data-category="${category}">
  const categories = ["All", ...new Set(state.products.map((product) => product.category))];

  filterBox.innerHTML = categories.map((category) => `
    <button class="filter-chip ${state.category === category ? "active" : ""}" type="button" data-category="${category}">
      ${category}
    </button>
  `).join("");

  row.querySelectorAll("[data-category]").forEach((button) => {
  filterBox.querySelectorAll("[data-category]").forEach((button) => {
    button.addEventListener("click", () => {
      state.category = button.dataset.category;
      renderFilters();
}

function renderCatalog() {
  const grid = document.getElementById("productGrid");
  if (!grid) {
  const productGrid = document.getElementById("productGrid");
  if (!productGrid) {
    return;
  }

  const products = state.category === "All"
  const filteredProducts = state.category === "All"
    ? state.products
    : state.products.filter((item) => item.category === state.category);
    : state.products.filter((product) => product.category === state.category);

  grid.innerHTML = products.map((product) => `
  productGrid.innerHTML = filteredProducts.map((product) => `
    <article class="product-card">
      <div class="product-image-wrap">
        <img src="${product.image}" alt="${product.name}">
            <p class="mini-label">${product.category}</p>
            <h3>${product.name}</h3>
          </div>
          <strong>${currency(product.price)}</strong>
          <strong>${formatPrice(product.price)}</strong>
        </div>
        <p>${product.summary}</p>
        <div class="product-footer">
          <a class="text-link" href="product.html?id=${product.id}">View details</a>
          <button class="pill-button alt" type="button" data-add="${product.id}">Add to cart</button>
          <a class="text-link" href="product.html?id=${product.id}">View Details</a>
          <button class="pill-button alt" type="button" data-add="${product.id}">Add to Cart</button>
        </div>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll("[data-add]").forEach((button) => {
  productGrid.querySelectorAll("[data-add]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.add));
  });
}

function renderProductDetail() {
  const container = document.getElementById("productDetail");
  if (!container) {
  const detailBox = document.getElementById("productDetail");
  if (!detailBox) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const product = state.products.find((entry) => entry.id === params.get("id")) || state.products[0];
  const urlParams = new URLSearchParams(window.location.search);
  const selectedId = urlParams.get("id");
  const product = getProductById(selectedId) || state.products[0];

  container.innerHTML = `
  detailBox.innerHTML = `
    <section class="detail-gallery">
      <img src="${product.image}" alt="${product.name}">
    </section>
      <p class="eyebrow">${product.category}</p>
      <h1>${product.name}</h1>
      <div class="detail-meta">
        <strong>${currency(product.price)}</strong>
        <span>${product.rating} / 5 rating</span>
        <strong>${formatPrice(product.price)}</strong>
        <span>${product.rating} / 5 Rating</span>
      </div>
      <p class="detail-text">${product.description}</p>
      <div class="spec-list">
        ${product.specs.map((item) => `<span>${item}</span>`).join("")}
        ${product.specs.map((spec) => `<span>${spec}</span>`).join("")}
      </div>
      <div class="hero-actions">
        <button class="pill-button" type="button" id="detailAddToCart">Add to cart</button>
        <a class="ghost-button" href="index.html#catalog">Continue shopping</a>
        <button class="pill-button" type="button" id="detailAddToCart">Add to Cart</button>
        <a class="ghost-button" href="index.html#catalog">Continue Shopping</a>
      </div>
    </section>
  `;

  document.getElementById("detailAddToCart").addEventListener("click", () => addToCart(product.id));
  document.getElementById("detailAddToCart").addEventListener("click", () => {
    addToCart(product.id);
  });
}

function updateAuthButton() {
  const currentUser = getCurrentUser();
  const authButton = document.getElementById("authButton");
  const user = getCurrentUser();

  if (authButton) {
    authButton.textContent = currentUser ? `Hi, ${currentUser.name.split(" ")[0]}` : "Sign in";
    authButton.textContent = user ? `Hi, ${user.name.split(" ")[0]}` : "Login";
  }
}

function openAuthDialog(mode = "signin") {
function openAuthDialog(mode) {
  const dialog = document.getElementById("authDialog");
  if (!dialog) {
    return;
  }
  dialog.dataset.mode = mode;
  syncAuthMode(mode);

  setAuthMode(mode);
  dialog.showModal();
}

function syncAuthMode(mode) {
function setAuthMode(mode) {
  const dialog = document.getElementById("authDialog");
  const submitButton = document.getElementById("authSubmitButton");
  const status = document.getElementById("authStatus");
  const nameField = document.getElementById("authName");
  if (!dialog || !submitButton || !status || !nameField) {
  const statusText = document.getElementById("authStatus");
  const nameInput = document.getElementById("authName");

  if (!dialog || !submitButton || !statusText || !nameInput) {
    return;
  }

  dialog.dataset.mode = mode;
  submitButton.textContent = mode === "signin" ? "Sign in" : "Create account";
  status.textContent = mode === "signin"
    ? "Sign in with an existing local account."
    : "Create a demo account to personalize checkout.";
  nameField.style.display = mode === "signin" ? "none" : "block";
  submitButton.textContent = mode === "signin" ? "Login" : "Create Account";
  statusText.textContent = mode === "signin"
    ? "Login with your registered email and password."
    : "Create a demo account for this project.";
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
  const mode = dialog?.dataset.mode || "signin";
  const mode = dialog ? dialog.dataset.mode : "signin";
  const name = document.getElementById("authName").value.trim();
  const email = document.getElementById("authEmail").value.trim().toLowerCase();
  const password = document.getElementById("authPassword").value;
      showToast("Please enter your name.");
      return;
    }
    if (users.some((user) => user.email === email)) {
      showToast("That email already exists.");

    const emailExists = users.some((user) => user.email === email);
    if (emailExists) {
      showToast("This email is already registered.");
      return;
    }

    const newUser = { name, email, password };
    users.push(newUser);
    setUsers(users);
    writeStorage(STORAGE_KEYS.user, { name, email });
    setCurrentUser({ name, email });
    dialog.close();
    updateAuthButton();
    syncCheckoutIdentity();
    fillCheckoutForm();
    showToast("Account created successfully.");
    return;
  }

  const existingUser = users.find((user) => user.email === email && user.password === password);
  if (!existingUser) {
    showToast("No matching account found.");
  const foundUser = users.find((user) => user.email === email && user.password === password);
  if (!foundUser) {
    showToast("User not found. Please register first.");
    return;
  }
  writeStorage(STORAGE_KEYS.user, { name: existingUser.name, email: existingUser.email });

  setCurrentUser({ name: foundUser.name, email: foundUser.email });
  dialog.close();
  updateAuthButton();
  syncCheckoutIdentity();
  showToast("Signed in successfully.");
}

function syncCheckoutIdentity() {
  const currentUser = getCurrentUser();
  const checkoutName = document.getElementById("checkoutName");
  const checkoutEmail = document.getElementById("checkoutEmail");
  if (currentUser && checkoutName && checkoutEmail) {
    checkoutName.value = currentUser.name;
    checkoutEmail.value = currentUser.email;
  }
  fillCheckoutForm();
  showToast("Login successful.");
}

function handleCheckout(event) {
  event.preventDefault();
  const currentUser = getCurrentUser();
  const items = cartLineItems();
  if (!items.length) {

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
    customer: currentUser?.name || name,
    customer: currentUser ? currentUser.name : name,
    email,
    address,
    total: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    items: items.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price })),
    createdAt: new Date().toLocaleString()
    total,
    itemCount: totalItems,
    createdAt: new Date().toLocaleString("en-IN")
  };

  const orders = getOrders();
  event.target.reset();
  renderCart();
  toggleCart(false);
  showToast("Order placed. Check the admin page for history.");
  showToast("Order placed successfully.");
}

function renderAdmin() {
  const catalogNode = document.getElementById("adminCatalog");
  const usersNode = document.getElementById("adminUsers");
  const ordersNode = document.getElementById("adminOrders");
  if (!catalogNode || !usersNode || !ordersNode) {
  const productSummaryBox = document.getElementById("adminCatalog");
  const usersBox = document.getElementById("adminUsers");
  const ordersBox = document.getElementById("adminOrders");

  if (!productSummaryBox || !usersBox || !ordersBox) {
    return;
  }

  const users = getUsers();
  const orders = getOrders();
  const byCategory = state.products.reduce((acc, product) => {
    acc[product.category] = (acc[product.category] || 0) + 1;
    return acc;
  }, {});
  const categoryCount = {};

  state.products.forEach((product) => {
    if (!categoryCount[product.category]) {
      categoryCount[product.category] = 0;
    }
    categoryCount[product.category] += 1;
  });

  catalogNode.innerHTML = `
  productSummaryBox.innerHTML = `
    <div class="admin-list">
      ${Object.entries(byCategory).map(([category, count]) => `<p><strong>${count}</strong> ${category} products</p>`).join("")}
      <p><strong>${state.products.length}</strong> total SKUs</p>
      ${Object.keys(categoryCount).map((category) => `<p><strong>${categoryCount[category]}</strong> ${category} products</p>`).join("")}
      <p><strong>${state.products.length}</strong> total products</p>
    </div>
  `;

  usersNode.innerHTML = users.length
  usersBox.innerHTML = users.length > 0
    ? `<div class="admin-list">${users.map((user) => `<p><strong>${user.name}</strong><span>${user.email}</span></p>`).join("")}</div>`
    : '<p class="empty-state">No customer accounts yet. Register from the storefront to populate this area.</p>';
    : '<p class="empty-state">No users registered yet.</p>';

  ordersNode.innerHTML = orders.length
  ordersBox.innerHTML = orders.length > 0
    ? `<div class="order-table">${orders.map((order) => `
      <article class="order-row">
        <div>
          <strong>${order.id}</strong>
          <p>${order.customer} · ${order.email}</p>
          <p>${order.customer} | ${order.email}</p>
        </div>
        <div>
          <strong>${currency(order.total)}</strong>
          <p>${order.itemCount} items · ${order.createdAt}</p>
          <strong>${formatPrice(order.total)}</strong>
          <p>${order.itemCount} items | ${order.createdAt}</p>
        </div>
      </article>
    `).join("")}</div>`
    : '<p class="empty-state">No orders yet. Complete a checkout from the storefront to test admin reporting.</p>';
    : '<p class="empty-state">No orders placed yet.</p>';
}

function bindGlobalEvents() {

  const closeCartButton = document.getElementById("closeCartButton");
  if (closeCartButton) {
    closeCartButton.addEventListener("click", () => toggleCart(false));
    closeCartButton.addEventListener("click", () => {
      toggleCart(false);
    });
  }

  const checkoutForm = document.getElementById("checkoutForm");
  if (checkoutForm) {
    syncCheckoutIdentity();
    fillCheckoutForm();
    checkoutForm.addEventListener("submit", handleCheckout);
  }

  const authButton = document.getElementById("authButton");
  if (authButton) {
    authButton.addEventListener("click", () => openAuthDialog("signin"));
    authButton.addEventListener("click", () => {
      openAuthDialog("signin");
    });
  }

  const heroAuthButton = document.getElementById("heroAuthButton");
  if (heroAuthButton) {
    heroAuthButton.addEventListener("click", () => openAuthDialog("register"));
    heroAuthButton.addEventListener("click", () => {
      openAuthDialog("register");
    });
  }

  const authFormShell = document.getElementById("authFormShell");
  if (authFormShell) {
    authFormShell.addEventListener("submit", handleAuthSubmit);
  const authForm = document.getElementById("authFormShell");
  if (authForm) {
    authForm.addEventListener("submit", handleAuthSubmit);
  }

  const closeAuthButton = document.getElementById("closeAuthButton");
  const authDialog = document.getElementById("authDialog");
  if (closeAuthButton && authDialog) {
    closeAuthButton.addEventListener("click", () => authDialog.close());
    closeAuthButton.addEventListener("click", () => {
      authDialog.close();
    });
  }

  document.querySelectorAll("[data-auth-mode]").forEach((button) => {
    button.addEventListener("click", () => syncAuthMode(button.dataset.authMode));
    button.addEventListener("click", () => {
      setAuthMode(button.dataset.authMode);
    });
  });

  const resetOrdersButton = document.getElementById("resetOrdersButton");
  bindGlobalEvents();
  renderCart();

  const page = document.body.dataset.page;
  if (page === "home") {
  const currentPage = document.body.dataset.page;

  if (currentPage === "home") {
    renderFilters();
    renderCatalog();
  }
  if (page === "product") {

  if (currentPage === "product") {
    renderProductDetail();
  }
  if (page === "admin") {

  if (currentPage === "admin") {
    renderAdmin();
  }
}
