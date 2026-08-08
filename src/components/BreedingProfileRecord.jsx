import useBreedingSeasons from "../hooks/useBreedingSeasons";
import birdStore from "../data/BirdStore";
import "./BreedingProfileRecord.css";

function normaliseRing(value) {
  return String(value || "").trim().toUpperCase();
}

function formatDate(value) {
  if (!value) return "Not recorded";

  const [year, month, day] = String(value).slice(0, 10).split("-");
  return year && month && day ? `${day}/${month}/${year}` : value;
}

function getCurrentAssignments() {
  try {
    const saved = localStorage.getItem("loft-commander-boxes");
    const assignments = saved ? JSON.parse(saved) : {};
    return assignments && typeof assignments === "object" ? assignments : {};
  } catch {
    return {};
  }
}

function collectRecords(seasons, bird) {
  const birdRing = normaliseRing(bird?.ringNumber);
  const assignments = getCurrentAssignments();
  const parentRecords = [];
  const originRecords = [];

  seasons.forEach((season) => {
    Object.values(season.loftRecords || {}).forEach((boxRecord) => {
      const assignment = assignments[boxRecord.id] || {};

      (boxRecord.entries || []).forEach((entry) => {
        const cockRing = normaliseRing(
          entry.cockRingNumber || assignment.cock,
        );
        const henRing = normaliseRing(
          entry.henRingNumber || assignment.hen,
        );
        const youngsterRing = normaliseRing(entry.ringNumber);

        const common = {
          ...entry,
          season: season.year,
          loftId: boxRecord.loftId,
          boxNumber: boxRecord.boxNumber,
          cockRing,
          henRing,
          youngsterRing,
        };

        if (birdRing && (birdRing === cockRing || birdRing === henRing)) {
          const isCock = birdRing === cockRing;
          parentRecords.push({
            ...common,
            role: isCock ? "Sire" : "Dam",
            mateRing: isCock ? henRing : cockRing,
          });
        }

        if (
          (entry.youngBirdId && entry.youngBirdId === bird?.birdId) ||
          (birdRing && youngsterRing === birdRing)
        ) {
          originRecords.push(common);
        }
      });
    });
  });

  return { parentRecords, originRecords };
}

function birdLabel(ringNumber) {
  if (!ringNumber) return "Not recorded";
  const linkedBird = birdStore.getBird(ringNumber);
  return linkedBird?.name
    ? `${ringNumber} • ${linkedBird.name}`
    : ringNumber;
}

export default function BreedingProfileRecord({ bird }) {
  const seasons = useBreedingSeasons();
  const { parentRecords, originRecords } = collectRecords(seasons, bird);
  const youngsters = parentRecords.filter((record) => record.youngsterRing);

  return (
    <div className="profile-section breeding-profile-record">
      <div className="profile-section-heading command-section-heading">
        <div>
          <p className="profile-label">Permanent breeding history</p>
          <h3>Breeding Record</h3>
        </div>

        <span className="breeding-record-count">
          {parentRecords.length} {parentRecords.length === 1 ? "entry" : "entries"}
        </span>
      </div>

      {originRecords.length > 0 && (
        <section className="breeding-origin-panel">
          <div className="breeding-profile-subheading">
            <div>
              <small>ORIGIN</small>
              <h4>Birth and Parentage</h4>
            </div>
          </div>

          {originRecords.map((record) => (
            <dl key={`origin-${record.id}`} className="breeding-origin-grid">
              <div><dt>Sire</dt><dd>{birdLabel(record.cockRing)}</dd></div>
              <div><dt>Dam</dt><dd>{birdLabel(record.henRing)}</dd></div>
              <div><dt>Season</dt><dd>{record.season}</dd></div>
              <div><dt>Nest Box</dt><dd>{record.boxNumber || "Not recorded"}</dd></div>
              <div><dt>Date Laid</dt><dd>{formatDate(record.laidDate)}</dd></div>
              <div><dt>Hatched</dt><dd>{formatDate(record.hatchDate)}</dd></div>
            </dl>
          ))}
        </section>
      )}

      <div className="breeding-profile-summary">
        <article><span>Breeding Entries</span><strong>{parentRecords.length}</strong></article>
        <article><span>Youngsters Recorded</span><strong>{youngsters.length}</strong></article>
        <article>
          <span>Successful Hatches</span>
          <strong>{parentRecords.filter((record) => record.hatchDate).length}</strong>
        </article>
      </div>

      {parentRecords.length === 0 ? (
        <div className="breeding-record-empty">
          <span>◇</span>
          <h4>No parent breeding records yet</h4>
          <p>
            Entries will appear automatically when this bird is assigned as a
            cock or hen in a breeding nest box.
          </p>
        </div>
      ) : (
        <div className="breeding-record-list">
          {[...parentRecords]
            .sort((a, b) => String(b.laidDate || "").localeCompare(String(a.laidDate || "")))
            .map((record) => (
              <article className="breeding-record-card" key={record.id}>
                <header>
                  <div>
                    <small>SEASON {record.season} • NEST BOX {record.boxNumber}</small>
                    <h4>{record.role} with {birdLabel(record.mateRing)}</h4>
                  </div>
                  <strong>{record.outcome || "In progress"}</strong>
                </header>

                <dl>
                  <div><dt>Date Laid</dt><dd>{formatDate(record.laidDate)}</dd></div>
                  <div><dt>Expected Hatch</dt><dd>{formatDate(record.expectedHatchDate)}</dd></div>
                  <div><dt>Actual Hatch</dt><dd>{formatDate(record.hatchDate)}</dd></div>
                  <div><dt>Youngster</dt><dd>{birdLabel(record.youngsterRing)}</dd></div>
                </dl>

                {record.comments && <p>{record.comments}</p>}
              </article>
            ))}
        </div>
      )}
    </div>
  );
}
