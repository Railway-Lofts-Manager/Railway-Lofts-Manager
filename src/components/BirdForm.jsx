import BirdLoftSelector from "./BirdLoftSelector";

function BirdForm({
  form,
  setForm,
  editing,
  error,
  onSave,
  onClose,
  lofts,
}) {
  const update = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));

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
              Bird Register
            </p>

            <h3>
              {editing
                ? "Edit bird"
                : "Add a new bird"}
            </h3>
          </div>

          <button
            type="button"
            className="close"
            onClick={onClose}
          >
            ×
          </button>
        </header>

        {error && (
          <p className="form-error">{error}</p>
        )}

        <div className="form-grid">
          <label className="full">
            Ring number *
            <input
              name="ringNumber"
              value={form.ringNumber}
              onChange={update}
              placeholder="Example: GB26R12345"
              autoFocus
            />
          </label>

          <label>
            Earned name
            <input
              name="name"
              value={form.name}
              onChange={update}
              placeholder="Optional"
            />
          </label>

          <label>
            Year
            <input
              name="year"
              value={form.year}
              onChange={update}
              inputMode="numeric"
            />
          </label>

          <label>
            Sex
            <select
              name="sex"
              value={form.sex}
              onChange={update}
            >
              <option>Cock</option>
              <option>Hen</option>
              <option>Unknown</option>
            </select>
          </label>

          <label>
            Colour
            <input
              name="colour"
              value={form.colour}
              onChange={update}
              placeholder="Blue, Chequer..."
            />
          </label>

          <label>
            Status
            <select
              name="status"
              value={form.status}
              onChange={update}
            >
              <option>Racing</option>
              <option>Stock</option>
              <option>Young Bird</option>
              <option>Retired</option>
            </select>
          </label>

          <BirdLoftSelector
            form={form}
            setForm={setForm}
            lofts={lofts}
          />

          <label className="full">
            Family / bloodline
            <input
              name="family"
              value={form.family}
              onChange={update}
            />
          </label>

          <label className="full">
            Notes
            <textarea
              name="notes"
              value={form.notes}
              onChange={update}
              rows="3"
            />
          </label>
        </div>

        <footer>
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
            {editing
              ? "Save Changes"
              : "Add Bird"}
          </button>
        </footer>
      </form>
    </div>
  );
}

export default BirdForm;