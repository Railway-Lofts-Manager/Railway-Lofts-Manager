import "./LoftConfigurationHeader.css";

export default function LoftConfigurationHeader() {
  return (
    <section className="panel loft-configuration-header">
      <p className="loft-configuration-label">
        CUSTOMER SETUP
      </p>

      <h2>Loft Configuration</h2>

      <p className="muted">
        Add and manage the lofts and sections used
        by this customer.
      </p>
    </section>
  );
}