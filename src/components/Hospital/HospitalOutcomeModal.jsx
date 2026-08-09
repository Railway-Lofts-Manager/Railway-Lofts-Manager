import { useState } from "react";
import "./HospitalOutcomeModal.css";

const OWN_BIRD_OUTCOMES = [
  "Returned to loft",
  "Moved to another loft",
  "Died",
  "Euthanised",
];

const STRAY_OUTCOMES = [
  "Returned to owner",
  "Released",
  "Given to me / Transfer to My Loft",
  "Died",
  "Euthanised",
];

export default function HospitalOutcomeModal({ admission, onSave, onClose }) {
  const outcomes = admission.subjectType === "stray" ? STRAY_OUTCOMES : OWN_BIRD_OUTCOMES;
  const [outcome, setOutcome] = useState(outcomes[0]);
  const [notes, setNotes] = useState("");

  function submit(event) {
    event.preventDefault();
    onSave({ outcome, notes });
  }

  return (
    <div className="modal-backdrop hospital-outcome-backdrop">
      <form className="modal hospital-outcome-modal" onSubmit={submit}>
        <header>
          <div>
            <p>Hospital outcome</p>
            <h3>{admission.ringNumber}</h3>
          </div>
          <button type="button" className="close" onClick={onClose}>×</button>
        </header>

        <div className="form-grid">
          <label className="full">
            Outcome
            <select value={outcome} onChange={(event) => setOutcome(event.target.value)}>
              {outcomes.map((option) => <option key={option}>{option}</option>)}
            </select>
          </label>
          <label className="full">
            Notes
            <textarea rows="4" value={notes} onChange={(event) => setNotes(event.target.value)} />
          </label>
        </div>

        <footer>
          <button type="button" className="neutral-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="primary-button">Confirm Outcome</button>
        </footer>
      </form>
    </div>
  );
}
