import CustomerDetailsForm from
  "../LoftConfiguration/CustomerDetailsForm";
import SetupNavigation from "./SetupNavigation";
import SetupCompletion from "./SetupCompletion";
import SetupModeControl from "./SetupModeControl";
import FactoryResetPanel from "./FactoryResetPanel";
import BackupPanel from "./BackupPanel";
import "./SetupPage.css";

export default function SetupPage({
  onOpenLoftConfiguration,
  onComplete,
}) {
  return (
    <div className="setup-page">
      <header className="panel setup-header">
        <p className="setup-label">
          LOFT COMMANDER SETUP
        </p>

        <h2>Customer Setup</h2>

        <p className="muted">
          Personalise Loft Commander for this
          customer and their loft.
        </p>
      </header>

      <SetupModeControl />

      <CustomerDetailsForm />

      <SetupNavigation
        onOpenLoftConfiguration={
          onOpenLoftConfiguration
        }
      />

      <SetupCompletion onComplete={onComplete} />

      <BackupPanel />

      <FactoryResetPanel />
    </div>
  );
}
