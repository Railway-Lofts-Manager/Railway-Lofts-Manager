import "./StrayProfileModal.css";

function formatDate(value) {
  if (!value) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export default function StrayProfileModal({ stray, treatments, onClose }) {
  return (
    <div className="modal-backdrop stray-profile-backdrop">
      <section className="modal stray-profile-modal">
        <header><div><p>Incoming stray profile</p><h3>{stray.strayId}</h3><strong>{stray.ringNumber}</strong></div><button type="button" className="close" onClick={onClose}>×</button></header>
        <div className="stray-profile-summary"><span>Status<strong>{stray.status}</strong></span><span>Recorded visits<strong>{stray.visits.length}</strong></span><span>Loft ID<strong>{stray.transferredBirdId || "Not transferred"}</strong></span><span>Owner<strong>{stray.ownerName || "Unknown"}</strong></span><span>Telephone<strong>{stray.telephone || "Not recorded"}</strong></span><span>Other details<strong>{stray.ownerDetails || "Not recorded"}</strong></span></div>
        <h4>Visit History</h4>
        <div className="stray-profile-list">{stray.visits.map((visit, index) => <article key={visit.admissionId || index}><strong>Visit {index + 1} — {formatDate(visit.arrivalDate)}</strong><span>{visit.outcome || "Currently admitted"}{visit.departureDate ? ` • ${formatDate(visit.departureDate)}` : ""}</span><p>{visit.condition || visit.notes || "No notes recorded."}</p></article>)}</div>
        <h4>Treatments & Observations</h4>
        {treatments.length ? <div className="stray-profile-list">{treatments.map((record) => <article key={record.id}><strong>{formatDate(record.date)} — {record.category}</strong><span>{record.medication || "Observation"}{record.dose ? ` • ${record.dose}` : ""}{record.administrationMethod ? ` • ${record.administrationMethod}` : ""}</span>{record.mixedWithAmount && <small>Mixed with: {record.mixedWithAmount} {record.mixedWithUnit}</small>}<p>{record.observation || "No notes recorded."}</p></article>)}</div> : <p>No treatment records.</p>}
        <footer><button type="button" className="primary-button" onClick={onClose}>Close</button></footer>
      </section>
    </div>
  );
}
