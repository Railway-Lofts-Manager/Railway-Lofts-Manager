import "./LoftGrid.css";

export default function LoftGrid({
  loftName,
  nestBoxes = [],
  onSelectBox,
}) {
  return (
    <section className="loft-grid">

      <div className="loft-grid-header">

        <button
          className="loft-back-button"
          type="button"
        >
          ← Back
        </button>

        <div>

          <h2>{loftName}</h2>

          <p>
            {nestBoxes.length} Nest Boxes
          </p>

        </div>

      </div>

      <div className="loft-box-grid">

        {nestBoxes.map((box) => (
          <button
            key={box.id}
            className="nest-box-card"
            onClick={() => onSelectBox?.(box)}
          >
            <h3>
              Box {box.number}
            </h3>

            <p>{box.status}</p>

          </button>
        ))}

      </div>

    </section>
  );
}