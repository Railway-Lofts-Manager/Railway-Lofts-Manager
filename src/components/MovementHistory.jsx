import "./MovementHistory.css";

function formatDate(value) {
  if (!value) return "Date not recorded";

  const [year, month, day] = String(value).slice(0, 10).split("-");

  return year && month && day
    ? `${day}/${month}/${year}`
    : value;
}

export default function MovementHistory({ bird }) {
  const movements = [...(bird?.loftHistory || [])]
    .map((movement, index, allMovements) => ({
      ...movement,
      fromLoftName:
        movement.fromLoftName ||
        (index > 0 ? allMovements[index - 1].loftName : ""),
    }))
    .sort((a, b) => String(b.date || "").localeCompare(String(a.date || "")));

  return (
    <div className="profile-section">
      <div className="profile-section-heading command-section-heading">
        <div>
          <p className="profile-label">Permanent location record</p>
          <h3>Movement History</h3>
        </div>

        <span className="movement-count">
          {movements.length} {movements.length === 1 ? "move" : "moves"}
        </span>
      </div>

      {movements.length === 0 ? (
        <div className="movement-empty">
          <span>⌂</span>
          <h4>No movements recorded</h4>
          <p>
            The bird’s first loft assignment and every later loft change will
            appear here automatically.
          </p>
        </div>
      ) : (
        <div className="movement-list">
          {movements.map((movement, index) => (
            <article
              className="movement-card"
              key={movement.id || `${movement.date}-${movement.loftId}-${index}`}
            >
              <div className="movement-marker">
                <span>{index === 0 ? "●" : "◆"}</span>
              </div>

              <div className="movement-details">
                <div className="movement-heading">
                  <div>
                    <small>{formatDate(movement.date)}</small>
                    <h4>{movement.loftName || "Loft not recorded"}</h4>
                  </div>

                  {index === 0 && <strong>CURRENT LOFT</strong>}
                </div>

                <dl>
                  <div>
                    <dt>Moved from</dt>
                    <dd>{movement.fromLoftName || "Initial assignment"}</dd>
                  </div>

                  <div>
                    <dt>Moved to</dt>
                    <dd>{movement.loftName || "Not recorded"}</dd>
                  </div>

                  <div>
                    <dt>Reason</dt>
                    <dd>{movement.reason || "Loft movement"}</dd>
                  </div>
                </dl>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
