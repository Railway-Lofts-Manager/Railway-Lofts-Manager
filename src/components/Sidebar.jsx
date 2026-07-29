export default function Sidebar({ activePage, setActivePage }) {
  const menuItems = [
    { name: "Command Centre", icon: "🎯" },
    { name: "Dashboard", icon: "📊" },
    { name: "Bird Register", icon: "🕊️" },
    { name: "Loft Configuration", icon: "🏠" },
    { name: "Loft View", icon: "🏘️" },
    { name: "Breeding Centre", icon: "🥚" },
    { name: "Race Centre", icon: "🏁" },
    { name: "Health Centre", icon: "🏥" },
    { name: "Season Planner", icon: "📅" },
    { name: "Reports & Analytics", icon: "📈" },
    { name: "Archive Centre", icon: "🗄️" },
  ];

  return (
    <aside className="sidebar">

      <div className="brand">
        <div className="brand-mark">LC</div>

        <div>
          <h1>Loft Commander</h1>
          <p>Railway Lofts</p>
          <small>Church Lane</small>
        </div>
      </div>

      <nav>
        {menuItems.map((item) => (
          <button
            key={item.name}
            className={activePage === item.name ? "active" : ""}
            onClick={() => setActivePage(item.name)}
          >
            <span style={{ marginRight: 10 }}>{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>

      <div className="version">
        Version 3.0
      </div>

    </aside>
  );
}