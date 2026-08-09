import { useState } from "react";
import healthcareStore from "../../data/HealthcareStore";
import "./OutstandingTreatments.css";

function today() { return new Date().toISOString().slice(0, 10); }

export default function OutstandingTreatments({ refreshKey, onChanged }) {
  const [message, setMessage] = useState("");
  const outstanding = healthcareStore.getOutstanding();

  function complete(record) {
    const date = window.prompt("Catch-up treatment date:", today());
    if (!date) return;
    healthcareStore.completeCatchUp(record.campaignId, record.birdId, date);
    setMessage(`${record.ringNumber} marked as catch-up completed.`);
    onChanged?.();
  }

  function exempt(record) {
    if (!window.confirm(`Mark ${record.ringNumber} as exempt from this treatment?`)) return;
    healthcareStore.exemptBird(record.campaignId, record.birdId);
    setMessage(`${record.ringNumber} marked exempt.`);
    onChanged?.();
  }

  return (
    <section className="outstanding-treatments" data-refresh={refreshKey}>
      <div className="healthcare-section-heading"><div><p>Follow-up required</p><h3>Outstanding Treatments</h3></div><span className="outstanding-count">{outstanding.length}</span></div>
      {message && <div className="hospital-message">{message}</div>}
      {!outstanding.length ? <div className="content-card outstanding-empty"><h4>No birds are currently outstanding</h4><p>Birds that miss a loft treatment will appear here automatically.</p></div> : <div className="content-card table-wrap"><table><thead><tr><th>Bird</th><th>Current Location</th><th>Missed Treatment</th><th>Group Date</th><th>Reason</th><th>Actions</th></tr></thead><tbody>{outstanding.map((record) => <tr key={`${record.campaignId}-${record.birdId}`}><td><strong>{record.ringNumber}</strong><small>{record.birdId}</small></td><td>{record.currentLoft}</td><td>{record.medication}<small>{record.targetName}</small></td><td>{record.campaignDate}</td><td>{record.reason}</td><td><button className="catch-up-button" onClick={() => complete(record)}>Complete Catch-up</button> <button className="exempt-button" onClick={() => exempt(record)}>Exempt</button></td></tr>)}</tbody></table></div>}
    </section>
  );
}
