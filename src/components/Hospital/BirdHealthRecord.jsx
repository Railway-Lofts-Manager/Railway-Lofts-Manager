import hospitalStore from "../../data/HospitalStore";
import healthcareStore from "../../data/HealthcareStore";
import "./BirdHealthRecord.css";

function formatDate(value) {
  if (!value) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export default function BirdHealthRecord({ bird }) {
  const hospital = hospitalStore.getState();
  const treatments = [
    ...hospitalStore.getTreatmentsForBird(bird),
    ...healthcareStore.getBirdRecords(bird),
  ].sort((a, b) => String(b.date).localeCompare(String(a.date)));
  const admissions = hospital.admissions.filter((record) => record.birdId === bird.birdId || record.formerStrayId === bird.formerStrayId || record.strayId === bird.formerStrayId);

  return (
    <div className="profile-section bird-health-record">
      <div className="profile-section-heading command-section-heading"><div><p className="profile-label">Permanent medical history</p><h3>Hospital Record</h3></div><span>{treatments.length} treatment{treatments.length === 1 ? "" : "s"}</span></div>
      {bird.formerStrayId && <div className="health-history-link">Previous identity: <strong>{bird.formerStrayId}</strong>. All pre-transfer treatment records are included.</div>}
      <h4>Admissions</h4>
      {admissions.length ? <div className="health-record-list">{admissions.map((record) => <article key={record.id}><strong>{formatDate(record.admittedDate)} — {record.reason || "Hospital admission"}</strong><span>{record.status}{record.outcome ? ` • ${record.outcome}` : ""}</span><p>{record.notes || "No admission notes."}</p></article>)}</div> : <p className="health-empty">No Hospital admissions recorded.</p>}
      <h4>Treatments & Observations</h4>
      {treatments.length ? <div className="health-record-list">{treatments.map((record) => <article key={record.id}><strong>{formatDate(record.date)} — {record.category}</strong><span>{record.medication || "Observation"}{record.dose ? ` • ${record.dose}` : ""}{record.administrationMethod ? ` • ${record.administrationMethod}` : ""}</span>{record.completionStatus && <small>Status: {record.completionStatus}{record.catchUpDate ? ` on ${formatDate(record.catchUpDate)}` : ""}</small>}{record.mixedWithAmount && <small>Mixed with: {record.mixedWithAmount} {record.mixedWithUnit}</small>}<p>{record.observation || "No additional notes."}</p>{record.followUpDate && <small>Follow-up: {formatDate(record.followUpDate)}</small>}</article>)}</div> : <p className="health-empty">No treatments or observations recorded.</p>}
    </div>
  );
}
