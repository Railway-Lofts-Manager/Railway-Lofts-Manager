import birdStore from "./BirdStore";
import loftStore from "./LoftStore";

export function updateLinkedLoft(
  loftId,
  updates,
) {
  const currentLoft = loftStore
    .getLofts()
    .find((loft) => loft.id === loftId);

  if (!currentLoft) {
    return;
  }

  loftStore.updateLoft(loftId, updates);

  birdStore.getBirds().forEach((bird) => {
    const linkedById = bird.loftId === loftId;

    const linkedByLegacyName =
      !bird.loftId &&
      bird.loft === currentLoft.name;

    if (linkedById || linkedByLegacyName) {
      birdStore.updateBird(bird.ringNumber, {
        loftId,
        loft: updates.name || currentLoft.name,
      });
    }
  });
}