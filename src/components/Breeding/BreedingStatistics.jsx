import "./BreedingStatistics.css";

export default function BreedingStatistics({
  loft,
  assignments = {},
  onBack,
}) {
  const loftAssignments = Object.entries(
    assignments,
  )
    .filter(([key]) =>
      key.startsWith(`${loft.id}-`),
    )
    .map(([, assignment]) => assignment);

  const totals = loftAssignments.reduce(
    (result, assignment) => ({
      eggs:
        result.eggs +
        Number(assignment.eggs || 0),
      youngsters:
        result.youngsters +
        Number(assignment.youngsters || 0),
      completePairs:
        result.completePairs +
        (assignment.cock && assignment.hen ? 1 : 0),
    }),
    { eggs: 0, youngsters: 0, completePairs: 0 },
  );

  const statistics = [
    ["Nest Boxes", loft.boxes],
    ["Occupied", loftAssignments.length],
    [
      "Available",
      loft.boxes - loftAssignments.length,
    ],
    ["Complete Pairs", totals.completePairs],
    ["Eggs", totals.eggs],
    ["Youngsters", totals.youngsters],
  ];

  return (
    <section className="breeding-statistics">
      <header className="panel breeding-statistics-header">
        <button
          className="secondary"
          type="button"
          onClick={onBack}
        >
          ← Back
        </button>

        <div>
          <h2>Breeding Statistics</h2>
          <p className="muted">{loft.name}</p>
        </div>
      </header>

      <div className="breeding-statistics-grid">
        {statistics.map(([label, value]) => (
          <article
            key={label}
            className="panel breeding-statistic-card"
          >
            <strong>{value}</strong>
            <span>{label}</span>
          </article>
        ))}
      </div>
    </section>
  );
}