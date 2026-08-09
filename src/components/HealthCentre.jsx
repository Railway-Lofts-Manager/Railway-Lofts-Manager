import { useEffect, useState } from "react";
import birdStore from "../data/BirdStore";
import hospitalStore, { HOSPITAL_AREAS } from "../data/HospitalStore";
import HospitalOutcomeModal from "./Hospital/HospitalOutcomeModal";
import HospitalTreatmentModal from "./Hospital/HospitalTreatmentModal";
import StrayProfileModal from "./Hospital/StrayProfileModal";
import HospitalOccupantModal from "./Hospital/HospitalOccupantModal";
import GroupTreatmentPanel from "./Healthcare/GroupTreatmentPanel";
import OutstandingTreatments from "./Healthcare/OutstandingTreatments";
import healthcareStore from "../data/HealthcareStore";
import "./HealthCentre.css";

function today() {
  return new Date().toISOString().slice(0, 10);
}

const emptyForm = {
  birdId: "",
  ringNumber: "",
  areaId: HOSPITAL_AREAS[0].id,
  boxNumber: "1",
  admittedDate: today(),
  reason: "",
  notes: "",
  ownerDetails: "",
  ownerName: "",
  telephone: "",
  matchedStrayId: "",
};

export default function HealthCentre() {
  const [hospital, setHospital] = useState(() => hospitalStore.getState());
  const [intakeType, setIntakeType] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [activeView, setActiveView] = useState("boxes");
  const [outcomeAdmission, setOutcomeAdmission] = useState(null);
  const [treatmentAdmission, setTreatmentAdmission] = useState(null);
  const [selectedStray, setSelectedStray] = useState(null);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [healthcareView, setHealthcareView] = useState("hospital");
  const [healthcareRefresh, setHealthcareRefresh] = useState(0);
  const birds = birdStore.getBirds();
  const activeAdmissions = hospital.admissions.filter((record) => record.status === "Active");
  const strayMatches = intakeType === "stray" ? hospitalStore.findStrayMatches(form) : [];

  useEffect(() => {
    const currentHospital = hospitalStore.getState();
    let repaired = false;

    currentHospital.admissions
      .filter((admission) => admission.status === "Active" && admission.formerStrayId)
      .forEach((admission) => {
        const bird = birdStore.getBird(admission.ringNumber);

        if (bird?.loft && bird.loft !== "Hospital / Quarantine") {
          hospitalStore.completeActiveAdmissionForBird(bird.birdId, bird.loft);
          repaired = true;
        }
      });

    if (repaired) setHospital(hospitalStore.getState());
  }, []);

  function refresh() {
    setHospital(hospitalStore.getState());
  }

  function openIntake(type) {
    setIntakeType(type);
    setForm({ ...emptyForm, admittedDate: today() });
    setMessage("");
  }

  function availableBoxes(areaId) {
    const area = HOSPITAL_AREAS.find((record) => record.id === areaId);
    return Array.from({ length: area?.boxes || 0 }, (_, index) => index + 1).filter(
      (boxNumber) => !activeAdmissions.some(
        (admission) => admission.areaId === areaId && admission.boxNumber === boxNumber,
      ),
    );
  }

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => {
      const next = { ...current, [name]: value };
      if (name === "areaId") next.boxNumber = String(availableBoxes(value)[0] || "");
      return next;
    });
  }

  function submitIntake(event) {
    event.preventDefault();

    if (!form.boxNumber) {
      setMessage("There are no empty boxes in that area.");
      return;
    }

    if (intakeType === "owned") {
      const bird = birds.find((record) => record.birdId === form.birdId);
      if (!bird) {
        setMessage("Please select a bird from your register.");
        return;
      }
      hospitalStore.admitOwnedBird({
        ...form,
        birdId: bird.birdId,
        ringNumber: bird.ringNumber,
        previousLoftId: bird.loftId,
        previousLoft: bird.loft,
        previousSection: bird.section,
        previousStatus: bird.status,
      });
      const area = HOSPITAL_AREAS.find((record) => record.id === form.areaId);
      birdStore.updateBird(bird.ringNumber, {
        status: "Hospital",
        loftId: "",
        loft: "Hospital / Quarantine",
        section: area?.name || "Hospital / Quarantine",
        loftMoveReason: "Admitted to Hospital",
      });
      setMessage(`${bird.ringNumber} admitted to Hospital.`);
    } else {
      if (!form.ringNumber.trim()) {
        setMessage("Please enter the stray bird's ring number.");
        return;
      }
      const result = hospitalStore.admitStray(form);
      if (result.alreadyActive) {
        setMessage(`${result.stray?.strayId || form.ringNumber} is already occupying a holding box.`);
        setIntakeType(null);
        refresh();
        return;
      }
      setMessage(
        result.returning
          ? `${result.stray.strayId} recognised as a returning stray and admitted.`
          : `${result.stray.strayId} created and admitted.`,
      );
    }

    setIntakeType(null);
    refresh();
  }

  function transferToMyLoft(admission, notes) {
    const stray = hospital.strays.find((record) => record.strayId === admission.strayId);
    if (!stray || stray.transferredBirdId) return;

    const added = birdStore.addBird({
      ringNumber: stray.ringNumber,
      status: "Hospital",
      loft: "Hospital / Quarantine",
      formerStrayId: stray.strayId,
      archiveSource: `Incoming stray ${stray.strayId}`,
      originalOwner: [stray.ownerName, stray.telephone, stray.ownerDetails].filter(Boolean).join(" • "),
      notes: notes || `Transferred into loft from stray register on ${today()}.`,
    });

    const bird = birdStore.getBird(stray.ringNumber);
    if (!added || !bird) {
      window.alert("That ring number already exists in the Bird Register.");
      return false;
    }

    hospitalStore.transferStray(stray.strayId, bird.birdId);
    return bird;
  }

  function saveOutcome({ outcome, notes }) {
    const admission = outcomeAdmission;
    if (!admission) return;

    if (outcome === "Given to me / Transfer to My Loft") {
      const bird = transferToMyLoft(admission, notes);
      if (!bird) return;
      setMessage(`${admission.strayId} transferred to ${bird.birdId}. It will remain in its holding box until assigned to another loft.`);
    } else {
      hospitalStore.discharge(admission.id, outcome, notes);

      if (admission.birdId) {
        const bird = birdStore.getBird(admission.ringNumber);
        if (bird) {
          if (outcome === "Returned to loft" && admission.previousLoft) {
            birdStore.updateBird(bird.ringNumber, {
              status: admission.previousStatus || "Racing",
              loftId: admission.previousLoftId || "",
              loft: admission.previousLoft,
              section: admission.previousSection || admission.previousLoft,
              loftMoveReason: "Discharged from Hospital",
            });
          } else if (outcome === "Died" || outcome === "Euthanised") {
            birdStore.updateBird(bird.ringNumber, {
              status: outcome,
              loftId: "",
              loft: "",
              section: "",
            });
          }
        }
      }
      setMessage(`${admission.ringNumber} removed from its holding box: ${outcome}.`);
    }

    setOutcomeAdmission(null);
    refresh();
  }

  function saveTreatment(details) {
    hospitalStore.addTreatment(treatmentAdmission, details);
    setMessage(`Treatment saved for ${treatmentAdmission.ringNumber}.`);
    setTreatmentAdmission(null);
    refresh();
  }

  function admissionForBox(areaId, boxNumber) {
    return activeAdmissions.find(
      (record) => record.areaId === areaId && record.boxNumber === boxNumber,
    );
  }

  return (
    <section className="hospital-centre">
      <header className="hospital-header">
        <div>
          <p className="page-kicker">Health, Treatment & Biosecurity</p>
          <h2>❤️ Health & Strays</h2>
          <p>Manage whole-loft treatments, outstanding birds, Hospital care and permanent health records.</p>
        </div>
        {healthcareView === "hospital" && <div className="hospital-actions">
          <button className="primary-button" onClick={() => openIntake("owned")}>Admit My Bird</button>
          <button className="secondary-button" onClick={() => openIntake("stray")}>Record Incoming Stray</button>
        </div>}
      </header>

      <nav className="healthcare-main-navigation" aria-label="Healthcare sections">
        <button className={healthcareView === "hospital" ? "active" : ""} onClick={() => setHealthcareView("hospital")}>Hospital & Quarantine</button>
        <button className={healthcareView === "treatments" ? "active" : ""} onClick={() => setHealthcareView("treatments")}>Loft Treatments</button>
        <button className={healthcareView === "history" ? "active" : ""} onClick={() => setHealthcareView("history")}>Treatment History</button>
        <button className={healthcareView === "outstanding" ? "active" : ""} onClick={() => setHealthcareView("outstanding")}>Outstanding ({healthcareStore.getOutstanding().length})</button>
      </nav>

      {healthcareView === "hospital" && <nav className="hospital-navigation" aria-label="Hospital sections">
        <button className={activeView === "boxes" ? "active" : ""} onClick={() => setActiveView("boxes")}>Holding Boxes</button>
        <button className={activeView === "owned" ? "active" : ""} onClick={() => setActiveView("owned")}>My Bird History</button>
        <button className={activeView === "strays" ? "active" : ""} onClick={() => setActiveView("strays")}>Stray Register</button>
      </nav>}

      {message && <div className="hospital-message">{message}</div>}

      {healthcareView === "treatments" && <GroupTreatmentPanel onSaved={() => setHealthcareRefresh((value) => value + 1)} />}
      {healthcareView === "outstanding" && <OutstandingTreatments refreshKey={healthcareRefresh} onChanged={() => setHealthcareRefresh((value) => value + 1)} />}

      {healthcareView === "hospital" && activeView === "boxes" && <div className="hospital-area-grid">
        {HOSPITAL_AREAS.map((area) => (
          <article className="hospital-area" key={area.id}>
            <div className="hospital-area-heading">
              <h3>{area.name}</h3>
              <span>{activeAdmissions.filter((record) => record.areaId === area.id).length}/{area.boxes} occupied</span>
            </div>
            <div className="hospital-box-grid">
              {Array.from({ length: area.boxes }, (_, index) => index + 1).map((boxNumber) => {
                const admission = admissionForBox(area.id, boxNumber);
                return (
                  <div
                    className={`hospital-box ${admission ? "occupied clickable" : "empty"}`}
                    key={boxNumber}
                    role={admission ? "button" : undefined}
                    tabIndex={admission ? 0 : undefined}
                    onClick={admission ? () => setSelectedAdmission(admission) : undefined}
                    onKeyDown={admission ? (event) => {
                      if (event.key === "Enter" || event.key === " ") setSelectedAdmission(admission);
                    } : undefined}
                  >
                    <strong>Box {boxNumber}</strong>
                    {!admission ? (
                      <span>Empty</span>
                    ) : (
                      <>
                        <span className="hospital-id">{admission.birdId || admission.strayId}</span>
                        <b>{admission.ringNumber}</b>
                        <small>{admission.subjectType === "stray" ? "Incoming stray" : "My bird"}</small>
                        <span className="hospital-open-record">Click to open record</span>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </article>
        ))}
      </div>}

      {healthcareView === "hospital" && activeView === "strays" && <section className="hospital-register panel">
        <h3>Stray Register</h3>
        {hospital.strays.length === 0 ? (
          <p>No incoming strays recorded.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Stray ID</th><th>Ring Number</th><th>Owner</th><th>Telephone</th><th>Visits</th><th>Last Arrival</th><th>Last Outcome</th><th>Status</th><th>Loft ID</th></tr></thead>
              <tbody>
                {hospital.strays.map((stray) => (
                  <tr key={stray.strayId}>
                    <td><button className="stray-profile-link" onClick={() => setSelectedStray(stray)}>{stray.strayId}</button></td><td>{stray.ringNumber}</td><td>{stray.ownerName || "—"}</td><td>{stray.telephone || "—"}</td><td>{stray.visits.length}</td>
                    <td>{stray.visits.at(-1)?.arrivalDate || "—"}</td><td>{stray.visits.at(-1)?.outcome || "Currently admitted"}</td>
                    <td>{stray.status}</td><td>{stray.transferredBirdId || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>}

      {healthcareView === "hospital" && activeView === "owned" && <section className="hospital-register panel">
        <h3>My Bird Hospital History</h3>
        {hospital.admissions.filter((record) => record.birdId).length === 0 ? (
          <p>No hospital admissions recorded for your birds.</p>
        ) : (
          <div className="table-wrap"><table>
            <thead><tr><th>Bird ID</th><th>Ring Number</th><th>Admitted</th><th>Reason</th><th>Status</th><th>Outcome</th></tr></thead>
            <tbody>{hospital.admissions.filter((record) => record.birdId).map((record) => (
              <tr key={record.id}><td><button className="stray-profile-link" onClick={() => setSelectedAdmission(record)}>{record.birdId}</button></td><td>{record.ringNumber}</td><td>{record.admittedDate}</td><td>{record.reason || "—"}</td><td>{record.status}</td><td>{record.outcome || "—"}</td></tr>
            ))}</tbody>
          </table></div>
        )}
      </section>}

      {healthcareView === "history" && <section className="hospital-register panel">
        <h3>Loft & Section Treatment History</h3>
        {!healthcareStore.getState().campaigns.length ? <p>No whole-loft treatments recorded.</p> : <div className="table-wrap"><table><thead><tr><th>Date</th><th>Loft / Section</th><th>Treatment</th><th>Method</th><th>Course Progress</th><th>Treated</th><th>Excluded</th></tr></thead><tbody>{healthcareStore.getState().campaigns.slice().reverse().map((campaign) => <tr key={campaign.id}><td>{campaign.date}</td><td>{campaign.targetName}</td><td>{campaign.medication}<small>{campaign.doseAmount} {campaign.doseUnit}</small></td><td>{campaign.administrationMethod}</td><td>{(campaign.administrations || []).filter((record) => record.status === "Completed").length}/{(campaign.administrations || []).length || 1} days</td><td>{campaign.treatedBirds.length}</td><td>{campaign.excludedBirds.length}</td></tr>)}</tbody></table></div>}
      </section>}

      {intakeType && (
        <div className="modal-backdrop">
          <form className="modal" onSubmit={submitIntake}>
            <header><h3>{intakeType === "owned" ? "Admit My Bird" : "Record Incoming Stray"}</h3><button type="button" className="close" onClick={() => setIntakeType(null)}>×</button></header>
            {message && <div className="form-error">{message}</div>}
            <div className="form-grid">
              {intakeType === "owned" ? (
                <label className="full">Bird<select name="birdId" value={form.birdId} onChange={handleChange}><option value="">Select bird</option>{birds.map((bird) => <option key={bird.birdId} value={bird.birdId}>{bird.ringNumber} — {bird.birdId}</option>)}</select></label>
              ) : (
                <>
                  <label className="full">Ring Number<input name="ringNumber" value={form.ringNumber} onChange={handleChange} /></label>
                  <label>Owner name<input name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="If known" /></label>
                  <label>Telephone number<input name="telephone" value={form.telephone} onChange={handleChange} placeholder="If known" /></label>
                  <label className="full">Other contact details<input name="ownerDetails" value={form.ownerDetails} onChange={handleChange} placeholder="Address, report reference or other details" /></label>
                  {strayMatches.length > 0 && <div className="stray-match-panel full">
                    <strong>Possible Previous Visitor</strong>
                    <p>Review these matches before creating a new Stray ID.</p>
                    {strayMatches.map(({ stray, reasons }) => <article className={form.matchedStrayId === stray.strayId ? "selected" : ""} key={stray.strayId}>
                      <div><b>{stray.strayId} — {stray.ringNumber}</b><span>Matched: {reasons.join(", ")}</span><small>{stray.ownerName || "Owner unknown"}{stray.telephone ? ` • ${stray.telephone}` : ""} • {stray.visits.length} previous visit{stray.visits.length === 1 ? "" : "s"}</small></div>
                      <button type="button" onClick={() => setForm((current) => ({ ...current, matchedStrayId: stray.strayId }))}>Same bird — use this ID</button>
                    </article>)}
                    {form.matchedStrayId && <button type="button" className="stray-new-record-button" onClick={() => setForm((current) => ({ ...current, matchedStrayId: "" }))}>Different bird — create a new Stray ID</button>}
                  </div>}
                </>
              )}
              <label>Area<select name="areaId" value={form.areaId} onChange={handleChange}>{HOSPITAL_AREAS.map((area) => <option key={area.id} value={area.id}>{area.name}</option>)}</select></label>
              <label>Holding Box<select name="boxNumber" value={form.boxNumber} onChange={handleChange}>{availableBoxes(form.areaId).map((box) => <option key={box} value={box}>Box {box}</option>)}</select></label>
              <label>Date Admitted<input type="date" name="admittedDate" value={form.admittedDate} onChange={handleChange} /></label>
              <label>Reason<input name="reason" value={form.reason} onChange={handleChange} /></label>
              <label className="full">Condition / Notes<textarea name="notes" rows="4" value={form.notes} onChange={handleChange} /></label>
            </div>
            <footer><button type="button" className="neutral-button" onClick={() => setIntakeType(null)}>Cancel</button><button className="primary-button" type="submit">Save Admission</button></footer>
          </form>
        </div>
      )}

      {outcomeAdmission && (
        <HospitalOutcomeModal
          admission={outcomeAdmission}
          onSave={saveOutcome}
          onClose={() => setOutcomeAdmission(null)}
        />
      )}

      {treatmentAdmission && (
        <HospitalTreatmentModal
          admission={treatmentAdmission}
          onSave={saveTreatment}
          onClose={() => setTreatmentAdmission(null)}
        />
      )}

      {selectedStray && (
        <StrayProfileModal
          stray={selectedStray}
          treatments={hospital.treatments.filter((record) => record.strayId === selectedStray.strayId)}
          onClose={() => setSelectedStray(null)}
        />
      )}

      {selectedAdmission && (
        <HospitalOccupantModal
          admission={selectedAdmission}
          treatments={hospital.treatments.filter((record) => record.admissionId === selectedAdmission.id || record.birdId === selectedAdmission.birdId || record.strayId === selectedAdmission.strayId)}
          visitCount={selectedAdmission.strayId ? hospital.strays.find((record) => record.strayId === selectedAdmission.strayId)?.visits.length : hospital.admissions.filter((record) => record.birdId === selectedAdmission.birdId).length}
          onAddTreatment={() => { setTreatmentAdmission(selectedAdmission); setSelectedAdmission(null); }}
          onRecordOutcome={() => { setOutcomeAdmission(selectedAdmission); setSelectedAdmission(null); }}
          onClose={() => setSelectedAdmission(null)}
        />
      )}
    </section>
  );
}
