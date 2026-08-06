const STORAGE_KEY = "loftCommanderRingRegister";

function loadRings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const rings = saved ? JSON.parse(saved) : [];
    return Array.isArray(rings) ? rings : [];
  } catch (error) {
    console.error("Unable to load the Ring Register", error);
    return [];
  }
}

class RingStore {
  constructor() {
    this.rings = loadRings();
    this.listeners = [];
  }

  getRings() {
    return this.rings.map((ring) => ({ ...ring }));
  }

  addBatch(ringNumbers) {
    const existing = new Set(
      this.rings.map((ring) => ring.ringNumber.toUpperCase()),
    );
    const duplicate = ringNumbers.find((ring) =>
      existing.has(ring.toUpperCase()),
    );

    if (duplicate) {
      throw new Error(`${duplicate} is already in the Ring Register.`);
    }

    const batchId =
      globalThis.crypto?.randomUUID?.() || `batch-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const newRings = ringNumbers.map((ringNumber) => ({
      ringNumber,
      status: "available",
      assignedBirdId: "",
      batchId,
      createdAt,
    }));

    this.rings = [...this.rings, ...newRings];
    this.save();
    return newRings.length;
  }

  assignToBreedingEntry(
    entryId,
    currentRingNumber,
    nextRingNumber,
  ) {
    const current = currentRingNumber.toUpperCase();
    const next = nextRingNumber.toUpperCase();
    const selectedRing = this.rings.find(
      (ring) => ring.ringNumber.toUpperCase() === next,
    );

    if (
      next &&
      (!selectedRing ||
        (selectedRing.status !== "available" &&
          selectedRing.assignedEntryId !== entryId))
    ) {
      throw new Error("That ring is no longer available.");
    }

    this.rings = this.rings.map((ring) => {
      const ringNumber = ring.ringNumber.toUpperCase();

      if (ringNumber === current && ring.assignedEntryId === entryId) {
        return {
          ...ring,
          status: "available",
          assignedEntryId: "",
        };
      }

      if (ringNumber === next) {
        return {
          ...ring,
          status: "assigned",
          assignedEntryId: entryId,
        };
      }

      return ring;
    });

    this.save();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(
        (current) => current !== listener,
      );
    };
  }

  clear() {
    this.rings = [];
    this.save();
  }

  save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.rings));
    this.listeners.forEach((listener) => listener(this.getRings()));
  }
}

const ringStore = new RingStore();

export { STORAGE_KEY };
export default ringStore;
