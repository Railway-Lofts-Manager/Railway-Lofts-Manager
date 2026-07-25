export default function Dashboard({ birds = [] }) {
  const totalBirds = birds.length;

  const racingBirds = birds.filter(
    b => b.status?.toLowerCase() === "racing"
  ).length;

  const youngBirds = birds.filter(
    b => b.status?.toLowerCase() === "young bird"
  ).length;

  const stockBirds = birds.filter(
    b => b.status?.toLowerCase() === "stock"
  ).length;

  const hospitalBirds = birds.filter(
    b => b.status?.toLowerCase() === "hospital"
  ).length;

  return (
    <section className="panel">

      <h2>🏠 Loft Commander Dashboard</h2>

      <p>Welcome back to Railway Lofts.</p>

      <div className="dashboard-grid">

        <div className="dashboard-card">
          <h3>Total Birds</h3>
          <h1>{totalBirds}</h1>
        </div>

        <div className="dashboard-card">
          <h3>Racing Team</h3>
          <h1>{racingBirds}</h1>
        </div>

        <div className="dashboard-card">
          <h3>Young Birds</h3>
          <h1>{youngBirds}</h1>
        </div>

        <div className="dashboard-card">
          <h3>Stock Birds</h3>
          <h1>{stockBirds}</h1>
        </div>

        <div className="dashboard-card">
          <h3>Hospital</h3>
          <h1>{hospitalBirds}</h1>
        </div>

      </div>

      <hr />

      <h3>Today's Priorities</h3>

      <ul>
        <li>✅ Check breeding pairs</li>
        <li>✅ Exercise racing team</li>
        <li>✅ Refresh grit and minerals</li>
        <li>✅ Inspect hospital birds</li>
      </ul>

      <hr />

      <h3>Quick Actions</h3>

      <div className="dashboard-grid">

        <button>Add Bird</button>

        <button>Breeding Centre</button>

        <button>Race Centre</button>

        <button>Hospital</button>

        <button>Season Planner</button>

      </div>

    </section>
  );
}