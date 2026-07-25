function LoftView({
  lofts,
  selectedLoft,
  setSelectedLoft,
  assignments,
  setSelectedBox,
}) {
  const occupiedBoxes = Object.keys(
    assignments,
  ).filter((key) =>
    key.startsWith(`${selectedLoft.id}-`),
  ).length

  return (
    <>
      <section
        className="panel"
        style={{ marginBottom: '16px' }}
      >
        <h3>Select Loft</h3>

        <div
          style={{
            display: 'flex',
            gap: '10px',
            flexWrap: 'wrap',
            marginTop: '15px',
          }}
        >
          {lofts.map((loft) => (
            <button
              key={loft.id}
              className={
                selectedLoft.id === loft.id
                  ? 'primary'
                  : 'secondary'
              }
              onClick={() =>
                setSelectedLoft(loft)
              }
              style={{
                borderLeft: `8px solid ${loft.colour}`,
              }}
            >
              {loft.name}
            </button>
          ))}
        </div>
      </section>

      <section
        className="panel"
        style={{ marginBottom: '16px' }}
      >
        <h3>{selectedLoft.name}</h3>

        <p className="muted">
          {occupiedBoxes} occupied boxes ·{' '}
          {selectedLoft.boxes - occupiedBoxes}{' '}
          empty boxes
        </p>
      </section>

      <section
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '14px',
        }}
      >
        {Array.from(
          { length: selectedLoft.boxes },
          (_, index) => {
            const boxNumber = index + 1

            const assignment =
              assignments[
                `${selectedLoft.id}-${boxNumber}`
              ]

            return (
              <button
                key={boxNumber}
                className="panel"
                onClick={() =>
                  setSelectedBox(boxNumber)
                }
                style={{
                  minHeight: '160px',
                  textAlign: 'left',
                  borderLeft: `8px solid ${selectedLoft.colour}`,
                }}
              >
                <h3>Box {boxNumber}</h3>

                {assignment ? (
                  <>
                    <p>
                      <strong>Cock:</strong>{' '}
                      {assignment.cock ||
                        'Not selected'}
                    </p>

                    <p>
                      <strong>Hen:</strong>{' '}
                      {assignment.hen ||
                        'Not selected'}
                    </p>

                    <p>
                      Eggs: {assignment.eggs}
                      <br />
                      Youngsters:{' '}
                      {assignment.youngsters}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="muted">
                      Empty nest box
                    </p>

                    <strong>+ Assign Pair</strong>
                  </>
                )}
              </button>
            )
          },
        )}
      </section>
    </>
  )
}

export default LoftView;