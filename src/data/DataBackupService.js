export const BACKUP_KEYS = [
  "loftCommanderBirdStore",
  "loftCommanderLoftStore",
  "loftCommanderCustomerSettings",
  "loftCommanderRingRegister",
  "loftCommanderBreedingSeasons",
  "loft-commander-boxes",
];

export function createBackup() {
  const data = {};
  BACKUP_KEYS.forEach((key) => {
    const saved = localStorage.getItem(key);
    data[key] = saved ? JSON.parse(saved) : null;
  });

  return {
    format: "LOFT_COMMANDER_BACKUP",
    version: 1,
    createdAt: new Date().toISOString(),
    data,
  };
}

export function downloadBackup() {
  const backup = createBackup();
  const date = backup.createdAt.slice(0, 10);
  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Loft-Commander-Backup-${date}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

export function validateBackup(value) {
  if (
    !value ||
    value.format !== "LOFT_COMMANDER_BACKUP" ||
    value.version !== 1 ||
    !value.data ||
    typeof value.data !== "object"
  ) {
    throw new Error("This is not a valid Loft Commander backup file.");
  }

  const unknownKeys = Object.keys(value.data).filter(
    (key) => !BACKUP_KEYS.includes(key),
  );
  if (unknownKeys.length) {
    throw new Error("The backup contains unsupported data.");
  }

  return value;
}

export function backupSummary(backup) {
  const data = backup.data;
  return {
    birds: Array.isArray(data.loftCommanderBirdStore) ? data.loftCommanderBirdStore.length : 0,
    rings: Array.isArray(data.loftCommanderRingRegister) ? data.loftCommanderRingRegister.length : 0,
    lofts: Array.isArray(data.loftCommanderLoftStore) ? data.loftCommanderLoftStore.length : 0,
    seasons: Array.isArray(data.loftCommanderBreedingSeasons) ? data.loftCommanderBreedingSeasons.length : 0,
  };
}

export function restoreBackup(backup) {
  const validBackup = validateBackup(backup);
  BACKUP_KEYS.forEach((key) => {
    const value = validBackup.data[key];
    if (value === null || value === undefined) localStorage.removeItem(key);
    else localStorage.setItem(key, JSON.stringify(value));
  });
  window.location.reload();
}
