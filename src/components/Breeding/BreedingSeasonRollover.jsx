import { useMemo, useState } from "react";
import "./BreedingSeasonRollover.css";

function seasonTotals(season) {
  const entries = Object.values(season.loftRecords || {}).flatMap(
    (record) => record.entries || [],
  );

  return {
    entries: entries.length,
    youngsters: entries.filter((entry) => entry.ringNumber).length,
  };
}

export default function BreedingSeasonRollover({
  open,
  currentSeason,
  seasons = [],
  onClose,
  onConfirm,
}) {
  const nextYear = Number(currentSeason) + 1;
  const requiredText = `CLOSE ${currentSeason}`;
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");

  const archivedSeasons = useMemo(
    () =>
      seasons
        .filter((season) => season.status === "archived")
        .sort((a, b) => Number(b.year) - Number(a.year)),
    [seasons],
  );

  if (!open) return null;

  function closeModal() {
    setConfirmation("");
    setError("");
    onClose?.();
  }

  function confirmRollover() {
    if (confirmation !== requiredText) {
      setError(`Type ${requiredText} exactly to continue.`);
      return;
    }

    setConfirmation("");
    setError("");
    onConfirm?.(nextYear);
  }

  return (
    <div
      className="season-rollover-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && closeModal()}
    >
      <section className="season-rollover-modal">
        <header>
          <div>
            <p>BREEDING SEASON CONTROL</p>
            <h3>Close {currentSeason} and Start {nextYear}</h3>
          </div>
          <button type="button" onClick={closeModal}>×</button>
        </header>

        <div className="season-rollover-warning">
          <strong>The {currentSeason} records will be archived permanently.</strong>
          <p>
            Working nest-box assignments will be cleared for {nextYear}.
            Bird Profiles, youngsters and historical breeding entries will not be deleted.
          </p>
        </div>

        <label className="season-confirmation-field">
          Type <strong>{requiredText}</strong> to confirm
          <input
            value={confirmation}
            onChange={(event) => {
              setConfirmation(event.target.value);
              setError("");
            }}
            autoComplete="off"
          />
        </label>

        {error && <p className="season-rollover-error">{error}</p>}

        {archivedSeasons.length > 0 && (
          <div className="archived-season-list">
            <h4>Existing Archived Seasons</h4>
            {archivedSeasons.map((season) => {
              const totals = seasonTotals(season);
              return (
                <div key={season.id}>
                  <strong>{season.year}</strong>
                  <span>{totals.entries} entries</span>
                  <span>{totals.youngsters} youngsters</span>
                </div>
              );
            })}
          </div>
        )}

        <footer>
          <button type="button" className="season-cancel" onClick={closeModal}>
            Cancel
          </button>
          <button type="button" className="season-confirm" onClick={confirmRollover}>
            Archive {currentSeason} and Start {nextYear}
          </button>
        </footer>
      </section>
    </div>
  );
}
