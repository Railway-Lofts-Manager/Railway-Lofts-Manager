import "./LoftCard.css";

export default function LoftCard({
  loft,
  onOpen,
}) {
  return (
    <button
      className="loft-card"
      type="button"
      onClick={() => onOpen?.(loft)}
    >
      <div className="loft-card-icon">
        🏠
      </div>

      <div className="loft-card-content">
        <h3>{loft.name}</h3>

        <p>
          {loft.code} · {loft.nestBoxes} Nest Boxes
        </p>
      </div>

      <div className="loft-card-footer">
        <div className="loft-card-stat">
          <strong>{loft.occupied}</strong>
          <span>Occupied</span>
        </div>

        <div className="loft-card-stat">
          <strong>
            {loft.nestBoxes - loft.occupied}
          </strong>
          <span>Available</span>
        </div>
      </div>

      <div className="loft-card-arrow">
        Open Loft →
      </div>
    </button>
  );
}