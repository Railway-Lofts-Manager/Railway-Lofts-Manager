import React from "react";
import healthcareStore from "../data/HealthcareStore";
import hospitalStore from "../data/HospitalStore";

export default function CommandCentre({
  counts,
  boxAssignments,
  setActivePage,
}) {
  const assignments = Object.values(boxAssignments);

  const eggs = assignments.reduce(
    (total, assignment) => total + Number(assignment.eggs || 0),
    0
  );

  const youngsters = assignments.reduce(
    (total, assignment) => total + Number(assignment.youngsters || 0),
    0
  );

  const healthcareAlerts =
    healthcareStore.getOutstanding().length +
    hospitalStore.getState().admissions.filter((record) => record.status === "Active").length;

  const cards = [
    ["Birds in Loft", counts.total, "B"],
    ["Eggs", eggs, "E"],
    ["Youngsters", youngsters, "Y"],
    ["Health Alerts", healthcareAlerts, "H"],
  ];

  return (
    <>
      <section className="stat-grid">
        {cards.map(([title, value, icon]) => (
          <article className="stat-card" key={title}>
            <span className="stat-icon">{icon}</span>
            <div>
              <p>{title}</p>
              <strong>{value}</strong>
            </div>
          </article>
        ))}
      </section>

      <section className="CommandCentre-grid">
        <article className="panel">
          <h3>Today's Priorities</h3>
          <ul className="task-list">
            <li>Check all drinkers</li>
            <li>Record morning feed</li>
            <li>Inspect breeding boxes</li>
            <li>Review birds under treatment</li>
          </ul>
        </article>

        <article className="panel">
          <h3>Next Race</h3>
          <div className="highlight">
            <div>
              <strong>Kingdown</strong>
              <span>Saturday</span>
            </div>
            <span className="flag">🏁</span>
          </div>

          <button
            className="primary wide"
            onClick={() => setActivePage("Race Centre")}
          >
            Open Race Centre
          </button>
        </article>

        <article className="panel">
          <h3>Quick Start</h3>
          <p className="muted">
            Your bird register and loft planner are ready.
          </p>

          <button
            className="primary wide"
            onClick={() => setActivePage("Bird Register")}
          >
            Open Bird Register
          </button>

          <br />
          <br />

          <button
            className="secondary wide"
            onClick={() => setActivePage("Loft View")}
          >
            Open Loft View
          </button>
        </article>
      </section>
    </>
  );
}
