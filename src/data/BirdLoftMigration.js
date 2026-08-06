import birdStore from "./BirdStore";
import loftStore from "./LoftStore";

export default function migrateBirdLoftIds() {
  const lofts = loftStore.getLofts();
  const birds = birdStore.getBirds();

  birds.forEach((bird) => {
    if (bird.loftId || !bird.loft) {
      return;
    }

    const matchingLoft = lofts.find(
      (loft) =>
        loft.name.trim().toLowerCase() ===
        bird.loft.trim().toLowerCase(),
    );

    if (!matchingLoft) {
      return;
    }

    birdStore.updateBird(bird.ringNumber, {
      loftId: matchingLoft.id,
    });
  });
}