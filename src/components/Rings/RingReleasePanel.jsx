import { useState } from "react";
import ringStore from "../../data/RingStore";
import "./RingReleasePanel.css";

const today = new Date().toISOString().slice(0, 10);

export default function RingReleasePanel({ entry, onChange }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [releaseDate, setReleaseDate] = useState(today);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  function releaseRing(event) {
    event.preventDefault();

    if (!reason || !releaseDate) {
      setError("Select a reason and release date.");
      return;
    }

    try {
      const historyRecord = {
        ringNumber: entry.ringNumber,
        entryId: entry.id,
        releasedAt: releaseDate,
        reason,
        notes: notes.trim(),
      };

      ringStore.assignToBreedingEntry(
        entry.id,
        entry.ringNumber,
        "",
        historyRecord,
      );

      onChange?.(entry.id, {
        ringNumber: "",
        ringHistory: [...(entry.ringHistory || []), historyRecord],
      });
      setError("");
      setOpen(false);
    } catch (releaseError) {
      setError(releaseError.message);
    }
  }

  if (!open) {
    return (
      <button
        className="ring-release-open"
        type="button"
        onClick={() => setOpen(true)}
      >
        Release / Reassign Ring
      </button>
    );
  }

  return (
    <div
      className="ring-release-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) setOpen(false);
      }}
    >
      <section className="ring-release-modal">
        <header>
          <div>
            <p>RING MANAGEMENT</p>
            <h3>Release {entry.ringNumber}</h3>
          </div>
          <button className="close" type="button" onClick={() => setOpen(false)}>×</button>
        </header>

        <div className="ring-release-fields">
          <label>
            Reason
            <select value={reason} onChange={(event) => setReason(event.target.value)} required>
              <option value="">Select reason</option>
              <option>Youngster died</option>
              <option>Ring removed</option>
              <option>Incorrectly assigned</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            Date Released
            <input type="date" value={releaseDate} onChange={(event) => setReleaseDate(event.target.value)} required />
          </label>

          <label className="ring-release-notes">
            Notes
            <textarea rows="3" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
        </div>

        {error && <p className="ring-release-error">{error}</p>}

        <footer>
          <button className="secondary" type="button" onClick={() => setOpen(false)}>Cancel</button>
          <button className="primary" type="button" onClick={releaseRing}>Confirm Release</button>
        </footer>
      </section>
    </div>
  );
}
