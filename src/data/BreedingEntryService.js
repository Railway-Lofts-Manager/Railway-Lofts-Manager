import breedingSeasonStore from
  "./BreedingSeasonStore";
import {
  createBoxSeasonRecord,
  createBreedingEntry,
} from "./BreedingSeasonFactory";

function updateBoxRecord(
  year,
  loftId,
  boxNumber,
  update,
) {
  const season =
    breedingSeasonStore.ensureActiveSeason(year);

  const boxId = `${loftId}-${boxNumber}`;

  const boxRecord =
    season.loftRecords[boxId] ||
    createBoxSeasonRecord({
      loftId,
      boxNumber,
    });

  season.loftRecords[boxId] = update(boxRecord);

  breedingSeasonStore.saveSeason(season);

  return season.loftRecords[boxId];
}

export function addBreedingEntry(
  year,
  loftId,
  boxNumber,
) {
  const newEntry = createBreedingEntry();

  updateBoxRecord(
    year,
    loftId,
    boxNumber,
    (boxRecord) => ({
      ...boxRecord,
      entries: [...boxRecord.entries, newEntry],
    }),
  );

  return newEntry;
}

export function updateBreedingEntry(
  year,
  loftId,
  boxNumber,
  entryId,
  updates,
) {
  return updateBoxRecord(
    year,
    loftId,
    boxNumber,
    (boxRecord) => ({
      ...boxRecord,
      entries: boxRecord.entries.map((entry) =>
        entry.id === entryId
          ? { ...entry, ...updates }
          : entry,
      ),
    }),
  );
}

export function removeBlankBreedingEntry(
  year,
  loftId,
  boxNumber,
  entryId,
) {
  return updateBoxRecord(
    year,
    loftId,
    boxNumber,
    (boxRecord) => ({
      ...boxRecord,
      entries: boxRecord.entries.filter(
        (entry) => entry.id !== entryId,
      ),
    }),
  );
}