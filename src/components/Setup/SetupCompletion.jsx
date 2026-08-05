import { useEffect, useState } from "react";
import useLofts from "../../hooks/useLofts";
import settingsStore from
  "../../data/SettingsStore";
import "./SetupCompletion.css";

export default function SetupCompletion({
  onComplete,
}) {
  const lofts = useLofts();
  const [settings, setSettings] = useState(
    settingsStore.getSettings(),
  );

  useEffect(() => {
    return settingsStore.subscribe(setSettings);
  }, []);

  const detailsComplete =
    settings.ownerName.trim() &&
    settings.loftName.trim();

  const ready =
    Boolean(detailsComplete) && lofts.length > 0;

  function finishSetup() {
    if (!ready) {
      return;
    }

    settingsStore.updateSettings({
      setupComplete: true,
    });

    onComplete?.();
  }

  return (
    <section className="panel setup-completion">
      <div>
        <h3>Finish Setup</h3>

        {settings.setupComplete ? (
          <p className="setup-completion-status">
            ✓ Setup is complete
          </p>
        ) : (
          <p className="muted">
            Save the customer details and configure
            at least one loft to continue.
          </p>
        )}
      </div>

      <button
        className="primary"
        type="button"
        disabled={!ready}
        onClick={finishSetup}
      >
        {settings.setupComplete
          ? "Setup Complete"
          : "Finish Setup"}
      </button>
    </section>
  );
}
