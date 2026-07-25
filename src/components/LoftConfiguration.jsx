import lofts from '../data/lofts'

function LoftConfiguration() {
  return (
    <>
      <section className="panel" style={{ marginBottom: '16px' }}>
        <h2>Loft Configuration</h2>

        <p className="muted">
          Configure all lofts used within Loft Commander.
        </p>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '16px',
        }}
      >
        {lofts.map((loft) => (
          <div
            key={loft.id}
            className="panel"
            style={{
              borderLeft: `8px solid ${loft.colour}`,
            }}
          >
            <h3>{loft.name}</h3>

            <p>
  <strong>Status:</strong>{' '}
  <span
    style={{
      color:
        loft.status === 'in-use'
          ? 'green'
          : 'red',
      fontWeight: 'bold',
    }}
  >
    {loft.status === 'in-use'
      ? 'In Use'
      : 'Not In Use'}
  </span>
</p>

            <p>
              <strong>Nest Boxes:</strong>{' '}
              {loft.boxes}
            </p>

            <button className="primary">
              Edit Loft
            </button>
          </div>
        ))}
      </section>

      <section
        className="panel"
        style={{ marginTop: '16px' }}
      >
        <button className="primary">
          + Add Loft
        </button>
      </section>
    </>
  )
}

export default LoftConfiguration