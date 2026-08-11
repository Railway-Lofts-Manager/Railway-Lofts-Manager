import productSeedData from "./ProductSeedData.js";
import { productAnalysisNeedsRefresh, withProductAnalysis } from "./ProductAnalysisService.js";

const STORAGE_KEY = "loftCommanderProductLibrary";

function readProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(saved)) return [];

    // Earlier Railway Lofts builds installed the photographed starter records.
    // Keep that existing private starter library current without seeding products
    // into a new customer's deliberately empty library.
    const hasStarterLibrary = saved.some((product) =>
      product?.seedKey || String(product?.id || "").startsWith("starter-"),
    );
    if (!hasStarterLibrary) return saved;

    const revised = saved.map((product) => {
      const seed = productSeedData.find((candidate) =>
        candidate.seedKey === product?.seedKey || candidate.id === product?.id,
      );
      if (!seed?.seedRevision || Number(product.seedRevision || 0) >= seed.seedRevision) return product;
      if (seed.id !== "starter-electrolit") return product;
      return {
        ...product,
        administration: seed.administration,
        waterInstructions: seed.waterInstructions,
        frequency: seed.frequency,
        programmeStages: seed.programmeStages,
        mixingRules: seed.mixingRules,
        historicalUses: seed.historicalUses,
        seedRevision: seed.seedRevision,
      };
    });
    const existingKeys = new Set(revised.flatMap((product) => [product?.seedKey, product?.id]).filter(Boolean));
    const additions = productSeedData.filter((product) =>
      !existingKeys.has(product.seedKey) && !existingKeys.has(product.id),
    );
    const merged = (additions.length ? [...additions, ...revised] : revised).map((product) =>
      productAnalysisNeedsRefresh(product) ? withProductAnalysis(product) : product,
    );
    if (additions.length || merged.some((product,index) => product !== saved[index])) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    }
    return merged;
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
    const saved = withProductAnalysis({
      ...product,
      id: product.id || createId(),
      createdAt: product.createdAt || now,
      updatedAt: now,
    });
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

  reanalyseProducts() {
    products = products.map((product) => withProductAnalysis(product));
    save();
    return [...products];
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
