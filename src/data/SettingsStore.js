const STORAGE_KEY =
  "loftCommanderCustomerSettings";

const emptySettings = {
  ownerName: "",
  loftName: "",
  loftNumber: "",
  location: "",
  season: new Date().getFullYear(),
  setupComplete: false,
};

class SettingsStore {
  constructor() {
    this.listeners = [];
    this.settings = this.loadFromStorage();
  }

  loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      return saved
        ? { ...emptySettings, ...JSON.parse(saved) }
        : { ...emptySettings };
    } catch (error) {
      console.error(
        "Unable to load customer settings",
        error,
      );

      return { ...emptySettings };
    }
  }

  getSettings() {
    return { ...this.settings };
  }

  updateSettings(updates) {
    this.settings = {
      ...this.settings,
      ...updates,
    };

    this.notify();
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
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(this.settings),
    );

    this.listeners.forEach((listener) => {
      listener(this.getSettings());
    });
  }

  reset() {
    this.settings = { ...emptySettings };
    this.notify();
  }
}

const settingsStore = new SettingsStore();

export default settingsStore;