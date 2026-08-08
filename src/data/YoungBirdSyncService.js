import birdStore from "./BirdStore";
import loftStore from "./LoftStore";

function createRecordId() {
  return (
    globalThis.crypto?.randomUUID?.() ||
    `bird-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );
}

function ringYear(ringNumber, fallbackYear) {
  const match = String(ringNumber).match(/^[A-Z]+(\d{2})/i);
  return match ? `20${match[1]}` : String(fallbackYear);
}

export default function syncYoungBird({
  entry,
  season,
  breedingLoftId,
  boxNumber,
  assignment = {},
}) {
  if (
    !entry.ringNumber ||
    !entry.movedToYoungBirdLoftDate ||
    !entry.destinationLoftId
  ) {
    return null;
  }

  const lofts = loftStore.getLofts();

  const breedingLoft = lofts.find(
    (loft) => loft.id === breedingLoftId
  );

  const destinationLoft = lofts.find(
    (loft) => loft.id === entry.destinationLoftId
  );

  const father = birdStore.getBird(assignment.cock);
  const mother = birdStore.getBird(assignment.hen);

  const existingBird = birdStore.getBird(entry.ringNumber);

  const origin = {
    season: Number(season),
    breedingEntryId: entry.id,
    loftId: breedingLoftId,
    loftName: breedingLoft?.name || "",
    nestBox: boxNumber,
    fatherRingNumber: assignment.cock || "",
    motherRingNumber: assignment.hen || "",
    fatherId: father?.birdId || "",
    motherId: mother?.birdId || "",
    laidDate: entry.laidDate || "",
    hatchDate: entry.hatchDate || "",
  };

  const moveRecord = {
    id:
      globalThis.crypto?.randomUUID?.() ||
      `move-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    date: entry.movedToYoungBirdLoftDate,
    fromLoftId: breedingLoftId,
    fromLoftName: breedingLoft?.name || "",
    loftId: entry.destinationLoftId,
    loftName: destinationLoft?.name || "",
    reason: "Moved from nest box to young bird loft",
  };

  const existingMoves = existingBird?.loftHistory || [];

  const moveExists = existingMoves.some(
    (move) =>
      move.date === moveRecord.date &&
      move.loftId === moveRecord.loftId
  );

  const updates = {
    birdId: existingBird?.birdId || createRecordId(),
    ringNumber: entry.ringNumber,
    colour: entry.colour || existingBird?.colour || "",
    sex: entry.sex || existingBird?.sex || "Unknown",
    year: existingBird?.year || ringYear(entry.ringNumber, season),
    status: "Young Bird",
    loft: destinationLoft?.name || "",
    loftId: entry.destinationLoftId,
    section: destinationLoft?.name || "",
    nestBox: "",
    hatchDate: entry.hatchDate || existingBird?.hatchDate || "",
    fatherId: existingBird?.fatherId || father?.birdId || "",
    motherId: existingBird?.motherId || mother?.birdId || "",
    breedingOrigin: existingBird?.breedingOrigin || origin,
    loftHistory: moveExists
      ? existingMoves
      : [...existingMoves, moveRecord],
  };

  if (existingBird) {
    birdStore.updateBird(entry.ringNumber, updates);
  } else {
    const added = birdStore.addBird(updates);

    if (!added) {
      console.error("Young bird could not be created:", updates);
      return null;
    }
  }

  return birdStore.getBird(entry.ringNumber);
}
