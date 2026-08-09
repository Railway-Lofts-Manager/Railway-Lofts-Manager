const STORAGE_KEY = "loftCommanderProductLibrary";

function readProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

// Each fancier owns a private library. New installations deliberately start
// empty; products arrive only through that user's own entries or restored backup.
let products = readProducts();
const listeners = new Set();

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  listeners.forEach((listener) => listener([...products]));
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ||
    `product-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const productStore = {
  getProducts() {
    return [...products];
  },

  getProduct(id) {
    return products.find((product) => product.id === id) || null;
  },

  saveProduct(product) {
    const now = new Date().toISOString();
    const saved = {
      ...product,
      id: product.id || createId(),
      createdAt: product.createdAt || now,
      updatedAt: now,
    };
    const index = products.findIndex((item) => item.id === saved.id);
    if (index >= 0) products = products.map((item) => item.id === saved.id ? saved : item);
    else products = [saved, ...products];
    save();
    return saved;
  },

  archiveProduct(id) {
    products = products.map((product) =>
      product.id === id
        ? { ...product, archived: true, updatedAt: new Date().toISOString() }
        : product,
    );
    save();
  },

  restoreProduct(id) {
    products = products.map((product) =>
      product.id === id
        ? { ...product, archived: false, updatedAt: new Date().toISOString() }
        : product,
    );
    save();
  },

  deleteProduct(id) {
    products = products.filter((product) => product.id !== id);
    save();
  },

  clear() {
    products = [];
    localStorage.removeItem(STORAGE_KEY);
    listeners.forEach((listener) => listener([]));
  },

  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export { STORAGE_KEY as PRODUCT_STORAGE_KEY };
export default productStore;
