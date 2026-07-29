import { useState } from "react";
import startingRaces from "../data/races";
import RaceForm from "./RaceForm";

export default function RaceCentre() {
  const [races, setRaces] = useState(startingRaces);
  const [showForm, setShowForm] = useState(false);

  function handleAddRace(newRace) {
    setRaces((currentRaces) => [...currentRaces, newRace]);
    setShowForm(false);
  }

  function getStatusClass(status) {
    return `status-badge status-${status.toLowerCase()}`;
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
          <button
            type="button"
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            + Add Race
          </button>
        )}
      </div>

      {showForm && (
        <RaceForm
          onSave={handleAddRace}
          onCancel={() => setShowForm(false)}
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
                    <td>
                      <strong>{race.racePoint}</strong>
                    </td>

                    <td>
                      {race.miles} miles, {race.yards} yards
                    </td>

                    <td>{race.raceDate || "Not set"}</td>

                    <td>
                      <span className={getStatusClass(race.status)}>
                        {race.status}
                      </span>
                    </td>

                    <td>
                      <button type="button" className="secondary-button">
                        Edit
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