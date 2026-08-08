import { useMemo, useRef, useState } from "react";
import * as XLSX from "xlsx";
import ImportPreview from "./ImportPreview";
import birdStore from "../../data/BirdStore";
import "./ImportWizard.css";
import ExcelImportWizard from "./ExcelImportWizard";
import RestoreBackupWizard from "./RestoreBackupWizard";

const COLUMN_ALIASES = {
  ringNumber: [
    "ring number",
    "ring no",
    "ring",
    "ringnumber",
    "pigeon number",
  ],
  colour: ["colour", "color"],
  sex: ["sex", "gender"],
  breed: ["breed", "strain", "family"],
  raceTeam: ["race team", "team"],
  stillInLoft: ["still in loft", "in loft", "current"],
  status: ["status", "bird status"],
  notes: ["comments", "comment", "notes", "remarks"],
};

function normaliseHeading(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

function normaliseRingNumber(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, " ");
}

function findColumn(headings, aliases) {
  return headings.find((heading) =>
    aliases.includes(normaliseHeading(heading))
  );
}

function buildColumnMap(headings) {
  return Object.entries(COLUMN_ALIASES).reduce(
    (map, [field, aliases]) => ({
      ...map,
      [field]: findColumn(headings, aliases),
    }),
    {}
  );
}

function cleanValue(value) {
  if (value === undefined || value === null) {
    return "";
  }

  return String(value).trim();
}

function createBirdFromRow(row, columnMap) {
  const ringNumber = normaliseRingNumber(
    row[columnMap.ringNumber]
  );

  const stillInLoft = cleanValue(
    row[columnMap.stillInLoft]
  ).toLowerCase();

  const importedStatus = cleanValue(
    row[columnMap.status]
  );

  let status = importedStatus || "Unknown";

  if (
    stillInLoft === "yes" ||
    stillInLoft === "y" ||
    stillInLoft === "true"
  ) {
    status = importedStatus || "Active";
  }

  return {
    id:
      globalThis.crypto?.randomUUID?.() ||
      `import-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,

    ringNumber,
    colour: cleanValue(row[columnMap.colour]),
    sex: cleanValue(row[columnMap.sex]),
    breed: cleanValue(row[columnMap.breed]),
    raceTeam: cleanValue(row[columnMap.raceTeam]),
    stillInLoft: cleanValue(
      row[columnMap.stillInLoft]
    ),
    status,
    notes: cleanValue(row[columnMap.notes]),

    name: "",
    family: "",
    loft: "",
    section: "",
    nestBox: "",
    fatherId: "",
    motherId: "",
    archiveSource: "",
    originalOwner: "",
    archived: false,
    importedFromExcel: true,
    importedAt: new Date().toISOString(),
  };
}

export default function ImportWizard({
  existingBirds = [],
  onImportComplete,
  onCancel,
}) {
  const [birds, setBirds] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [message, setMessage] = useState("");
  const [isReading, setIsReading] = useState(false);
  const [isImporting, setIsImporting] =
    useState(false);
  const [activeWizard, setActiveWizard] = useState(null);
  const excelFileInputRef = useRef(null);

  const existingRingNumbers = useMemo(() => {
    const propBirds = existingBirds.map(
      (bird) => bird.ringNumber
    );

    const storedBirds = birdStore
      .getBirds()
      .map((bird) => bird.ringNumber);

    return [...new Set([...propBirds, ...storedBirds])];
  }, [existingBirds]);

  const existingRingSet = useMemo(
    () =>
      new Set(
        existingRingNumbers.map((ring) =>
          normaliseRingNumber(ring)
        )
      ),
    [existingRingNumbers]
  );

  const selectedBirds = selectedRows
    .map((index) => birds[index])
    .filter(Boolean)
    .filter(
      (bird) =>
        !existingRingSet.has(
          normaliseRingNumber(bird.ringNumber)
        )
    );

  const handleFileSelected = async (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsReading(true);
    setMessage("");
    setBirds([]);
    setSelectedRows([]);

    try {
      const data = await file.arrayBuffer();

      const workbook = XLSX.read(data, {
        type: "array",
      });

      const firstSheetName = workbook.SheetNames[0];
      const worksheet =
        workbook.Sheets[firstSheetName];

     const rawRows = XLSX.utils.sheet_to_json(
  worksheet,
  {
    defval: "",
    raw: false,
    range: 1, // Skip the title row ("2025 YOUNG BIRDS")
  }
);

      if (!rawRows.length) {
        throw new Error(
          "No bird records were found in the spreadsheet."
        );
      }

      const headings = Object.keys(rawRows[0]);
      const columnMap = buildColumnMap(headings);

      if (!columnMap.ringNumber) {
        throw new Error(
          "Loft Commander could not find a Ring Number column."
        );
      }

 const seenRingNumbers = new Set();

const importedBirds = rawRows
  .map((row) => createBirdFromRow(row, columnMap))
  .map((bird) => {
    const ring = normaliseRingNumber(bird.ringNumber);

    let importStatus = "ready";

    if (!ring) {
      importStatus = "invalid";
    } else if (existingRingSet.has(ring)) {
      importStatus = "existing";
    } else if (seenRingNumbers.has(ring)) {
      importStatus = "duplicate";
    } else {
      seenRingNumbers.add(ring);
    }

    return {
      ...bird,
      importStatus,
    };
  });

if (!importedBirds.length) {
  throw new Error("No valid ring numbers were found.");
}

const validRows = importedBirds
  .map((bird, index) => ({ bird, index }))
  .filter(({ bird }) => bird.importStatus === "ready")
  .map(({ index }) => index);

      setBirds(importedBirds);
      setSelectedRows(validRows);

      const duplicateCount =
        importedBirds.length - validRows.length;

      setMessage(
        `${importedBirds.length} birds found. ` +
          `${validRows.length} ready to import. ` +
          `${duplicateCount} existing records will be skipped.`
      );
    } catch (error) {
      console.error(error);

      setMessage(
        error instanceof Error
          ? error.message
          : "The spreadsheet could not be read."
      );
    } finally {
      setIsReading(false);
      event.target.value = "";
    }
  };

  const handleToggleRow = (index) => {
    setSelectedRows((current) =>
      current.includes(index)
        ? current.filter(
            (selectedIndex) =>
              selectedIndex !== index
          )
        : [...current, index]
    );
  };

  const handleSelectAll = () => {
    const selectableRows = birds
      .map((bird, index) => ({
        bird,
        index,
      }))
      .filter(
        ({ bird }) =>
          !existingRingSet.has(
            normaliseRingNumber(
              bird.ringNumber
            )
          )
      )
      .map(({ index }) => index);

    setSelectedRows(selectableRows);
  };

  const handleClearSelection = () => {
    setSelectedRows([]);
  };

  const handleImport = () => {
    if (!selectedBirds.length) {
      setMessage(
        "Select at least one new bird to import."
      );
      return;
    }

    setIsImporting(true);

    try {
      const importedCount =
        birdStore.importBirds(selectedBirds);

      setMessage(
        `${importedCount} bird${
          importedCount === 1 ? "" : "s"
        } imported successfully.`
      );

      onImportComplete?.({
        importedCount,
        importedBirds: selectedBirds,
      });

      setSelectedRows([]);
    } catch (error) {
      console.error(error);

      setMessage(
        "The birds could not be imported."
      );
    } finally {
      setIsImporting(false);
    }
  };

  return (
  <section className="import-wizard">
      <input
        ref={excelFileInputRef}
        id="excel-file-input"
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileSelected}
        disabled={isReading || isImporting}
        hidden
      />

      {activeWizard === "backup" ? (
        <RestoreBackupWizard onBack={() => setActiveWizard(null)} />
      ) : activeWizard === "excel" ? (
        <>
          <ExcelImportWizard
            onBack={() => setActiveWizard(null)}
            onChooseWorkbook={() => {
              excelFileInputRef.current?.click();
            }}
          />

          {message && (
            <div className="import-message">
              {message}
            </div>
          )}

          {birds.length > 0 && (
            <>
              <div className="import-selection-toolbar">
                <button
                  type="button"
                  onClick={handleSelectAll}
                >
                  Select all new birds
                </button>

                <button
                  type="button"
                  onClick={handleClearSelection}
                >
                  Clear selection
                </button>
              </div>

              <ImportPreview
                birds={birds}
                selectedRows={selectedRows}
                onToggleRow={handleToggleRow}
                existingRingNumbers={existingRingNumbers}
              />

              <footer className="import-wizard-footer">
                <div>
                  <strong>{selectedBirds.length}</strong>
                  <span> birds selected</span>
                </div>

                <button
                  type="button"
                  className="import-confirm-button"
                  onClick={handleImport}
                  disabled={
                    isImporting ||
                    selectedBirds.length === 0
                  }
                >
                  {isImporting
                    ? "Importing..."
                    : `Import ${selectedBirds.length} Birds`}
                </button>
              </footer>
            </>
          )}
        </>
      ) : (
        <>
          <header className="import-wizard-header">
            <div className="import-title">
              <p className="import-header-label">
                DATA IMPORT
              </p>

              <p className="import-subtitle">
                Import birds, historical records, backups and future
                Loft Commander data into your loft database.
              </p>
            </div>

            {onCancel && (
              <button
                type="button"
                className="import-cancel-button"
                onClick={onCancel}
              >
                ← Back to Bird Register
              </button>
            )}
          </header>

          <div className="import-method-grid">
            <button
              type="button"
              className="import-method-card active"
              onClick={() => setActiveWizard("excel")}
            >
              <div className="import-method-icon">📊</div>

              <h3>Excel Workbook</h3>

              <p>
                Import birds from an existing Excel spreadsheet.
              </p>

              <span className="import-method-status">
                Open →
              </span>
            </button>

            <button
              type="button"
              className="import-method-card"
              disabled
            >
              <div className="import-method-icon">📂</div>

              <h3>Historical Archive</h3>

              <p>
                Import pedigrees, handwritten notes and historical
                documents.
              </p>

              <span className="import-method-status">
                Coming Soon
              </span>
            </button>

            <button
              type="button"
              className="import-method-card active"
              onClick={() => setActiveWizard("backup")}
            >
              <div className="import-method-icon">☁</div>

              <h3>Restore Backup</h3>

              <p>
                Restore a previous Loft Commander backup.
              </p>

              <span className="import-method-status">
                Open →
              </span>
            </button>

            <button
              type="button"
              className="import-method-card"
              disabled
            >
              <div className="import-method-icon">🌐</div>

              <h3>Another Loft Commander</h3>

              <p>
                Transfer birds from another Loft Commander database.
              </p>

              <span className="import-method-status">
                Coming Soon
              </span>
            </button>
          </div>
        </>
      )}
    </section>
  );
}
