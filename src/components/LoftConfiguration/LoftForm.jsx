import { useState } from "react";
import loftTypes from "../../data/LoftTypes";
import loftColours from "../../data/LoftColours";
import "./LoftForm.css";

const emptyLoft = {
  name: "",
  code: "",
  type: "breeding",
  boxes: 0,
  colour: "#d2a11e",
  status: "in-use",
};

export default function LoftForm({
  loft,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState({
    ...emptyLoft,
    ...loft,
  });

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => {
      if (name === "type") {
        const selectedType = loftTypes.find(
          (type) => type.value === value,
        );

        return {
          ...current,
          type: value,
          colour:
            selectedType?.defaultColour ||
            current.colour,
        };
      }

      return {
        ...current,
        [name]:
          name === "boxes"
            ? Number(value)
            : value,
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();

    onSave?.({
      ...form,
      name: form.name.trim(),
      code: form.code.trim().toUpperCase(),
    });
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onCancel?.();
        }
      }}
    >
      <form
        className="modal loft-form"
        onSubmit={handleSubmit}
      >
        <header>
          <h3>{loft ? "Edit Loft" : "Add Loft"}</h3>

          <button
            className="close"
            type="button"
            onClick={onCancel}
          >
            ×
          </button>
        </header>

        <div className="loft-form-row">
          <label>
            Loft Name
            <input
              name="name"
              value={form.name}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Short Code
            <input
              name="code"
              value={form.code}
              onChange={updateField}
              required
            />
          </label>
        </div>

        <div className="loft-form-row">
          <label>
            Loft Type
            <select
              name="type"
              value={form.type}
              onChange={updateField}
            >
              {loftTypes.map((type) => (
                <option
                  key={type.value}
                  value={type.value}
                >
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nest Boxes
            <input
              name="boxes"
              type="number"
              min="0"
              value={form.boxes}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Card Colour
            <select
              name="colour"
              value={form.colour}
              onChange={updateField}
            >
              {loftColours.map((colour) => (
                <option
                  key={colour.value}
                  value={colour.value}
                >
                  {colour.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Status
            <select
              name="status"
              value={form.status}
              onChange={updateField}
            >
              <option value="in-use">In Use</option>
              <option value="not-in-use">
                Not In Use
              </option>
            </select>
          </label>
        </div>

        <footer className="loft-form-actions">
          <button
            className="secondary"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>

          <button className="primary" type="submit">
            Save Loft
          </button>
        </footer>
      </form>
    </div>
  );
}