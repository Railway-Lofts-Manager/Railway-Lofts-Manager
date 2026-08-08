import LoftWizard from "../Wizard/LoftWizard";

export default function ExcelImportWizard({
  onBack,
  onChooseWorkbook,
}) {
  return (
    <LoftWizard
      title="Excel Import Wizard"
      description="Import complete bird records from an Excel or CSV file into Loft Commander."
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
          Select your Excel workbook or CSV file to begin.
        </p>

        <button
          className="command-primary-action"
          onClick={onChooseWorkbook}
        >
          📊 Choose Excel or CSV File
        </button>
      </div>
    </LoftWizard>
  );
}
