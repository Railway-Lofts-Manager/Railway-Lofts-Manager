const STORAGE_KEY = "loftCommanderLoftStore";

class LoftStore {
  constructor() {
    this.listeners = [];
    this.lofts = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const lofts = saved ? JSON.parse(saved) : [];

      return Array.isArray(lofts) ? lofts : [];
    } catch (error) {
      console.error("Unable to load LoftStore", error);
      return [];
    }
  }

  saveToStorage() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.lofts),
    );
  }

  subscribe(listener) {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter(
        (current) => current !== listener,
      );
    };
  }

  notify() {
    this.saveToStorage();

    this.listeners.forEach((listener) => {
      listener(this.getLofts());
    });
  }

  getLofts() {
    return this.lofts.map((loft) => ({
      ...loft,
    }));
  }

  replaceLofts(lofts) {
    this.lofts = lofts.map((loft) => ({
      ...loft,
    }));

    this.notify();
  }

  addLoft(loft) {
    this.lofts.push({
      ...loft,
    });

    this.notify();
  }

  updateLoft(loftId, updates) {
    this.lofts = this.lofts.map((loft) =>
      loft.id === loftId
        ? { ...loft, ...updates, id: loft.id }
        : loft,
    );

    this.notify();
  }

  removeLoft(loftId) {
    this.lofts = this.lofts.filter(
      (loft) => loft.id !== loftId,
    );

    this.notify();
  }

  clear() {
    this.lofts = [];
    this.notify();
  }
}

const loftStore = new LoftStore();

export default loftStore;