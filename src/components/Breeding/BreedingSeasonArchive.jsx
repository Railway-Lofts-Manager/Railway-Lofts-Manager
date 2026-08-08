import { useMemo, useState } from "react";
import "./BreedingSeasonArchive.css";

function formatDate(value) {
  if (!value) return "—";
  const [year, month, day] = String(value).slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function recordsForSeason(season) {
  return Object.values(season?.loftRecords || {}).sort(
    (a, b) =>
      String(a.loftId).localeCompare(String(b.loftId)) ||
      Number(a.boxNumber) - Number(b.boxNumber),
  );
}

function pairForRecord(record) {
  const firstEntry = record.entries?.[0] || {};
  return {
    cock: record.assignment?.cock || firstEntry.cockRingNumber || "",
    hen: record.assignment?.hen || firstEntry.henRingNumber || "",
  };
}

export default function BreedingSeasonArchive({
  open,
  seasons = [],
  lofts = [],
  onClose,
}) {
  const archivedSeasons = useMemo(
    () =>
      seasons
        .filter((season) => season.status === "archived")
        .sort((a, b) => Number(b.year) - Number(a.year)),
    [seasons],
  );
  const [selectedYear, setSelectedYear] = useState("");
  const [openBoxId, setOpenBoxId] = useState(null);

  if (!open) return null;

  const selectedSeason =
    archivedSeasons.find((season) => String(season.year) === selectedYear) ||
    archivedSeasons[0] ||
    null;
  const records = recordsForSeason(selectedSeason);
  const entries = records.flatMap((record) => record.entries || []);
  const loftName = (loftId) =>
    lofts.find((loft) => loft.id === loftId)?.name || loftId || "Unknown loft";

  function closeArchive() {
    setOpenBoxId(null);
    onClose?.();
  }

  return (
    <div
      className="breeding-archive-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && closeArchive()}
    >
      <section className="breeding-archive-modal">
        <header className="breeding-archive-header">
          <div>
            <p>BREEDING RECORDS • READ ONLY</p>
            <h3>Breeding Season Archive</h3>
          </div>
          <button type="button" onClick={closeArchive}>×</button>
        </header>

        {selectedSeason ? (
          <>
            <div className="breeding-archive-toolbar">
              <label>
                Archived season
                <select
                  value={selectedSeason.year}
                  onChange={(event) => {
                    setSelectedYear(event.target.value);
                    setOpenBoxId(null);
                  }}
                >
                  {archivedSeasons.map((season) => (
                    <option key={season.id} value={season.year}>{season.year}</option>
                  ))}
                </select>
              </label>
              <span>Closed {formatDate(selectedSeason.closedAt)}</span>
            </div>

            <div className="breeding-archive-summary">
              <article><span>Occupied Boxes</span><strong>{records.length}</strong></article>
              <article><span>Breeding Entries</span><strong>{entries.length}</strong></article>
              <article><span>Youngsters Rung</span><strong>{entries.filter((entry) => entry.ringNumber).length}</strong></article>
              <article><span>Hatched</span><strong>{entries.filter((entry) => entry.hatchDate).length}</strong></article>
            </div>

            <div className="breeding-archive-records">
              {records.length === 0 ? (
                <p className="breeding-archive-empty">No breeding records were saved for this season.</p>
              ) : (
                records.map((record) => {
                  const pair = pairForRecord(record);
                  const isOpen = openBoxId === record.id;
                  return (
                    <article className="breeding-archive-box" key={record.id}>
                      <button type="button" onClick={() => setOpenBoxId(isOpen ? null : record.id)}>
                        <div>
                          <small>{loftName(record.loftId)}</small>
                          <h4>Nest Box {record.boxNumber}</h4>
                        </div>
                        <div className="archive-pair">
                          <span>Cock: {pair.cock || "Not recorded"}</span>
                          <span>Hen: {pair.hen || "Not recorded"}</span>
                        </div>
                        <strong>{record.entries?.length || 0} entries {isOpen ? "▲" : "▼"}</strong>
                      </button>

                      {isOpen && (
                        <div className="archive-entry-table-wrap">
                          <table>
                            <thead>
                              <tr><th>Laid</th><th>Hatched</th><th>Ring</th><th>Outcome</th><th>Comments</th></tr>
                            </thead>
                            <tbody>
                              {(record.entries || []).map((entry) => (
                                <tr key={entry.id}>
                                  <td>{formatDate(entry.laidDate)}</td>
                                  <td>{formatDate(entry.hatchDate)}</td>
                                  <td>{entry.ringNumber || "—"}</td>
                                  <td>{entry.outcome || "—"}</td>
                                  <td>{entry.comments || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </article>
                  );
                })
              )}
            </div>
          </>
        ) : (
          <div className="breeding-archive-empty">
            <span>📂</span>
            <h4>No archived breeding seasons yet</h4>
            <p>Completed seasons will appear here after rollover.</p>
          </div>
        )}
      </section>
    </div>
  );
}
