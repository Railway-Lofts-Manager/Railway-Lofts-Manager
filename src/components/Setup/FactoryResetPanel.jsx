import { useState } from "react";
import factoryReset from "../../data/FactoryReset";
import "./FactoryResetPanel.css";

export default function FactoryResetPanel() {
  const [confirming, setConfirming] =
    useState(false);
  const [confirmation, setConfirmation] =
    useState("");

  function cancelReset() {
    setConfirming(false);
    setConfirmation("");
  }

  return (
    <section className="panel factory-reset-panel">
      <h3>Full Factory Reset</h3>

      <p className="muted">
        Permanently remove all customer settings,
        lofts, birds and breeding assignments.
      </p>

      {!confirming ? (
        <button
          className="factory-reset-button"
          type="button"
          onClick={() => setConfirming(true)}
        >
          Start Factory Reset
        </button>
      ) : (
        <>
          <p className="factory-reset-warning">
            This cannot be undone. Type RESET below
            to confirm permanent deletion.
          </p>

          <input
            type="text"
            value={confirmation}
            onChange={(event) =>
              setConfirmation(event.target.value)
            }
            placeholder="Type RESET"
            autoComplete="off"
          />

          <div className="factory-reset-actions">
            <button
              className="secondary"
              type="button"
              onClick={cancelReset}
            >
              Cancel
            </button>

            <button
              className="factory-reset-button"
              type="button"
              disabled={confirmation !== "RESET"}
              onClick={factoryReset}
            >
              Permanently Erase All Data
            </button>
          </div>
        </>
      )}
    </section>
  );
}