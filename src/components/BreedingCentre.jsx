function BreedingCentre({
  lofts,
  assignments,
  openLoft,
}) {
  return (
    <>
      <section
        className="register-toolbar"
        style={{ marginBottom: '16px' }}
      >
        <div>
          <h3>Breeding Locations</h3>

          <p>
            Select a loft to open its nest box
            planner.
          </p>
        </div>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '16px',
        }}
      >
        {lofts.map((loft) => {
          const occupied = Object.keys(
            assignments,
          ).filter((key) =>
            key.startsWith(`${loft.id}-`),
          ).length

          return (
            <button
              key={loft.id}
              className="panel"
              onClick={() => openLoft(loft)}
              style={{
                minHeight: '130px',
                textAlign: 'left',
                borderLeft: `10px solid ${loft.colour}`,
              }}
            >
              <h3>{loft.name}</h3>

              <p className="muted">
                {occupied} occupied nest boxes
              </p>

              <strong>Open Loft →</strong>
            </button>
          )
        })}
      </section>
    </>
  )
}

export default BreedingCentre;
