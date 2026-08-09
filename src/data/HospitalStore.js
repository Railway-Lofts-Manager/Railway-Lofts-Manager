const STORAGE_KEY = "loftCommanderHospital";

export const HOSPITAL_AREAS = [
  { id: "young-bird-hospital", name: "Young Bird Shed Hospital/Quarantine", boxes: 4 },
  { id: "stock-bird-hospital", name: "Stock Bird Store Shed Hospital/Quarantine", boxes: 4 },
];

const emptyState = { admissions: [], strays: [] };

function repairActiveBoxAssignments(state) {
  const occupied = new Set();
  let changed = false;

  function boxKey(areaId, boxNumber) {
    return `${areaId}:${boxNumber}`;
  }

  function firstEmptyBox(preferredAreaId) {
    const orderedAreas = [
      ...HOSPITAL_AREAS.filter((area) => area.id === preferredAreaId),
      ...HOSPITAL_AREAS.filter((area) => area.id !== preferredAreaId),
    ];

    for (const area of orderedAreas) {
      for (let boxNumber = 1; boxNumber <= area.boxes; boxNumber += 1) {
        if (!occupied.has(boxKey(area.id, boxNumber))) {
          return { areaId: area.id, boxNumber };
        }
      }
    }

    return null;
  }

  state.admissions
    .filter((admission) => admission.status === "Active")
    .forEach((admission) => {
      const area = HOSPITAL_AREAS.find((record) => record.id === admission.areaId);
      const validBox =
        area &&
        Number.isInteger(Number(admission.boxNumber)) &&
        Number(admission.boxNumber) >= 1 &&
        Number(admission.boxNumber) <= area.boxes;
      const currentKey = boxKey(admission.areaId, Number(admission.boxNumber));

      if (validBox && !occupied.has(currentKey)) {
        admission.boxNumber = Number(admission.boxNumber);
        occupied.add(currentKey);
        return;
      }

      const emptyBox = firstEmptyBox(admission.areaId);
      if (!emptyBox) return;

      admission.areaId = emptyBox.areaId;
      admission.boxNumber = emptyBox.boxNumber;
      occupied.add(boxKey(emptyBox.areaId, emptyBox.boxNumber));
      changed = true;
    });

  return changed;
}

function createId(prefix) {
  return globalThis.crypto?.randomUUID?.() ||
    `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function normaliseRing(value) {
  return String(value || "").trim().toUpperCase();
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const state = saved ? JSON.parse(saved) : emptyState;
    const repairedState = {
      admissions: Array.isArray(state.admissions) ? state.admissions : [],
      strays: Array.isArray(state.strays) ? state.strays : [],
    };

    if (repairActiveBoxAssignments(repairedState)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(repairedState));
    }

    return repairedState;
  } catch {
    return { ...emptyState };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function nextStrayId(strays) {
  const highest = strays.reduce((currentHighest, stray) => {
    const match = String(stray.strayId || "").match(/^STRAY-(\d+)$/);
    return match ? Math.max(currentHighest, Number(match[1])) : currentHighest;
  }, 0);

  return `STRAY-${String(highest + 1).padStart(6, "0")}`;
}

const hospitalStore = {
  getState() {
    return loadState();
  },

  admitOwnedBird(details) {
    const state = loadState();
    const admission = {
      id: createId("admission"),
      subjectType: "owned",
      birdId: details.birdId,
      ringNumber: normaliseRing(details.ringNumber),
      areaId: details.areaId,
      boxNumber: Number(details.boxNumber),
      admittedDate: details.admittedDate,
      reason: details.reason || "",
      notes: details.notes || "",
      previousLoftId: details.previousLoftId || "",
      previousLoft: details.previousLoft || "",
      previousSection: details.previousSection || "",
      previousStatus: details.previousStatus || "",
      status: "Active",
    };

    state.admissions.push(admission);
    saveState(state);
    return admission;
  },

  admitStray(details) {
    const state = loadState();
    const ringNumber = normaliseRing(details.ringNumber);
    let stray = state.strays.find((record) => record.ringNumber === ringNumber);

    const activeAdmission = state.admissions.find(
      (record) => record.ringNumber === ringNumber && record.status === "Active",
    );

    if (activeAdmission) {
      return {
        admission: activeAdmission,
        stray,
        returning: Boolean(stray?.visits?.length),
        alreadyActive: true,
      };
    }

    if (!stray) {
      stray = {
        strayId: nextStrayId(state.strays),
        ringNumber,
        createdAt: new Date().toISOString(),
        ownerDetails: details.ownerDetails || "",
        visits: [],
        status: "Stray",
      };
      state.strays.push(stray);
    } else if (details.ownerDetails) {
      stray.ownerDetails = details.ownerDetails;
    }

    const admission = {
      id: createId("admission"),
      subjectType: "stray",
      strayId: stray.strayId,
      ringNumber,
      areaId: details.areaId,
      boxNumber: Number(details.boxNumber),
      admittedDate: details.admittedDate,
      reason: details.reason || "Incoming stray",
      notes: details.notes || "",
      status: "Active",
    };

    state.admissions.push(admission);
    stray.visits.push({
      admissionId: admission.id,
      arrivalDate: admission.admittedDate,
      areaId: admission.areaId,
      boxNumber: admission.boxNumber,
      condition: admission.notes,
      outcome: "",
    });

    saveState(state);
    return { admission, stray, returning: stray.visits.length > 1 };
  },

  discharge(admissionId, outcome, notes = "") {
    const state = loadState();
    const admission = state.admissions.find((record) => record.id === admissionId);
    if (!admission) return false;

    admission.status = "Discharged";
    admission.dischargeDate = new Date().toISOString().slice(0, 10);
    admission.outcome = outcome;
    admission.dischargeNotes = notes;

    if (admission.strayId) {
      const stray = state.strays.find((record) => record.strayId === admission.strayId);
      if (stray && stray.status !== "Transferred to My Loft") {
        stray.status = outcome;
      }
      const visit = stray?.visits.find((record) => record.admissionId === admissionId);
      if (visit) {
        visit.outcome = outcome;
        visit.departureDate = admission.dischargeDate;
        visit.notes = notes;
      }
    }

    saveState(state);
    return true;
  },

  completeActiveAdmissionForBird(birdId, destinationLoft) {
    const state = loadState();
    const admission = state.admissions.find(
      (record) => record.birdId === birdId && record.status === "Active",
    );

    if (!admission) return false;

    admission.status = "Discharged";
    admission.dischargeDate = new Date().toISOString().slice(0, 10);
    admission.outcome = `Moved to ${destinationLoft || "assigned loft"}`;
    admission.dischargeNotes = "Hospital assignment closed automatically when the bird moved loft.";

    if (admission.strayId) {
      const stray = state.strays.find((record) => record.strayId === admission.strayId);
      const visit = stray?.visits.find((record) => record.admissionId === admission.id);
      if (visit) {
        visit.outcome = admission.outcome;
        visit.departureDate = admission.dischargeDate;
        visit.notes = admission.dischargeNotes;
      }
    }

    saveState(state);
    return true;
  },

  restoreMissingAdmissionForBird(bird) {
    const state = loadState();
    const alreadyActive = state.admissions.some(
      (record) => record.birdId === bird.birdId && record.status === "Active",
    );
    if (alreadyActive) return false;

    const occupied = new Set(
      state.admissions
        .filter((record) => record.status === "Active")
        .map((record) => `${record.areaId}:${record.boxNumber}`),
    );

    let emptyBox = null;
    for (const area of HOSPITAL_AREAS) {
      for (let boxNumber = 1; boxNumber <= area.boxes; boxNumber += 1) {
        if (!occupied.has(`${area.id}:${boxNumber}`)) {
          emptyBox = { areaId: area.id, boxNumber };
          break;
        }
      }
      if (emptyBox) break;
    }

    if (!emptyBox) return false;

    state.admissions.push({
      id: createId("admission"),
      subjectType: "owned",
      birdId: bird.birdId,
      formerStrayId: bird.formerStrayId || "",
      strayId: bird.formerStrayId || "",
      ringNumber: normaliseRing(bird.ringNumber),
      areaId: emptyBox.areaId,
      boxNumber: emptyBox.boxNumber,
      admittedDate: new Date().toISOString().slice(0, 10),
      reason: "Hospital assignment restored",
      notes: "Restored because the Bird Register still showed this bird in Hospital.",
      status: "Active",
    });

    saveState(state);
    return true;
  },

  transferStray(strayId, birdId) {
    const state = loadState();
    const stray = state.strays.find((record) => record.strayId === strayId);
    if (!stray) return false;

    stray.status = "Transferred to My Loft";
    stray.transferredBirdId = birdId;
    stray.transferredAt = new Date().toISOString();

    state.admissions.forEach((admission) => {
      if (admission.strayId === strayId && admission.status === "Active") {
        admission.subjectType = "owned";
        admission.birdId = birdId;
        admission.formerStrayId = strayId;
      }
    });

    saveState(state);
    return true;
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY);
  },
};

export default hospitalStore;
