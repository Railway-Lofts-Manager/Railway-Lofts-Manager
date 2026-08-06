import BreedingEntryCard from
  "./BreedingEntryCard";
import "./BreedingEntryModal.css";

export default function BreedingEntryModal({
  entry,
  entryNumber,
  onChange,
  onDiscard,
  onClose,
}) {
  if (!entry) {
    return null;
  }

  return (
    <div
      className="breeding-entry-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section className="breeding-entry-modal">
        <header className="breeding-entry-modal-header">
          <h3>Breeding Entry {entryNumber}</h3>

          <button
            className="close"
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <BreedingEntryCard
          entry={entry}
          entryNumber={entryNumber}
          onChange={onChange}
        />

        <footer className="breeding-entry-modal-footer">
          {onDiscard && (
            <button
              className="secondary"
              type="button"
              onClick={onDiscard}
            >
              Discard Blank Entry
            </button>
          )}

          <button
            className="primary"
            type="button"
            onClick={onClose}
          >
            Done
          </button>
        </footer>
      </section>
    </div>
  );
}