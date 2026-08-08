import { useState } from "react";
import {
  backupSummary,
  restoreBackup,
  validateBackup,
} from "../../data/DataBackupService";

export default function RestoreBackupWizard({ onBack }) {
  const [backup, setBackup] = useState(null);
  const [summary, setSummary] = useState(null);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");

  async function selectFile(event) {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      const parsed = validateBackup(JSON.parse(await file.text()));
      setBackup(parsed);
      setSummary(backupSummary(parsed));
      setError("");
    } catch (failure) {
      setBackup(null);
      setSummary(null);
      setError(failure instanceof Error ? failure.message : "The backup could not be read.");
    }
  }

  return (
    <section className="restore-backup-wizard">
      <button type="button" className="secondary" onClick={onBack}>← Import methods</button>
      <h2>Restore Loft Commander Backup</h2>
      <p>This replaces all current Loft Commander data with the selected backup.</p>
      <input type="file" accept=".json,application/json" onChange={selectFile} />
      {error && <p className="restore-error">{error}</p>}
      {backup && (
        <div className="restore-preview">
          <h3>Backup from {new Date(backup.createdAt).toLocaleString("en-GB")}</h3>
          <div><span>Birds</span><strong>{summary.birds}</strong></div>
          <div><span>Rings</span><strong>{summary.rings}</strong></div>
          <div><span>Lofts</span><strong>{summary.lofts}</strong></div>
          <div><span>Breeding seasons</span><strong>{summary.seasons}</strong></div>
          <div><span>Documents</span><strong>{summary.documents}</strong></div>
          <label>Type <strong>RESTORE BACKUP</strong> to continue
            <input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} />
          </label>
          <button
            type="button"
            className="restore-confirm"
            disabled={confirmation !== "RESTORE BACKUP"}
            onClick={() => restoreBackup(backup)}
          >
            Replace Current Data and Restore
          </button>
        </div>
      )}
    </section>
  );
}
