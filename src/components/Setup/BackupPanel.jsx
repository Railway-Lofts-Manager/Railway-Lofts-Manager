import { downloadBackup } from "../../data/DataBackupService";
import "./BackupPanel.css";

export default function BackupPanel() {
  return (
    <section className="panel backup-panel">
      <div>
        <h3>Full Data Backup</h3>
        <p className="muted">
          Download every bird, loft, ring, breeding season, archive and nest-box assignment.
        </p>
      </div>
      <button type="button" className="primary" onClick={downloadBackup}>
        Download Full Backup
      </button>
    </section>
  );
}
