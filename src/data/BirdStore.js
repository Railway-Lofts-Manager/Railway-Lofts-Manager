// =====================================================
// Loft Commander BirdStore
// Central Bird Database
// =====================================================

import { withCalculatedAge } from "./BirdAgeService";

const STORAGE_KEY = "loftCommanderBirdStore";

function createMovementId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `move-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function sameLoft(currentBird, updates) {
  const currentId = String(currentBird.loftId || "");
  const nextId = String(updates.loftId || "");

  if (currentId && nextId) {
    return currentId === nextId;
  }

  return String(currentBird.loft || "").trim().toLowerCase() ===
    String(updates.loft || "").trim().toLowerCase();
}

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
    return this.birds.map((bird) => withCalculatedAge(bird));
  }

  getBird(ringNumber) {
    const normalisedRing = String(ringNumber || "")
      .trim()
      .toUpperCase();

    const bird = this.birds.find(
      (bird) =>
        String(bird.ringNumber || "")
          .trim()
          .toUpperCase() === normalisedRing
    );

    return bird ? withCalculatedAge(bird) : undefined;
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

    const initialHistory = Array.isArray(bird.loftHistory)
      ? bird.loftHistory
      : [];

    const newBird = {
      ...bird,
      ringNumber: normalisedRing,
      birdId: bird.birdId || this.generateBirdId(),
      createdAt:
        bird.createdAt || new Date().toISOString(),
      loftHistory:
        initialHistory.length > 0 || !bird.loft
          ? initialHistory
          : [
              {
                id: createMovementId(),
                date: bird.loftMoveDate || today(),
                fromLoftId: "",
                fromLoftName: "",
                loftId: bird.loftId || "",
                loftName: bird.loft,
                reason: "Initial loft assignment",
              },
            ],
    };

    delete newBird.loftMoveDate;
    delete newBird.loftMoveReason;
    delete newBird.ageInYears;
    delete newBird.ageCategory;
    delete newBird.ringYear;

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

      const loftWasIncluded =
        Object.prototype.hasOwnProperty.call(updates, "loftId") ||
        Object.prototype.hasOwnProperty.call(updates, "loft");

      const destinationExists = Boolean(
        updates.loftId || updates.loft,
      );

      const hasMoved =
        loftWasIncluded &&
        destinationExists &&
        !sameLoft(bird, updates);

      const existingHistory = Array.isArray(bird.loftHistory)
        ? bird.loftHistory
        : [];

      const nextBird = {
        ...bird,
        ...updates,

        // Never replace the permanent internal ID accidentally.
        birdId: bird.birdId || updates.birdId,
        loftHistory: hasMoved
          ? [
              ...existingHistory,
              {
                id: createMovementId(),
                date: updates.loftMoveDate || today(),
                fromLoftId: bird.loftId || "",
                fromLoftName: bird.loft || "",
                loftId: updates.loftId || "",
                loftName: updates.loft || "",
                reason:
                  updates.loftMoveReason ||
                  "Loft assignment updated",
              },
            ]
          : existingHistory,
        updatedAt: new Date().toISOString(),
      };

      delete nextBird.loftMoveDate;
      delete nextBird.loftMoveReason;
      delete nextBird.ageInYears;
      delete nextBird.ageCategory;
      delete nextBird.ringYear;

      return nextBird;
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
