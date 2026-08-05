import "./LoftDashboard.css";

const dashboardTiles = [
  {
    id: "nest-boxes",
    icon: "🟨",
    title: "Nest Boxes",
    description: "Manage breeding pairs",
  },
  {
    id: "pair-register",
    icon: "📋",
    title: "Pair Register",
    description: "View all breeding pairs",
  },
  {
    id: "current-round",
    icon: "🥚",
    title: "Current Round",
    description: "Eggs and youngsters",
  },
  {
    id: "statistics",
    icon: "📈",
    title: "Statistics",
    description: "Performance and history",
  },
  {
    id: "archive",
    icon: "📂",
    title: "Archive",
    description: "Documents and records",
  },
];

export default function LoftDashboard({
  loft,
  onSelectModule,
}) {
  return (
    <section className="loft-dashboard">
      <header className="loft-dashboard-header">
        <p className="loft-code">{loft.code}</p>
        <h2>{loft.name}</h2>
      </header>

      <div className="loft-summary">
        <div className="summary-card">
          <strong>{loft.boxes}</strong>
          <span>Nest Boxes</span>
        </div>

        <div className="summary-card">
          <strong>{loft.occupied}</strong>
          <span>Occupied</span>
        </div>

        <div className="summary-card">
          <strong>{loft.eggs}</strong>
          <span>Eggs</span>
        </div>

        <div className="summary-card">
          <strong>{loft.youngsters}</strong>
          <span>Youngsters</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {dashboardTiles.map((tile) => (
          <button
            key={tile.id}
            className="dashboard-tile"
            type="button"
            onClick={() => onSelectModule?.(tile.id)}
          >
            <span>{tile.icon}</span>
            <h3>{tile.title}</h3>
            <p>{tile.description}</p>
          </button>
        ))}
      </div>
    </section>
  );
}