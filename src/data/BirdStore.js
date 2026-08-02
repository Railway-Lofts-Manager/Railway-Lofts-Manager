// =====================================================
// Loft Commander BirdStore
// Central Bird Database
// =====================================================

const STORAGE_KEY = "loftCommanderBirdStore";

class BirdStore {
  constructor() {
    this.listeners = [];
    this.birds = this.loadFromStorage();
  }

  // -------------------------
  // Local Storage
  // -------------------------

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return [];

      const birds = JSON.parse(saved);

      return Array.isArray(birds) ? birds : [];
    } catch (error) {
      console.error("Unable to load BirdStore", error);
      return [];
    }
  }

  saveToStorage() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(this.birds)
      );
    } catch (error) {
      console.error("Unable to save BirdStore", error);
    }
  }

  // -------------------------
  // Subscribe
  // -------------------------

  subscribe(listener) {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter(
        (l) => l !== listener
      );
    };
  }

  notify() {
    this.saveToStorage();

    this.listeners.forEach((listener) =>
      listener(this.getBirds())
    );
  }

  // -------------------------
  // Get Birds
  // -------------------------

  getBirds() {
    return [...this.birds];
  }

  getBird(ringNumber) {
    return this.birds.find(
      (bird) => bird.ringNumber === ringNumber
    );
  }

  // -------------------------
  // Add Bird
  // -------------------------

  addBird(bird) {
    const exists = this.birds.some(
      (b) => b.ringNumber === bird.ringNumber
    );

    if (exists) {
      return false;
    }

    this.birds.push({
      ...bird,
      createdAt: bird.createdAt || new Date().toISOString(),
    });

    this.notify();

    return true;
  }

  // -------------------------
  // Update Bird
  // -------------------------

  updateBird(ringNumber, updates) {
    this.birds = this.birds.map((bird) =>
      bird.ringNumber === ringNumber
        ? { ...bird, ...updates }
        : bird
    );

    this.notify();
  }

  // -------------------------
  // Delete Bird
  // Later becomes Archive
  // -------------------------

  deleteBird(ringNumber) {
    this.birds = this.birds.filter(
      (bird) => bird.ringNumber !== ringNumber
    );

    this.notify();
  }

  // -------------------------
  // Bulk Import
  // -------------------------

  importBirds(birds) {
    let imported = 0;

    birds.forEach((bird) => {
      if (this.addBird(bird)) {
        imported++;
      }
    });

    return imported;
  }

  // -------------------------
  // Development
  // -------------------------

  clear() {
    this.birds = [];
    this.notify();
  }
}

const birdStore = new BirdStore();

export default birdStore;