import hospitalStore, { HOSPITAL_AREAS } from "../../data/HospitalStore";
import "./HospitalConfigurationCard.css";

export default function HospitalConfigurationCard({ onOpenHealthcare }) {
  const active = hospitalStore.getState().admissions.filter((record) => record.status === "Active");

  return (
    <section className="hospital-configuration-card">
      <div><p>Specialist accommodation</p><h3>Hospital & Quarantine</h3><span>These holding areas are managed inside Healthcare.</span></div>
      <div className="hospital-configuration-areas">{HOSPITAL_AREAS.map((area) => <article key={area.id}><strong>{area.name}</strong><span>{active.filter((record) => record.areaId === area.id).length}/{area.boxes} occupied</span></article>)}</div>
      <button type="button" onClick={onOpenHealthcare}>Open Hospital & Quarantine</button>
    </section>
  );
}
