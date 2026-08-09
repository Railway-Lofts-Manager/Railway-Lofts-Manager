import { useState } from "react";
import RaceForm from "./RaceForm";
import raceStore from "../data/RaceStore";
import "./RaceCentre.css";

function formatRaceDate(value) {
  if (!value) return "Not set";

  const [year, month, day] = value.split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

export default function RaceCentre() {
  const [races, setRaces] = useState(() => raceStore.getRaces());
  const [showForm, setShowForm] = useState(false);
  const [editingRace, setEditingRace] = useState(null);

  function refreshRaces() {
    setRaces(raceStore.getRaces());
  }

  function handleSaveRace(race) {
    raceStore.saveRace(race);
    refreshRaces();
    setEditingRace(null);
    setShowForm(false);
  }

  function openAddRace() {
    setEditingRace(null);
    setShowForm(true);
  }

  function openEditRace(race) {
    setEditingRace(race);
    setShowForm(true);
  }

  function cancelForm() {
    setEditingRace(null);
    setShowForm(false);
  }

  function deleteRace(race) {
    const confirmed = window.confirm(
      `Delete ${race.racePoint} from the race programme?`,
    );

    if (!confirmed) return;

    raceStore.deleteRace(race.id);
    refreshRaces();
  }

  function getStatusClass(status) {
    return `status-badge status-${String(status || "upcoming").toLowerCase()}`;
  }

  return (
    <section className="panel race-centre">
      <div className="page-heading">
        <div>
          <p className="page-kicker">Racing Management</p>
          <h2>🏁 Race Centre</h2>
          <p className="page-description">
            Manage your race programme, distances, dates and race status.
          </p>
        </div>

        {!showForm && (
          <button type="button" className="primary-button" onClick={openAddRace}>
            + Add Race
          </button>
        )}
      </div>

      {showForm && (
        <RaceForm
          key={editingRace?.id || "new-race"}
          initialRace={editingRace}
          onSave={handleSaveRace}
          onCancel={cancelForm}
        />
      )}

      <div className="content-card">
        <div className="card-heading">
          <div>
            <p className="card-kicker">Current Season</p>
            <h3>Race Programme</h3>
          </div>

          <span className="record-count">
            {races.length} {races.length === 1 ? "race" : "races"}
          </span>
        </div>

        <div className="table-wrapper">
          <table className="race-table">
            <thead>
              <tr>
                <th>Race Point</th>
                <th>Distance</th>
                <th>Race Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {races.length === 0 ? (
                <tr>
                  <td colSpan="5" className="empty-table-message">
                    No races have been added yet.
                  </td>
                </tr>
              ) : (
                races.map((race) => (
                  <tr key={race.id}>
                    <td><strong>{race.racePoint}</strong></td>
                    <td>{race.miles} miles, {race.yards} yards</td>
                    <td>{formatRaceDate(race.raceDate)}</td>
                    <td>
                      <span className={getStatusClass(race.status)}>
                        {race.status}
                      </span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => openEditRace(race)}
                      >
                        Edit
                      </button>{" "}
                      <button
                        type="button"
                        className="neutral-button"
                        onClick={() => deleteRace(race)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
