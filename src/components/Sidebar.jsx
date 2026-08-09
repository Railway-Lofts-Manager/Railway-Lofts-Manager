import { useEffect, useState } from "react";
import settingsStore from "../data/SettingsStore";
import healthcareStore from "../data/HealthcareStore";
import "./Sidebar.css";

const menuItems = [
  { name: "Season Planner", icon: "📅" },
  { name: "Dashboard", icon: "📊" },
  { name: "Bird Register", icon: "🕊️" },
  { name: "Loft Configuration", icon: "🏠" },
  { name: "Loft View", icon: "🏘️" },
  { name: "Breeding Centre", icon: "🥚" },
  { name: "Ring Register", icon: "🔢" },
  { name: "Race Centre", icon: "🏁" },
  { name: "Feed Planner", icon: "🌽" },
  { name: "Product Library", icon: "📦" },
  { name: "Health & Strays", icon: "❤️" },
  { name: "Reports & Analytics", icon: "📈" },
  { name: "Archive Centre", icon: "🗄️" },
];

export default function Sidebar({
  activePage,
  setActivePage,
}) {
  const [settings, setSettings] = useState(
    settingsStore.getSettings(),
  );

  useEffect(() => {
    return settingsStore.subscribe(setSettings);
  }, []);

  function navigationButton(item) {
    const alertCount = item.name === "Health & Strays"
      ? healthcareStore.getOutstanding().length
      : 0;

    return (
      <button
        key={item.name}
        className={
          activePage === item.name ? "active" : ""
        }
        onClick={() => setActivePage(item.name)}
      >
        <span style={{ marginRight: 10 }}>
          {item.icon}
        </span>
        <span className="sidebar-navigation-label">{item.name}{alertCount > 0 && <b className="sidebar-alert-count">{alertCount}</b>}</span>
      </button>
    );
  }

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">LC</div>

        <div>
          <h1>Loft Commander</h1>
          <p>{settings.loftName || "Your Loft"}</p>
          <small>
            {settings.location || "Complete Setup"}
          </small>
        </div>
      </div>

      <nav className="sidebar-main-navigation">
        {menuItems.map(navigationButton)}
      </nav>

      <nav className="sidebar-setup-navigation">
        {navigationButton({
          name: "Setup",
          icon: "⚙️",
        })}
      </nav>

      <div className="version">Version 3.0</div>
    </aside>
  );
}
