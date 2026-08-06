import "./CurrentRound.css";

export default function CurrentRound({
  loft,
  assignments = {},
  onBack,
  onSelectBox,
}) {
  const activeBoxes = Object.entries(assignments)
    .filter(([key, assignment]) => {
      const belongsToLoft = key.startsWith(
        `${loft.id}-`,
      );

      const hasCurrentRound =
        Number(assignment.eggs || 0) > 0 ||
        Number(assignment.youngsters || 0) > 0;

      return belongsToLoft && hasCurrentRound;
    })
    .map(([key, assignment]) => ({
      boxNumber: Number(key.split("-").pop()),
      assignment,
    }))
    .sort((first, second) =>
      first.boxNumber - second.boxNumber,
    );

  return (
    <section className="current-round">
      <header className="panel current-round-header">
        <button
          className="secondary"
          type="button"
          onClick={onBack}
        >
          ← Back
        </button>

        <div>
          <h2>Current Round</h2>
          <p className="muted">{loft.name}</p>
        </div>
      </header>

      <div className="current-round-grid">
        {activeBoxes.length > 0 ? (
          activeBoxes.map(
            ({ boxNumber, assignment }) => (
              <button
                key={boxNumber}
                className="panel current-round-card"
                type="button"
                onClick={() =>
                  onSelectBox?.(boxNumber)
                }
              >
                <h3>Box {boxNumber}</h3>
                <p>Eggs: {assignment.eggs || 0}</p>
                <p>
                  Youngsters:
                  {" "}
                  {assignment.youngsters || 0}
                </p>
              </button>
            ),
          )
        ) : (
          <section className="panel empty-state">
            <h3>No current round recorded</h3>
            <p>
              Eggs and youngsters recorded in
              BoxForm will appear here.
            </p>
          </section>
        )}
      </div>
    </section>
  );
}