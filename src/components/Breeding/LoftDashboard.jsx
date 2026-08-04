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
    description: "Eggs & youngsters",
  },
  {
    id: "statistics",
    icon: "📈",
    title: "Statistics",
    description: "Performance & history",
  },
  {
    id: "archive",
    icon: "📂",
    title: "Archive",
    description: "Documents & records",
  },
];

export default function LoftDashboard({
  loft = {
    code: "GS2",
    name: "Graham's Shed 2",
    nestBoxes: 9,
    occupied: 0,
    eggs: 0,
    youngsters: 0,
  },
}) {
  return (
    <section className="loft-dashboard">

      <header className="loft-dashboard-header">

        <p className="loft-code">
          {loft.code}
        </p>

        <h2>{loft.name}</h2>

      </header>

      <div className="loft-summary">

        <div className="summary-card">
          <strong>{loft.nestBoxes}</strong>
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