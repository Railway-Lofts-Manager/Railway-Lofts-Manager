import { useState } from "react";
import factoryReset, {
  consumeFactoryResetResult,
  getFactoryResetPreview,
} from "../../data/FactoryReset";
import "./FactoryResetPanel.css";

export default function FactoryResetPanel() {
  const [confirming, setConfirming] = useState(false);
  const [confirmation, setConfirmation] = useState("");
  const [preview, setPreview] = useState(null);
  const [resetResult] = useState(consumeFactoryResetResult);

  function startReset() {
    setPreview(getFactoryResetPreview());
    setConfirming(true);
  }

  function cancelReset() {
    setConfirming(false);
    setConfirmation("");
    setPreview(null);
  }

  return (
    <section className="panel factory-reset-panel">
      {resetResult && (
        <div className="factory-reset-success">
          <strong>Factory reset completed successfully.</strong>
          <p>Loft Commander is ready for clean customer setup and real data.</p>
        </div>
      )}

      <h3>Full Factory Reset</h3>

      <p className="muted">
        Permanently remove all test settings, lofts, birds, rings, breeding
        seasons, nest-box assignments, movements, timelines and documents.
      </p>

      {!confirming ? (
        <button className="factory-reset-button" type="button" onClick={startReset}>
          Start Factory Reset
        </button>
      ) : (
        <>
          <div className="factory-reset-preview">
            <h4>The following test data will be erased</h4>
            <div><span>Birds and their histories</span><strong>{preview?.birds || 0}</strong></div>
            <div><span>Ring Register entries</span><strong>{preview?.rings || 0}</strong></div>
            <div><span>Configured lofts</span><strong>{preview?.lofts || 0}</strong></div>
            <div><span>Breeding seasons and archives</span><strong>{preview?.breedingSeasons || 0}</strong></div>
            <div><span>Nest-box assignments</span><strong>{preview?.nestBoxAssignments || 0}</strong></div>
            <div><span>Uploaded bird documents</span><strong>{preview?.documents || 0}</strong></div>
          </div>

          <p className="factory-reset-warning">
            This cannot be undone. Type <strong>RESET EVERYTHING</strong> exactly
            to confirm permanent deletion.
          </p>

          <input
            type="text"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            placeholder="Type RESET EVERYTHING"
            autoComplete="off"
          />

          <div className="factory-reset-actions">
            <button className="secondary" type="button" onClick={cancelReset}>
              Cancel
            </button>

            <button
              className="factory-reset-button"
              type="button"
              disabled={confirmation !== "RESET EVERYTHING"}
              onClick={factoryReset}
            >
              Permanently Erase All Test Data
            </button>
          </div>
        </>
      )}
    </section>
  );
}
