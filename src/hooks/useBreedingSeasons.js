import { useEffect, useState } from "react";
import breedingSeasonStore from
  "../data/BreedingSeasonStore";

export default function useBreedingSeasons() {
  const [seasons, setSeasons] = useState(
    breedingSeasonStore.getSeasons(),
  );

  useEffect(() => {
    return breedingSeasonStore.subscribe(
      setSeasons,
    );
  }, []);

  return seasons;
}