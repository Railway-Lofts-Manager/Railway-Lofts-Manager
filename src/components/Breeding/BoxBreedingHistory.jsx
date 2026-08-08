import { useState } from "react";
import settingsStore from
  "../../data/SettingsStore";
import {
  addBreedingEntry,
  removeBlankBreedingEntry,
  updateBreedingEntry,
} from "../../data/BreedingEntryService";
import useBreedingSeasons from
  "../../hooks/useBreedingSeasons";
import BreedingEntryList from
  "./BreedingEntryList";
import BreedingEntryModal from
  "./BreedingEntryModal";
import syncYoungBird from
  "../../data/YoungBirdSyncService";
import "./BoxBreedingHistory.css";

function entryHasData(entry) {
  const ignoredFields = [
    "id",
    "createdAt",
    "sex",
  ];

  return Object.entries(entry).some(
    ([key, value]) =>
      !ignoredFields.includes(key) &&
      Boolean(value),
  );
}

export default function BoxBreedingHistory({
  loftId,
  boxNumber,
  assignment,
}) {
  const seasons = useBreedingSeasons();
  const settings = settingsStore.getSettings();
  const [openEntryId, setOpenEntryId] =
    useState(null);

  const activeSeason = seasons.find(
    (season) => season.status === "active",
  );

  const boxId = `${loftId}-${boxNumber}`;

  const entries =
    activeSeason?.loftRecords?.[boxId]?.entries ||
    [];

  const openEntry = entries.find(
    (entry) => entry.id === openEntryId,
  );

  function addEntry() {
    const entry = addBreedingEntry(
      settings.season,
      loftId,
      boxNumber,
    );

    setOpenEntryId(entry.id);
  }

  function updateEntry(entryId, updates) {
    const currentEntry = entries.find(
      (entry) => entry.id === entryId,
    );
    const parentage = {
      cockRingNumber: assignment?.cock || currentEntry?.cockRingNumber || "",
      henRingNumber: assignment?.hen || currentEntry?.henRingNumber || "",
    };

    const updatesWithParentage = {
      ...updates,
      ...parentage,
    };

    const updatedEntry = {
      ...currentEntry,
      ...updatesWithParentage,
    };

    updateBreedingEntry(
      settings.season,
      loftId,
      boxNumber,
      entryId,
      updatesWithParentage,
    );

    const youngBird = syncYoungBird({
      entry: updatedEntry,
      season: settings.season,
      breedingLoftId: loftId,
      boxNumber,
      assignment,
    });

    if (youngBird && updatedEntry.youngBirdId !== youngBird.birdId) {
      updateBreedingEntry(
        settings.season,
        loftId,
        boxNumber,
        entryId,
        { youngBirdId: youngBird.birdId },
      );
    }
  }

  function discardBlankEntry() {
    removeBlankBreedingEntry(
      settings.season,
      loftId,
      boxNumber,
      openEntryId,
    );

    setOpenEntryId(null);
  }

  return (
    <section className="box-breeding-history">
      <p className="box-breeding-season-label">
        BREEDING SEASON {settings.season}
      </p>

      <BreedingEntryList
        entries={entries}
        onAddEntry={addEntry}
        onOpenEntry={setOpenEntryId}
      />

      <BreedingEntryModal
        entry={openEntry}
        entryNumber={
          entries.findIndex(
            (entry) => entry.id === openEntryId,
          ) + 1
        }
        onChange={updateEntry}
        onDiscard={
          openEntry && !entryHasData(openEntry)
            ? discardBlankEntry
            : null
        }
        onClose={() => setOpenEntryId(null)}
      />
    </section>
  );
}
