const STORAGE_KEY = "loftCommanderRaceProgramme";

function loadRaces() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const races = saved ? JSON.parse(saved) : [];
    return Array.isArray(races) ? races : [];
  } catch {
    return [];
  }
}

function storeRaces(races) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(races));
}

const raceStore = {
  getRaces() {
    return loadRaces();
  },

  saveRace(race) {
    const races = loadRaces();
    const index = races.findIndex((savedRace) => savedRace.id === race.id);

    if (index === -1) races.push(race);
    else races[index] = race;

    storeRaces(races);
    return race;
  },

  deleteRace(raceId) {
    storeRaces(loadRaces().filter((race) => race.id !== raceId));
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

export default raceStore;
