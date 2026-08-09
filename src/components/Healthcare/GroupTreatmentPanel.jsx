import { useMemo, useState } from "react";
import birdStore from "../../data/BirdStore";
import loftStore from "../../data/LoftStore";
import hospitalStore from "../../data/HospitalStore";
import healthcareStore from "../../data/HealthcareStore";
import "./GroupTreatmentPanel.css";

function today() { return new Date().toISOString().slice(0, 10); }

function addDays(dateValue, days) {
  const date = new Date(`${dateValue}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function administrationDates(form, selectedWeekdays) {
  if (form.scheduleType === "Single day") return [form.date];
  if (form.scheduleType === "Consecutive days") {
    return Array.from({ length: Math.max(1, Number(form.durationDays) || 1) }, (_, index) => addDays(form.date, index));
  }

  const dates = [];
  let value = form.date;
  const end = form.endDate || form.date;
  while (value <= end) {
    const day = new Date(`${value}T12:00:00`).getDay();
    if (selectedWeekdays.includes(day)) dates.push(value);
    value = addDays(value, 1);
  }
  return dates;
}

function isAutomaticallyAbsent(bird) {
  const status = String(bird.status || "").toLowerCase();
  return ["hospital", "lost", "died", "dead", "euthanised", "away"].some((word) => status.includes(word));
}

export default function GroupTreatmentPanel({ onSaved }) {
  const lofts = loftStore.getLofts();
  const birds = birdStore.getBirds();
  const hospital = hospitalStore.getState();
  const medicationNames = Array.from(new Set([...hospitalStore.getMedicationList(), ...healthcareStore.getMedicationList()])).sort((a, b) => a.localeCompare(b));
  const [previewing, setPreviewing] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ targetId: "", date: today(), category: "Medication", medicationChoice: "", medication: "", administrationMethod: "Drinking water", doseAmount: "", doseUnit: "ml", mixedWithAmount: "", mixedWithUnit: "litres of water", scheduleType: "Single day", durationDays: "1", endDate: "", session: "Any time", followUpDate: "", notes: "" });
  const [selectedWeekdays, setSelectedWeekdays] = useState([1, 2, 3, 4, 5]);
  const [attendance, setAttendance] = useState({});

  const targetLoft = lofts.find((loft) => loft.id === form.targetId);
  const candidates = useMemo(() => {
    if (!targetLoft) return [];
    const direct = birds.filter((bird) => bird.loftId === targetLoft.id || bird.loft === targetLoft.name);
    const hospitalBirds = hospital.admissions
      .filter((admission) => admission.status === "Active" && (admission.previousLoftId === targetLoft.id || admission.previousLoft === targetLoft.name))
      .map((admission) => birds.find((bird) => bird.birdId === admission.birdId))
      .filter(Boolean);
    return Array.from(new Map([...direct, ...hospitalBirds].map((bird) => [bird.birdId, bird])).values());
  }, [birds, hospital.admissions, targetLoft]);

  function change(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setMessage("");
  }

  function chooseMedication(event) {
    const value = event.target.value;
    setForm((current) => ({ ...current, medicationChoice: value, medication: value === "__add__" ? "" : value }));
  }

  function buildPreview(event) {
    event.preventDefault();
    if (!targetLoft) return setMessage("Select a loft or section.");
    if (!form.medication.trim()) return setMessage("Select or enter a medication or treatment.");
    if (!candidates.length) return setMessage("No birds are linked to that loft or section.");

    const initial = {};
    candidates.forEach((bird) => {
      const absent = isAutomaticallyAbsent(bird) || bird.loft === "Hospital / Quarantine";
      initial[bird.birdId] = { selected: !absent, reason: absent ? `${bird.status || "Absent"}${bird.loft ? ` — ${bird.loft}` : ""}` : "" };
    });
    setAttendance(initial);
    setPreviewing(true);
  }

  function toggleBird(birdId) {
    setAttendance((current) => ({ ...current, [birdId]: { ...current[birdId], selected: !current[birdId].selected, reason: current[birdId].selected ? "Absent at time of treatment" : "" } }));
  }

  function saveTreatment() {
    const treatedBirds = candidates.filter((bird) => attendance[bird.birdId]?.selected).map((bird) => ({ birdId: bird.birdId, ringNumber: bird.ringNumber }));
    const excludedBirds = candidates.filter((bird) => !attendance[bird.birdId]?.selected).map((bird) => ({ birdId: bird.birdId, ringNumber: bird.ringNumber, currentLoft: bird.loft || "Unknown", reason: attendance[bird.birdId]?.reason || "Not present", status: "Outstanding" }));

    const dates = administrationDates(form, selectedWeekdays);
    if (!dates.length) {
      setMessage("The selected schedule does not contain any administration dates.");
      setPreviewing(false);
      return;
    }
    const administrations = dates.map((date, index) => ({ id: `administration-${Date.now()}-${index}`, date, status: "Pending" }));
    healthcareStore.saveCampaign({ ...form, medication: form.medication.trim(), targetId: targetLoft.id, targetName: targetLoft.name, treatedBirds, excludedBirds, selectedWeekdays, administrations });
    setMessage(`${treatedBirds.length} birds treated. ${excludedBirds.length} added to Outstanding Treatments.`);
    setPreviewing(false);
    onSaved?.();
  }

  return (
    <section className="group-treatment-panel">
      <div className="healthcare-section-heading"><div><p>Whole-loft records</p><h3>Record Loft or Section Treatment</h3></div></div>
      {message && <div className="hospital-message">{message}</div>}
      {!previewing ? (
        <form className="content-card group-treatment-form" onSubmit={buildPreview}>
          <div className="form-grid">
            <label className="full">Loft / Section<select name="targetId" value={form.targetId} onChange={change}><option value="">Select loft or section</option>{lofts.map((loft) => <option key={loft.id} value={loft.id}>{loft.name}</option>)}</select></label>
            <label>Date<input type="date" name="date" value={form.date} onChange={change} /></label>
            <label>Entry type<select name="category" value={form.category} onChange={change}><option>Medication</option><option>Vaccination</option><option>Preventative Treatment</option><option>Supplement</option></select></label>
            <label className="full">Medication / Treatment<select value={form.medicationChoice} onChange={chooseMedication}><option value="">Select</option>{medicationNames.map((name) => <option key={name}>{name}</option>)}<option value="__add__">+ Add New Medication/Treatment</option></select></label>
            {(form.medicationChoice === "__add__" || medicationNames.length === 0) && <label className="full">New Medication / Treatment<input name="medication" value={form.medication} onChange={change} /></label>}
            <label>How administered<select name="administrationMethod" value={form.administrationMethod} onChange={change}><option>Drinking water</option><option>On food</option><option>Oral / Direct to bird</option><option>Injection</option><option>Topical / External</option><option>Eye drops</option><option>Nasal drops</option><option>Other</option></select></label>
            <label>Dose amount<input type="number" min="0" step="any" name="doseAmount" value={form.doseAmount} onChange={change} /></label>
            <label>Dose unit<select name="doseUnit" value={form.doseUnit} onChange={change}><option>ml</option><option>litres</option><option>fluid ounces</option><option>teaspoons</option><option>tablespoons</option><option>egg cup</option><option>drops</option><option>grams</option><option>mg</option><option>tablets</option><option>capsules</option><option>sachets</option></select></label>
            <label>Mixed with amount<input type="number" min="0" step="any" name="mixedWithAmount" value={form.mixedWithAmount} onChange={change} /></label>
            <label>Mixed with unit<select name="mixedWithUnit" value={form.mixedWithUnit} onChange={change}><option>litres of water</option><option>ml of water</option><option>fluid ounces of water</option><option>kg of food</option><option>grams of food</option><option>individual feed</option></select></label>
            <label>Schedule<select name="scheduleType" value={form.scheduleType} onChange={change}><option>Single day</option><option>Consecutive days</option><option>Selected weekdays</option></select></label>
            {form.scheduleType === "Consecutive days" && <label>Number of days<input type="number" min="1" name="durationDays" value={form.durationDays} onChange={change} /></label>}
            {form.scheduleType === "Selected weekdays" && <><label>Schedule end date<input type="date" name="endDate" value={form.endDate} onChange={change} min={form.date} /></label><div className="weekday-selector full"><span>Administration days</span>{[[1,"Mon"],[2,"Tue"],[3,"Wed"],[4,"Thu"],[5,"Fri"],[6,"Sat"],[0,"Sun"]].map(([day,label]) => <label key={day}><input type="checkbox" checked={selectedWeekdays.includes(day)} onChange={() => setSelectedWeekdays((current) => current.includes(day) ? current.filter((value) => value !== day) : [...current, day])} />{label}</label>)}</div></>}
            <label>Time / Session<select name="session" value={form.session} onChange={change}><option>Any time</option><option>Morning</option><option>Evening</option><option>Morning and evening</option></select></label>
            <label>Follow-up date<input type="date" name="followUpDate" value={form.followUpDate} onChange={change} /></label>
            <label className="full">Notes<textarea rows="3" name="notes" value={form.notes} onChange={change} /></label>
          </div>
          <div className="form-actions"><button className="primary-button" type="submit">Check Birds Present</button></div>
        </form>
      ) : (
        <div className="content-card treatment-attendance">
          <div className="card-heading"><div><p className="card-kicker">Attendance check</p><h3>{targetLoft.name}</h3></div><span className="record-count">{candidates.length} birds</span></div>
          <p className="attendance-help">Birds recorded away, lost or in Hospital are automatically unchecked. Review the list before saving.</p>
          <div className="attendance-list">{candidates.map((bird) => { const entry = attendance[bird.birdId] || {}; return <div className={entry.selected ? "attendance-bird selected" : "attendance-bird excluded"} key={bird.birdId}><label><input type="checkbox" checked={Boolean(entry.selected)} onChange={() => toggleBird(bird.birdId)} /><span><strong>{bird.ringNumber}</strong><small>{bird.birdId} • {bird.status} • {bird.loft || "Location unknown"}</small></span></label>{!entry.selected && <input value={entry.reason || ""} onChange={(event) => setAttendance((current) => ({ ...current, [bird.birdId]: { ...current[bird.birdId], reason: event.target.value } }))} placeholder="Reason missed or excluded" />}</div>; })}</div>
          <div className="attendance-actions"><button className="neutral-button" onClick={() => setPreviewing(false)}>Back</button><button className="primary-button" onClick={saveTreatment}>Save Group Treatment</button></div>
        </div>
      )}
    </section>
  );
}
