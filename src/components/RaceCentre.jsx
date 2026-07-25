import races from "../data/races";

export default function RaceCentre() {
  return (
    <section className="panel">

      <h2>🏁 Race Centre</h2>

      <p>
        Welcome to the Loft Commander Race Centre.
      </p>

      <hr />

      <div className="section-header">
  <h3>Current Season</h3>

  <button className="primary-button">
    + Add Race
  </button>
</div>

      <table className="race-table">
        <thead>
          <tr>
            <th>Race</th>
<th>Miles</th>
<th>Yards</th>
<th>Race Date</th>
<th>Status</th>
<th>Actions</th>
          </tr>
        </thead>

        <tbody>

          {races.map((race) => (
 <tr key={race.id}>
  <td>{race.racePoint}</td>
  <td>{race.miles}</td>
  <td>{race.yards}</td>
  <td>{race.raceDate || "-"}</td>
  <td>{race.status}</td>
  <td>
    <button className="edit-button">Edit</button>
  </td>
</tr>
))}

        </tbody>

      </table>

    </section>
  );
}