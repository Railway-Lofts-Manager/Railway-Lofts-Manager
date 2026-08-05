import "./LoftConfigurationList.css";
import LoftConfigurationCard from "./LoftConfigurationCard";

export default function LoftConfigurationList({
  lofts = [],
  onEditLoft,
  onAddLoft,
}) {
  return (
    <>
      <section className="loft-configuration-grid">
        {lofts.map((loft) => (
          <LoftConfigurationCard
            key={loft.id}
            loft={loft}
            onEdit={onEditLoft}
          />
        ))}
      </section>

      <section className="panel loft-configuration-actions">
        <button
          className="primary"
          type="button"
          onClick={onAddLoft}
        >
          + Add Loft
        </button>
      </section>
    </>
  );
}