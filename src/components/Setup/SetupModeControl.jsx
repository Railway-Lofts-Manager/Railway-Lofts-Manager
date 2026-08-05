import { useEffect, useState } from "react";
import settingsStore from
  "../../data/SettingsStore";
import "./SetupModeControl.css";

export default function SetupModeControl() {
  const [settings, setSettings] = useState(
    settingsStore.getSettings(),
  );

  useEffect(() => {
    return settingsStore.subscribe(setSettings);
  }, []);

  function editSetup() {
    settingsStore.updateSettings({
      setupComplete: false,
    });
  }

  return (
    <section className="panel setup-mode-control">
      <div>
        <h3>Edit Setup</h3>

        <p className="muted">
          Change customer details or tailor the
          loft configuration. Existing records
          will not be deleted.
        </p>
      </div>

      {settings.setupComplete ? (
        <button
          className="primary"
          type="button"
          onClick={editSetup}
        >
          Edit Setup
        </button>
      ) : (
        <strong>Setup editing is active.</strong>
      )}
    </section>
  );
}