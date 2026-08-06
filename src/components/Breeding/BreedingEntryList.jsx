import "./BreedingEntryList.css";

function formatDate(value) {
  if (!value) {
    return "";
  }

  const [year, month, day] = value.split("-");

  return `${day}/${month}/${year}`;
}

export default function BreedingEntryList({
  entries = [],
  onAddEntry,
  onOpenEntry,
}) {
  return (
    <section className="breeding-entry-list">
      <header className="breeding-entry-list-header">
        <div>
          <h3>Breeding History</h3>

          <p className="muted">
            Entries remain permanently available
            for pattern and performance analysis.
          </p>
        </div>

        <button
          className="primary"
          type="button"
          onClick={onAddEntry}
        >
          + Add Entry
        </button>
      </header>

      {entries.length > 0 ? (
        <div className="breeding-entry-summary-list">
          {entries.map((entry, index) => (
            <button
              key={entry.id}
              className="breeding-entry-summary"
              type="button"
              onClick={() => onOpenEntry?.(entry.id)}
            >
              <strong>Entry {index + 1}</strong>

              <span>
                {entry.ringNumber ||
                  entry.outcome ||
                  formatDate(entry.laidDate) ||
                  "New entry"}
              </span>

              <strong>Open →</strong>
            </button>
          ))}
        </div>
      ) : (
        <div className="breeding-entry-empty">
          No breeding entries recorded for this
          nest box this season.
        </div>
      )}
    </section>
  );
}