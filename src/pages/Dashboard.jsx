
export default function Dashboard() {
  return (
    <div style={{ padding: "30px" }}>
      <h1>🏠 Loft Commander</h1>

      <h2>Welcome Back Shane</h2>

      <p>
        This will become the Command Centre for Railway Lofts.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4,1fr)",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div style={{ padding: "20px", background: "#e8f5e9", borderRadius: "10px" }}>
          <h3>Birds</h3>
          <h1>114</h1>
        </div>

        <div style={{ padding: "20px", background: "#fff8e1", borderRadius: "10px" }}>
          <h3>Eggs</h3>
          <h1>20</h1>
        </div>

        <div style={{ padding: "20px", background: "#e3f2fd", borderRadius: "10px" }}>
          <h3>Young Birds</h3>
          <h1>12</h1>
        </div>

        <div style={{ padding: "20px", background: "#ffebee", borderRadius: "10px" }}>
          <h3>Health Alerts</h3>
          <h1>1</h1>
        </div>
      </div>
    </div>
  );
}