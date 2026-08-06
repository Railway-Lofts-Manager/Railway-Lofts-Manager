import "./PairRegister.css";

export default function PairRegister({
  loft,
  assignments = {},
  onBack,
  onSelectBox,
}) {
  const pairs = Object.entries(assignments)
    .filter(([key]) =>
      key.startsWith(`${loft.id}-`),
    )
    .map(([key, assignment]) => ({
      boxNumber: Number(key.split("-").pop()),
      assignment,
    }))
    .sort((first, second) =>
      first.boxNumber - second.boxNumber,
    );

  return (
    <section className="pair-register">
      <header className="panel pair-register-header">
        <button
          className="secondary"
          type="button"
          onClick={onBack}
        >
          ← Back
        </button>

        <div>
          <h2>Pair Register</h2>
          <p className="muted">{loft.name}</p>
        </div>
      </header>

      <div className="pair-register-list">
        {pairs.length > 0 ? (
          pairs.map(({ boxNumber, assignment }) => (
            <button
              key={boxNumber}
              className="panel"
              type="button"
              onClick={() => onSelectBox?.(boxNumber)}
            >
              <strong>Box {boxNumber}</strong>

              <span>
                Cock: {assignment.cock || "Not selected"}
              </span>

              <span>
                Hen: {assignment.hen || "Not selected"}
              </span>
            </button>
          ))
        ) : (
          <section className="panel empty-state">
            <h3>No breeding pairs assigned</h3>

            <p>
              Assign a cock and hen to a nest box
              to add them to this register.
            </p>
          </section>
        )}
      </div>
    </section>
  );
}