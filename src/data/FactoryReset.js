import birdStore from "./BirdStore";
import loftStore from "./LoftStore";
import settingsStore from "./SettingsStore";
import ringStore from "./RingStore";
import breedingSeasonStore from "./BreedingSeasonStore";

const RESET_COMPLETE_KEY = "loftCommanderFactoryResetComplete";

const STORAGE_KEYS = [
  "loftCommanderBirdStore",
  "loftCommanderLoftStore",
  "loftCommanderCustomerSettings",
  "loftCommanderRingRegister",
  "loftCommanderBreedingSeasons",
  "loft-commander-boxes",
  "loft-commander-birds",
  "railway-lofts-birds",
];

function storedObjectCount(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "{}");
    return value && typeof value === "object" ? Object.keys(value).length : 0;
  } catch {
    return 0;
  }
}

export function getFactoryResetPreview() {
  const birds = birdStore.getBirds();

  return {
    birds: birds.length,
    rings: ringStore.getRings().length,
    lofts: loftStore.getLofts().length,
    breedingSeasons: breedingSeasonStore.getSeasons().length,
    nestBoxAssignments: storedObjectCount("loft-commander-boxes"),
    documents: birds.reduce(
      (total, bird) => total + (Array.isArray(bird.documents) ? bird.documents.length : 0),
      0,
    ),
  };
}

export function consumeFactoryResetResult() {
  try {
    const saved = sessionStorage.getItem(RESET_COMPLETE_KEY);
    sessionStorage.removeItem(RESET_COMPLETE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

export default function factoryReset() {
  const removed = getFactoryResetPreview();

  birdStore.clear();
  loftStore.clear();
  ringStore.clear();
  breedingSeasonStore.clear();
  settingsStore.reset();

  STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });

  sessionStorage.setItem(
    RESET_COMPLETE_KEY,
    JSON.stringify({ ...removed, completedAt: new Date().toISOString() }),
  );

  window.location.reload();
}
