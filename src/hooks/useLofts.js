import { useEffect, useState } from "react";
import loftStore from "../data/LoftStore";

export default function useLofts() {
  const [lofts, setLofts] = useState(
    loftStore.getLofts(),
  );

  useEffect(() => {
    return loftStore.subscribe(setLofts);
  }, []);

  return lofts;
}