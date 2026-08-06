import {
  createBreedingSeason,
} from "./BreedingSeasonFactory";

const STORAGE_KEY =
  "loftCommanderBreedingSeasons";

function copy(value) {
  return JSON.parse(JSON.stringify(value));
}

class BreedingSeasonStore {
  constructor() {
    this.listeners = [];
    this.seasons = this.load();
  }

  load() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const seasons = saved ? JSON.parse(saved) : [];

      return Array.isArray(seasons) ? seasons : [];
    } catch {
      return [];
    }
  }

  getSeasons() {
    return copy(this.seasons);
  }

  getActiveSeason() {
    const season = this.seasons.find(
      (item) => item.status === "active",
    );

    return season ? copy(season) : null;
  }

  ensureActiveSeason(year) {
    const activeSeason = this.getActiveSeason();

    if (activeSeason) {
      return activeSeason;
    }

    const newSeason = createBreedingSeason(year);
    this.seasons.push(newSeason);
    this.notify();

    return copy(newSeason);
  }

  saveSeason(updatedSeason) {
    this.seasons = this.seasons.map((season) =>
      season.id === updatedSeason.id
        ? copy(updatedSeason)
        : season,
    );

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
      JSON.stringify(this.seasons),
    );

    this.listeners.forEach((listener) => {
      listener(this.getSeasons());
    });
  }

  clear() {
    this.seasons = [];
    this.notify();
  }
}

const breedingSeasonStore =
  new BreedingSeasonStore();

export default breedingSeasonStore;