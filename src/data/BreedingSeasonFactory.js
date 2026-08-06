export function createBreedingSeason(year) {
  return {
    id: `breeding-season-${year}`,
    year: Number(year),
    status: "active",
    startedAt: new Date().toISOString(),
    closedAt: null,
    loftRecords: {},
  };
}

export function createBoxSeasonRecord({
  loftId,
  boxNumber,
}) {
  return {
    id: `${loftId}-${boxNumber}`,
    loftId,
    boxNumber,
    pairings: [],
    entries: [],
  };
}

export function createBreedingEntry() {
  return {
    id:
      globalThis.crypto?.randomUUID?.() ||
      `entry-${Date.now()}`,
    createdAt: new Date().toISOString(),
    laidDate: "",
    expectedHatchDate: "",
    hatchDate: "",
    ringedDate: "",
    ringNumber: "",
    colour: "",
    sex: "Unknown",
    outcome: "",
    comments: "",
    movedToYoungBirdLoftDate: "",
    destinationLoftId: "",
    youngBirdId: "",
  };
}