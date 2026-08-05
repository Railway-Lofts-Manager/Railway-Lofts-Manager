import { useEffect, useState } from "react";
import settingsStore from "../data/SettingsStore";
import "./Topbar.css";

export default function Topbar({ activePage }) {
  const [settings, setSettings] = useState(
    settingsStore.getSettings(),
  );

  useEffect(() => {
    return settingsStore.subscribe(setSettings);
  }, []);

  const firstName =
    settings.ownerName.trim().split(" ")[0] ||
    "Fancier";

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow topbar-customer-name">
          Welcome back, {firstName}
        </p>

        <h2>{activePage}</h2>
      </div>

      <div className="season">
        <span>Season</span>
        <strong>{settings.season}</strong>
      </div>
    </header>
  );
}