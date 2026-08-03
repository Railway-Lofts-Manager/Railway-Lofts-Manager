export default function ImportPreview({
  birds,
  selectedRows,
  onToggleRow,
  existingRingNumbers = [],
}) {
  const existingSet = new Set(
    existingRingNumbers.map((ring) =>
      String(ring || "").trim().toUpperCase()
    )
  );

  if (!birds.length) {
    return null;
  }

  return (
    <div className="import-preview">
      <div className="import-preview-heading">
        <div>
          <p>IMPORT PREVIEW</p>
          <h3>{birds.length} birds found</h3>
        </div>

        <span>
          {selectedRows.length} selected
        </span>
      </div>

      <div className="import-preview-table-wrapper">
        <table className="import-preview-table">
          <thead>
            <tr>
              <th>Import</th>
              <th>Ring Number</th>
              <th>Colour</th>
              <th>Sex</th>
              <th>Breed</th>
              <th>Race Team</th>
              <th>Status</th>
              <th>Comments</th>
              <th>Result</th>
            </tr>
          </thead>

          <tbody>
            {birds.map((bird, index) => {
              const ringNumber = String(
                bird.ringNumber || ""
              )
                .trim()
                .toUpperCase();

             const result = bird.importStatus;

const alreadyExists = result === "existing";
const duplicate = result === "duplicate";
const invalid = result === "invalid";

              const isSelected =
                selectedRows.includes(index);

              return (
                <tr
                  key={`${ringNumber}-${index}`}
                  className={
                    alreadyExists
                      ? "import-row-duplicate"
                      : ""
                  }
                >
                  <td>
                    <input
                      type="checkbox"
                     checked={
  isSelected &&
  !alreadyExists &&
  !duplicate &&
  !invalid
}
                 disabled={alreadyExists || duplicate || invalid}
                      onChange={() =>
                        onToggleRow(index)
                      }
                      aria-label={`Import ${ringNumber}`}
                    />
                  </td>

                  <td>
                    <strong>
                      {ringNumber ||
                        "Missing ring number"}
                    </strong>
                  </td>

                  <td>{bird.colour || "—"}</td>
                  <td>{bird.sex || "—"}</td>
                  <td>{bird.breed || "—"}</td>
                  <td>{bird.raceTeam || "—"}</td>
                  <td>{bird.status || "—"}</td>
                  <td>{bird.notes || "—"}</td>

                  <td>
                    {alreadyExists ? (
                      <span className="import-result duplicate">
                        Already exists
                      </span>
                    ) : (
                      <span className="import-result ready">
                        Ready
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}