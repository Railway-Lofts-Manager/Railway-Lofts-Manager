import { useEffect, useState } from "react";
import ringStore from "../../data/RingStore";
import "./AvailableRingSelect.css";

export default function AvailableRingSelect({ entry, onChange }) {
  const [rings, setRings] = useState(ringStore.getRings());
  const [error, setError] = useState("");

  useEffect(() => ringStore.subscribe(setRings), []);

  const choices = rings.filter(
    (ring) =>
      ring.status === "available" ||
      ring.assignedEntryId === entry.id,
  );
  const currentIsMissing =
    entry.ringNumber &&
    !choices.some((ring) => ring.ringNumber === entry.ringNumber);

  function selectRing(event) {
    const nextRingNumber = event.target.value;

    try {
      ringStore.assignToBreedingEntry(
        entry.id,
        entry.ringNumber,
        nextRingNumber,
      );
      onChange?.(entry.id, { ringNumber: nextRingNumber });
      setError("");
    } catch (assignmentError) {
      setError(assignmentError.message);
    }
  }

  return (
    <label className="available-ring-select">
      Ring Number
      <select value={entry.ringNumber} onChange={selectRing}>
        <option value="">Select available ring</option>
        {currentIsMissing && (
          <option value={entry.ringNumber}>
            {entry.ringNumber} (current)
          </option>
        )}
        {choices.map((ring) => (
          <option key={ring.ringNumber} value={ring.ringNumber}>
            {ring.ringNumber}
          </option>
        ))}
      </select>
      {choices.length === 0 && !entry.ringNumber && (
        <small>Add rings in the Ring Register first.</small>
      )}
      {error && <small className="available-ring-error">{error}</small>}
    </label>
  );
}
