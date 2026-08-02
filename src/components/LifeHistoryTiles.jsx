import "./LifeHistoryTiles.css";

const modules = [
  {
    id: "overview",
    icon: "🏠",
    title: "Overview",
  },
  {
    id: "pedigree",
    icon: "🧬",
    title: "Pedigree",
  },
  {
    id: "racing",
    icon: "🏁",
    title: "Race Record",
  },
  {
    id: "breeding",
    icon: "🥚",
    title: "Breeding",
  },
  {
    id: "training",
    icon: "✈️",
    title: "Training",
  },
  {
    id: "health",
    icon: "❤️",
    title: "Health",
  },
  {
    id: "photos",
    icon: "📷",
    title: "Photos",
  },
  {
    id: "documents",
    icon: "📄",
    title: "Documents",
  },
  {
    id: "notes",
    icon: "📝",
    title: "Notes",
  },
  {
    id: "timeline",
    icon: "🕒",
    title: "Timeline",
  },
  {
    id: "archive",
    icon: "🗃️",
    title: "Archive",
  },
];

export default function LifeHistoryTiles({ onTabChange }) {
  return (
    <section className="life-history-tiles">
      {modules.map((module) => (
        <button
          key={module.id}
          type="button"
          className="life-tile"
          onClick={() => onTabChange(module.id)}
        >
          <span className="life-tile-icon">
            {module.icon}
          </span>

          <span className="life-tile-title">
            {module.title}
          </span>
        </button>
      ))}
    </section>
  );
}