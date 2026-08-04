import LoftWizard from "../Wizard/LoftWizard";

export default function ExcelImportWizard({
  onBack,
  onChooseWorkbook,
}) {
  return (
    <LoftWizard
      title="Excel Import Wizard"
      description="Import birds from an Excel workbook into Loft Commander."
      currentStep={1}
      onBack={onBack}
      steps={[
        "Select File",
        "Preview",
        "Review",
        "Import",
      ]}
    >
      <div className="wizard-stage">
        <h2>Step 1</h2>

        <p>
          Select your Excel workbook to begin.
        </p>

        <button
          className="command-primary-action"
          onClick={onChooseWorkbook}
        >
          📊 Choose Excel Workbook
        </button>
      </div>
    </LoftWizard>
  );
}