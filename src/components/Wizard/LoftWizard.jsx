import "./LoftWizard.css";

export default function LoftWizard({
  title = "Wizard",
  description = "",
  currentStep = 1,
  steps = [],
  onBack,
  children,
}) {
  return (
    <section className="command-wizard">
      <header className="command-wizard-header">
        {onBack && (
          <button
            type="button"
            className="wizard-back-button"
            onClick={onBack}
          >
            ← Back
          </button>
        )}

        <div className="command-wizard-title">
          <h1>{title}</h1>

          {description && (
            <p>{description}</p>
          )}
        </div>
      </header>

      <nav className="wizard-progress">
        {steps.map((step, index) => {
          const number = index + 1;
          const active = number === currentStep;
          const complete = number < currentStep;

          return (
            <div
              key={step}
              className="wizard-progress-item"
            >
              <div
                className={`wizard-progress-circle ${
                  active ? "active" : ""
                } ${complete ? "complete" : ""}`}
              >
                {complete ? "✓" : number}
              </div>

              <span>{step}</span>

              {number < steps.length && (
                <div className="wizard-progress-arrow">
                  ➜
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <section className="command-wizard-content">
        {children}
      </section>
    </section>
  );
}