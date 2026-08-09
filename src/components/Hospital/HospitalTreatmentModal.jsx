import { useState } from "react";
import hospitalStore from "../../data/HospitalStore";
import "./HospitalTreatmentModal.css";

function today() { return new Date().toISOString().slice(0, 10); }

export default function HospitalTreatmentModal({ admission, onSave, onClose }) {
  const medicationList = hospitalStore.getMedicationList();
  const [addingMedication, setAddingMedication] = useState(medicationList.length === 0);
  const [medicationChoice, setMedicationChoice] = useState("");
  const [form, setForm] = useState({
    date: today(),
    category: "Medication",
    medication: "",
    administrationMethod: "Drinking water",
    doseAmount: "",
    doseUnit: "ml",
    mixedWithAmount: "",
    mixedWithUnit: "litres of water",
    observation: "",
    followUpDate: "",
  });
  const [error, setError] = useState("");

  function change(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError("");
  }

  function chooseMedication(event) {
    const value = event.target.value;
    setMedicationChoice(value);

    if (value === "__add_new__") {
      setAddingMedication(true);
      setForm((current) => ({ ...current, medication: "" }));
    } else {
      setAddingMedication(false);
      setForm((current) => ({ ...current, medication: value }));
    }
    setError("");
  }

  function submit(event) {
    event.preventDefault();
    if (!form.medication.trim() && !form.observation.trim()) {
      setError("Enter a medication, treatment or observation.");
      return;
    }
    onSave(form);
  }

  return (
    <div className="modal-backdrop hospital-treatment-backdrop">
      <form className="modal hospital-treatment-modal" onSubmit={submit}>
        <header><div><p>Treatment record</p><h3>{admission.ringNumber}</h3></div><button type="button" className="close" onClick={onClose}>×</button></header>
        {error && <div className="form-error">{error}</div>}
        <div className="form-grid">
          <label>Date<input type="date" name="date" value={form.date} onChange={change} /></label>
          <label>Entry type<select name="category" value={form.category} onChange={change}><option>Medication</option><option>Vaccination</option><option>Examination</option><option>Observation</option><option>Follow-up</option></select></label>
          <label className="full">Medication / Treatment<select value={medicationChoice} onChange={chooseMedication}><option value="">Select medication or treatment</option>{medicationList.map((name) => <option key={name} value={name}>{name}</option>)}<option value="__add_new__">+ Add New Medication/Treatment</option></select></label>
          {addingMedication && <label className="full">New Medication / Treatment<input name="medication" value={form.medication} onChange={change} placeholder="Enter the product or treatment name" /></label>}
          <label>How administered<select name="administrationMethod" value={form.administrationMethod} onChange={change}><option>Drinking water</option><option>On food</option><option>Oral / Direct to bird</option><option>Injection</option><option>Topical / External</option><option>Eye drops</option><option>Nasal drops</option><option>Other</option></select></label>
          <label>Dose amount<input name="doseAmount" type="number" min="0" step="any" value={form.doseAmount} onChange={change} /></label>
          <label>Dose unit<select name="doseUnit" value={form.doseUnit} onChange={change}><option>ml</option><option>litres</option><option>fluid ounces</option><option>teaspoons</option><option>tablespoons</option><option>egg cup</option><option>drops</option><option>grams</option><option>mg</option><option>tablets</option><option>capsules</option><option>sachets</option></select></label>
          <label>Mixed with amount<input name="mixedWithAmount" type="number" min="0" step="any" value={form.mixedWithAmount} onChange={change} placeholder="Optional" /></label>
          <label>Mixed with unit<select name="mixedWithUnit" value={form.mixedWithUnit} onChange={change}><option>litres of water</option><option>ml of water</option><option>fluid ounces of water</option><option>kg of food</option><option>grams of food</option><option>individual feed</option></select></label>
          <label className="full">Observation / Notes<textarea rows="4" name="observation" value={form.observation} onChange={change} /></label>
          <label>Follow-up Date<input type="date" name="followUpDate" value={form.followUpDate} onChange={change} /></label>
        </div>
        <footer><button type="button" className="neutral-button" onClick={onClose}>Cancel</button><button className="primary-button" type="submit">Save Treatment</button></footer>
      </form>
    </div>
  );
}
