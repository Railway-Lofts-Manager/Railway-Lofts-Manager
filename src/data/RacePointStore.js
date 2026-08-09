const STORAGE_KEY = "loftCommanderRacePoints";

function normaliseName(value) {
  return String(value || "").trim().toLowerCase();
}

function loadRacePoints() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const racePoints = saved ? JSON.parse(saved) : [];
    return Array.isArray(racePoints) ? racePoints : [];
  } catch {
    return [];
  }
}

function saveRacePoints(racePoints) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(racePoints));
}

const racePointStore = {
  getRacePoints() {
    return loadRacePoints().sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base" }),
    );
  },

  saveRacePoint({ name, miles, yards }) {
    const racePoints = loadRacePoints();
    const cleanName = String(name || "").trim();
    const existingIndex = racePoints.findIndex(
      (racePoint) => normaliseName(racePoint.name) === normaliseName(cleanName),
    );

    const savedRacePoint = {
      id:
        existingIndex >= 0
          ? racePoints[existingIndex].id
          : globalThis.crypto?.randomUUID?.() ||
            `race-point-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: cleanName,
      miles: Number(miles),
      yards: Number(yards),
    };

    if (existingIndex >= 0) racePoints[existingIndex] = savedRacePoint;
    else racePoints.push(savedRacePoint);

    saveRacePoints(racePoints);
    return savedRacePoint;
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

export default racePointStore;
