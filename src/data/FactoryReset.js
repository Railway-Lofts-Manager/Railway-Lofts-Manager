import birdStore from "./BirdStore";
import loftStore from "./LoftStore";
import settingsStore from "./SettingsStore";

const STORAGE_KEYS = [
  "loftCommanderBirdStore",
  "loftCommanderLoftStore",
  "loftCommanderCustomerSettings",
  "loft-commander-boxes",
  "loft-commander-birds",
  "railway-lofts-birds",
];

export default function factoryReset() {
  birdStore.clear();
  loftStore.clear();
  settingsStore.reset();

  STORAGE_KEYS.forEach((key) => {
    localStorage.removeItem(key);
  });

  window.location.reload();
}