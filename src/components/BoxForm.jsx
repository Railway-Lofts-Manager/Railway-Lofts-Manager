import BoxBreedingHistory from
  "./Breeding/BoxBreedingHistory";

function BoxForm({
  loft,
  boxNumber,
  birds,
  assignment,
  onSave,
  onClear,
  onClose,
}) {
  const cocks = birds.filter(
    (bird) => bird.sex === "Cock",
  );

  const hens = birds.filter(
    (bird) => bird.sex === "Hen",
  );

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) =>
        event.target === event.currentTarget &&
        onClose()
      }
    >
      <form className="modal" onSubmit={onSave}>
        <header>
          <div>
            <p className="eyebrow">
              {loft.name}
            </p>

            <h3>Nest Box {boxNumber}</h3>
          </div>

          <button
            type="button"
            className="close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        <div className="form-grid">
          <label className="full">
            Cock
            <select
              name="cock"
              defaultValue={assignment?.cock || ""}
            >
              <option value="">Select cock</option>

              {cocks.map((bird) => (
                <option
                  key={bird.id}
                  value={bird.ringNumber}
                >
                  {`${bird.ringNumber} • ${bird.colour} ${bird.sex} • ${bird.family}`}
                </option>
              ))}
            </select>
          </label>

          <label className="full">
            Hen
            <select
              name="hen"
              defaultValue={assignment?.hen || ""}
            >
              <option value="">Select hen</option>

              {hens.map((bird) => (
                <option
                  key={bird.id}
                  value={bird.ringNumber}
                >
                  {`${bird.ringNumber} • ${bird.colour} ${bird.sex} • ${bird.family}`}
                </option>
              ))}
            </select>
          </label>

          <label>
            Eggs
            <input
              name="eggs"
              type="number"
              min="0"
              defaultValue={assignment?.eggs || 0}
            />
          </label>

          <label>
            Youngsters
            <input
              name="youngsters"
              type="number"
              min="0"
              defaultValue={
                assignment?.youngsters || 0
              }
            />
          </label>
        </div>

        <BoxBreedingHistory
          loftId={loft.id}
          boxNumber={boxNumber}
        />

        <footer>
          {assignment && (
            <button
              type="button"
              className="danger"
              onClick={onClear}
            >
              Clear Box
            </button>
          )}

          <button
            type="button"
            className="secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="primary"
            type="submit"
          >
            Save Box
          </button>
        </footer>
      </form>
    </div>
  );
}

export default BoxForm;