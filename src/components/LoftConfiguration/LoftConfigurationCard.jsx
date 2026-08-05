import "./LoftConfigurationCard.css";

export default function LoftConfigurationCard({
  loft,
  onEdit,
}) {
  return (
    <article
      className="panel loft-configuration-card"
      style={{
        "--loft-colour": loft.colour,
      }}
    >
      <h3>{loft.name}</h3>

      <p className="loft-configuration-code">
        {loft.code}
      </p>

      <div className="loft-configuration-details">
        <div>
          <strong>{loft.boxes}</strong>
          <span>Nest Boxes</span>
        </div>

        <div>
          <strong>
            {loft.status === "in-use"
              ? "In Use"
              : "Not In Use"}
          </strong>
          <span>Status</span>
        </div>
      </div>

      <button
        className="primary"
        type="button"
        onClick={() => onEdit?.(loft)}
      >
        Edit Loft
      </button>
    </article>
  );
}