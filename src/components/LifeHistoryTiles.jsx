import "./LifeHistoryTiles.css";

const modules = [
  {
    id: "overview",
    icon: "🏠",
    title: "Overview",
    isActive: true,
  },
  {
    id: "pedigree",
    icon: "🧬",
    title: "Pedigree",
  },
  {
    id: "race",
    icon: "🏁",
    title: "Race Record",
  },
];

export default function LifeHistoryTiles() {
  return (
    <section className="life-history-tiles">
      {modules.map((module) => (
        <button
          key={module.id}
          className={`life-tile ${module.isActive ? "active" : ""}`}
        >
          <span className="life-tile-icon">{module.icon}</span>

          <span className="life-tile-title">
            {module.title}
          </span>
        </button>
      ))}
    </section>
  );
}