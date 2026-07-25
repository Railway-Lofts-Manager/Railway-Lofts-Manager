import React from "react";

export default function BirdRegister({
  birds,
  counts,
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  openNewBird,
  openEditBird,
  deleteBird,
}) {
  return (
    <>
      <section className="register-toolbar">
        <div>
          <h3>Master Bird Register</h3>
          <p>
            {counts.total} bird{counts.total === 1 ? "" : "s"} saved on this computer
          </p>
        </div>

        <button className="primary" onClick={openNewBird}>
          + Add Bird
        </button>
      </section>

      <section className="filters">
        <input
          aria-label="Search birds"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search Bird ID, Ring Number, Name, Breed or Loft..."
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
            <table>
              <thead>
                <tr>
                  <th>Bird ID</th>
                  <th>Ring Number</th>
                  <th>Name</th>
                  <th>Breed</th>
                  <th>Sex</th>
                  <th>Colour</th>
                  <th>Status</th>
                  <th>Loft</th>
                  <th>Nest Box</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {birds.map((bird) => (
                  <tr key={bird.id}>
                    <td><strong>{bird.birdId || "—"}</strong></td>
                    <td>
                      <strong>{bird.ringNumber}</strong><br />
                      <small>{bird.year}</small>
                    </td>
                    <td>{bird.name || "—"}</td>
                    <td>{bird.breed || "—"}</td>
                    <td>{bird.sex}</td>
                    <td>{bird.colour || "—"}</td>
                    <td>
                      <span className={`status status-${bird.status.toLowerCase().replace(" ", "-")}`}>
                        {bird.status}
                      </span>
                    </td>
                    <td>{bird.loft || "—"}</td>
                    <td>{bird.nestBox || "—"}</td>
                    <td>
                      <button onClick={() => openEditBird(bird)}>Edit</button>
                      <button className="danger" onClick={() => deleteBird(bird)}>
                        Delete
                      </button>
                    </td>
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
            <button className="primary" onClick={openNewBird}>
              + Add Bird
            </button>
          </div>
        )}
      </section>
    </>
  );
}