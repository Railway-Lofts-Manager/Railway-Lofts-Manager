import { useEffect, useMemo, useState } from "react";
import ringStore from "../../data/RingStore";
import RingNumberGenerator from "./RingNumberGenerator";
import "./RingRegister.css";

export default function RingRegister() {
  const [rings, setRings] = useState(ringStore.getRings());

  useEffect(() => ringStore.subscribe(setRings), []);

  const counts = useMemo(() => ({
    total: rings.length,
    available: rings.filter((ring) => ring.status === "available").length,
    assigned: rings.filter((ring) => ring.status === "assigned").length,
  }), [rings]);

  return (
    <div className="ring-register-page">
      <RingNumberGenerator />

      <section className="ring-register-summary">
        <article><strong>{counts.total}</strong><span>Total Rings</span></article>
        <article><strong>{counts.available}</strong><span>Available</span></article>
        <article><strong>{counts.assigned}</strong><span>Assigned</span></article>
      </section>

      <section className="panel ring-register-list">
        <header>
          <h2>Ring Register</h2>
          <p className="muted">All purchased rings and their current status.</p>
        </header>

        {rings.length === 0 ? (
          <p className="ring-register-empty">No ring batches have been saved yet.</p>
        ) : (
          <div className="ring-register-table-wrap">
            <table>
              <thead><tr><th>Ring Number</th><th>Status</th></tr></thead>
              <tbody>
                {rings.map((ring) => (
                  <tr key={ring.ringNumber}>
                    <td>{ring.ringNumber}</td>
                    <td><span className={`ring-status ${ring.status}`}>{ring.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
