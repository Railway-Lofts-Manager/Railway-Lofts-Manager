import "./BirdRegister.css";

export default function BirdRegister({
  birds,
  counts,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  openNewBird,
  openImportWizard,
  exportBirds,
  openBirdProfile,
}) {
  return (
    <div className="bird-register-page">
      <section className="register-toolbar">
        <div>
          <span className="register-kicker">Bird Management</span>
          <h3>Master Bird Register</h3>
          <p>
            {counts.total} bird{counts.total === 1 ? "" : "s"} saved on this computer
          </p>
        </div>

        <div className="register-actions">
          <button
            className="primary"
            onClick={openNewBird}
          >
            + Add Bird
          </button>

          <button
            className="secondary"
            onClick={openImportWizard}
          >
            📥 Import Birds
          </button>

          <button
            className="secondary"
            onClick={exportBirds}
          >
            📤 Export Birds
          </button>
        </div>
      </section>

      <section className="filters">
        <input
          aria-label="Search birds"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Ring Number, Name, Breed or Loft..."
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option>All</option>
          <option>Racing</option>
          <option>Stock</option>
          <option>Young Bird</option>
          <option>Retired</option>
        </select>
      </section>

      <section className="panel table-panel">
        {birds.length ? (
          <div className="table-wrap">
            <table className="bird-register-table">
              <thead>
                <tr>
                  <th>Ring Number</th>
                  <th>Name</th>
                  <th>Breed</th>
                  <th>Sex</th>
                  <th>Colour</th>
                  <th>Age</th>
                  <th>Status</th>
                  <th>Loft</th>
                  <th>Nest Box</th>
                </tr>
              </thead>

              <tbody>
                {birds.map((bird) => (
                  <tr key={bird.id ?? bird.ringNumber}>
                    <td>
                      <button
                        type="button"
                        className="ring-number-link"
                        onClick={() => openBirdProfile(bird)}
                      >
                        {bird.ringNumber}
                      </button>
                    </td>

                    <td>{bird.name || "—"}</td>
                    <td>{bird.breed || "—"}</td>
                    <td>{bird.sex || "—"}</td>
                    <td>{bird.colour || "—"}</td>
                    <td>{bird.ageCategory || "Age Unknown"}</td>

                    <td>
                      <span
                        className={`status status-${String(
                          bird.status || "unknown"
                        )
                          .toLowerCase()
                          .replace(/\s+/g, "-")}`}
                      >
                        {bird.status || "Unknown"}
                      </span>
                    </td>

                    <td>{bird.loft || "—"}</td>
                    <td>{bird.nestBox || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <span>LC</span>
            <h3>No birds found</h3>
            <p>Change the search or add your first pigeon.</p>

            <button
              className="primary"
              onClick={openNewBird}
            >
              + Add Bird
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
