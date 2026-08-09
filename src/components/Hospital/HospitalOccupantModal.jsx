import "./HospitalOccupantModal.css";

function formatDate(value) {
  if (!value) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export default function HospitalOccupantModal({ admission, treatments, visitCount, onAddTreatment, onRecordOutcome, onClose }) {
  return (
    <div className="modal-backdrop hospital-occupant-backdrop">
      <section className="modal hospital-occupant-modal">
        <header>
          <div><p>{admission.subjectType === "stray" ? "Incoming stray" : "My bird"}</p><h3>{admission.birdId || admission.strayId}</h3><strong>{admission.ringNumber}</strong></div>
          <button type="button" className="close" onClick={onClose}>×</button>
        </header>

        <div className="hospital-occupant-summary">
          <span>Status<strong>{admission.status}</strong></span>
          <span>Admitted<strong>{formatDate(admission.admittedDate)}</strong></span>
          <span>Recorded visits<strong>{visitCount || 1}</strong></span>
          <span>Holding box<strong>Box {admission.boxNumber}</strong></span>
        </div>

        <div className="hospital-occupant-details">
          <p><strong>Reason:</strong> {admission.reason || "Not recorded"}</p>
          <p><strong>Condition / notes:</strong> {admission.notes || "Not recorded"}</p>
          {admission.outcome && <p><strong>Outcome:</strong> {admission.outcome}</p>}
        </div>

        <h4>Treatments & Observations</h4>
        {treatments.length ? (
          <div className="hospital-occupant-treatments">
            {treatments.map((record) => (
              <article key={record.id}>
                <strong>{formatDate(record.date)} — {record.category}</strong>
                <span>{record.medication || "Observation"}{record.dose ? ` • ${record.dose}` : ""}{record.administrationMethod ? ` • ${record.administrationMethod}` : ""}</span>
                {record.mixedWithAmount && <small>Mixed with: {record.mixedWithAmount} {record.mixedWithUnit}</small>}
                <p>{record.observation || "No additional notes."}</p>
              </article>
            ))}
          </div>
        ) : <p className="hospital-occupant-empty">No treatment entries recorded.</p>}

        <footer>
          <button type="button" className="neutral-button" onClick={onClose}>Close</button>
          {admission.status === "Active" && <button type="button" className="secondary-button" onClick={onAddTreatment}>Add Treatment</button>}
          {admission.status === "Active" && <button type="button" className="primary-button" onClick={onRecordOutcome}>Record Outcome</button>}
        </footer>
      </section>
    </div>
  );
}
