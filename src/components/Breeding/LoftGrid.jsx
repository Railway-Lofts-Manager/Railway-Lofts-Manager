import "./LoftGrid.css";

export default function LoftGrid({
  loft,
  assignments = {},
  onSelectBox,
  onBack,
}) {
  const nestBoxes = Array.from(
    { length: loft.boxes },
    (_, index) => {
      const number = index + 1;
      const assignment =
        assignments[`${loft.id}-${number}`];

      return {
        number,
        assignment,
      };
    },
  );

  return (
    <section className="loft-grid">
      <div className="loft-grid-header">
        <button
          className="loft-back-button"
          type="button"
          onClick={onBack}
        >
          ← Back
        </button>

        <div>
          <h2>{loft.name}</h2>
          <p>{loft.boxes} Nest Boxes</p>
        </div>
      </div>

      <div className="loft-box-grid">
        {nestBoxes.map(({ number, assignment }) => (
          <button
            key={number}
            className="nest-box-card"
            type="button"
            onClick={() => onSelectBox?.(number)}
          >
            <h3>Box {number}</h3>

            {assignment ? (
              <p>
                {assignment.cock || "No cock"}
                <br />
                {assignment.hen || "No hen"}
              </p>
            ) : (
              <p>Empty nest box</p>
            )}
          </button>
        ))}
      </div>
    </section>
  );
}