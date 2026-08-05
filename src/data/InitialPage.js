import settingsStore from "./SettingsStore";

export default function getInitialPage() {
  const settings = settingsStore.getSettings();

  return settings.setupComplete
    ? "Command Centre"
    : "Setup";
}