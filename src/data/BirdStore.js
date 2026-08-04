// =====================================================
// Loft Commander BirdStore
// Central Bird Database
// =====================================================

const STORAGE_KEY = "loftCommanderBirdStore";

class BirdStore {
  constructor() {
    this.listeners = [];
    this.birds = this.loadFromStorage();

    // Repairs missing or duplicated internal LC IDs.
    this.repairBirdIds();
  }

  // -------------------------
  // Local Storage
  // -------------------------

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) {
        return [];
      }

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
  // Subscriptions
  // -------------------------

  subscribe(listener) {
    this.listeners.push(listener);

    return () => {
      this.listeners = this.listeners.filter(
        (currentListener) => currentListener !== listener
      );
    };
  }

  notify() {
    this.saveToStorage();

    this.listeners.forEach((listener) => {
      listener(this.getBirds());
    });
  }

  // -------------------------
  // Bird ID Management
  // -------------------------

  getBirdIdNumber(birdId) {
    const match = String(birdId || "").match(/^LC-(\d+)$/);

    return match ? Number(match[1]) : null;
  }

  generateBirdId() {
    const usedNumbers = this.birds
      .map((bird) => this.getBirdIdNumber(bird.birdId))
      .filter((number) => Number.isInteger(number));

    const nextNumber = usedNumbers.length
      ? Math.max(...usedNumbers) + 1
      : 1;

    return `LC-${String(nextNumber).padStart(6, "0")}`;
  }

  repairBirdIds() {
    const usedIds = new Set();
    let highestNumber = 0;
    let changed = false;

    this.birds.forEach((bird) => {
      const number = this.getBirdIdNumber(bird.birdId);

      if (number !== null) {
        highestNumber = Math.max(highestNumber, number);
      }
    });

    this.birds = this.birds.map((bird) => {
      const existingId = String(bird.birdId || "");
      const number = this.getBirdIdNumber(existingId);

      const idIsValid =
        number !== null &&
        !usedIds.has(existingId);

      if (idIsValid) {
        usedIds.add(existingId);
        return bird;
      }

      changed = true;
      highestNumber += 1;

      const newBirdId =
        `LC-${String(highestNumber).padStart(6, "0")}`;

      usedIds.add(newBirdId);

      return {
        ...bird,
        birdId: newBirdId,
      };
    });

    if (changed) {
      this.saveToStorage();
    }
  }

  // -------------------------
  // Get Birds
  // -------------------------

  getBirds() {
    return [...this.birds];
  }

  getBird(ringNumber) {
    const normalisedRing = String(ringNumber || "")
      .trim()
      .toUpperCase();

    return this.birds.find(
      (bird) =>
        String(bird.ringNumber || "")
          .trim()
          .toUpperCase() === normalisedRing
    );
  }

  // -------------------------
  // Add Bird
  // -------------------------

  addBird(bird) {
    const normalisedRing = String(bird.ringNumber || "")
      .trim()
      .toUpperCase();

    if (!normalisedRing) {
      return false;
    }

    const exists = this.birds.some(
      (existingBird) =>
        String(existingBird.ringNumber || "")
          .trim()
          .toUpperCase() === normalisedRing
    );

    if (exists) {
      return false;
    }

    const newBird = {
      ...bird,
      ringNumber: normalisedRing,
      birdId: bird.birdId || this.generateBirdId(),
      createdAt:
        bird.createdAt || new Date().toISOString(),
    };

    this.birds.push(newBird);
    this.notify();

    return true;
  }

  // -------------------------
  // Update Bird
  // -------------------------

  updateBird(ringNumber, updates) {
    const normalisedRing = String(ringNumber || "")
      .trim()
      .toUpperCase();

    this.birds = this.birds.map((bird) => {
      const currentRing = String(bird.ringNumber || "")
        .trim()
        .toUpperCase();

      if (currentRing !== normalisedRing) {
        return bird;
      }

      return {
        ...bird,
        ...updates,

        // Never replace the permanent internal ID accidentally.
        birdId: bird.birdId || updates.birdId,
        updatedAt: new Date().toISOString(),
      };
    });

    this.notify();
  }

  // -------------------------
  // Delete Bird
  // -------------------------

  deleteBird(ringNumber) {
    const normalisedRing = String(ringNumber || "")
      .trim()
      .toUpperCase();

    this.birds = this.birds.filter(
      (bird) =>
        String(bird.ringNumber || "")
          .trim()
          .toUpperCase() !== normalisedRing
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
        imported += 1;
      }
    });

    return imported;
  }

  // -------------------------
  // Development / Reset
  // -------------------------

  clear() {
    this.birds = [];
    this.notify();
  }
}

const birdStore = new BirdStore();

export default birdStore;