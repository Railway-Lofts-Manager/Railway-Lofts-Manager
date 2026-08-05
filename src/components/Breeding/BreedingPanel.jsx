import "./BreedingPanel.css";
import LoftCard from "./LoftCard";

export default function BreedingPanel({
  lofts = [],
  assignments = {},
  onSelectLoft,
}) {
  const getOccupiedBoxes = (loftId) =>
    Object.keys(assignments).filter((key) =>
      key.startsWith(`${loftId}-`),
    ).length;

  return (
    <section className="breeding-panel">
      <header className="breeding-header">
        <p className="breeding-label">
          BREEDING CENTRE
        </p>

        <h2>Breeding Locations</h2>

        <p className="breeding-intro">
          Select a loft to open its nest box planner.
        </p>
      </header>

      <div className="breeding-loft-grid">
        {lofts.map((loft) => (
          <LoftCard
            key={loft.id}
            loft={{
              ...loft,
              nestBoxes: loft.boxes,
              occupied: getOccupiedBoxes(loft.id),
            }}
            onOpen={onSelectLoft}
          />
        ))}
      </div>
    </section>
  );
}