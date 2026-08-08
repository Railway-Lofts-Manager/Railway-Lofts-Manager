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

  rolloverSeason(nextYear, assignments = {}) {
    const year = Number(nextYear);
    const activeSeason = this.seasons.find(
      (season) => season.status === "active",
    );

    if (!activeSeason) {
      throw new Error("There is no active breeding season to close.");
    }

    if (!Number.isInteger(year) || year <= Number(activeSeason.year)) {
      throw new Error("The new season must be later than the current season.");
    }

    const archivedLoftRecords = copy(activeSeason.loftRecords || {});

    Object.entries(assignments).forEach(([boxId, assignment]) => {
      const boxNumber = Number(String(boxId).split("-").pop());
      const loftId = String(boxId).slice(0, -(String(boxNumber).length + 1));
      const currentRecord = archivedLoftRecords[boxId] || {
        id: boxId,
        loftId,
        boxNumber,
        pairings: [],
        entries: [],
      };

      archivedLoftRecords[boxId] = {
        ...currentRecord,
        assignment: copy(assignment),
      };
    });

    this.seasons = this.seasons.map((season) =>
      season.id === activeSeason.id
        ? {
            ...season,
            status: "archived",
            closedAt: new Date().toISOString(),
            loftRecords: archivedLoftRecords,
          }
        : season,
    );

    let nextSeason = this.seasons.find(
      (season) => Number(season.year) === year,
    );

    if (nextSeason) {
      nextSeason = { ...nextSeason, status: "active", closedAt: null };
      this.seasons = this.seasons.map((season) =>
        season.id === nextSeason.id ? nextSeason : season,
      );
    } else {
      nextSeason = createBreedingSeason(year);
      this.seasons.push(nextSeason);
    }

    this.notify();
    return copy(nextSeason);
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
