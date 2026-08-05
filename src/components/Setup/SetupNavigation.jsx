import "./SetupNavigation.css";

export default function SetupNavigation({
  onOpenLoftConfiguration,
}) {
  return (
    <section className="panel setup-navigation-card">
      <div>
        <h3>Loft Configuration</h3>

        <p className="muted">
          Add and manage this customer’s lofts,
          sections and nest-box quantities.
        </p>
      </div>

      <button
        className="primary"
        type="button"
        onClick={onOpenLoftConfiguration}
      >
        Configure Lofts →
      </button>
    </section>
  );
}