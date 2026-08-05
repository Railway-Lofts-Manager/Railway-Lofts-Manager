import { useState } from "react";
import "./LoftForm.css";

const emptyLoft = {
  name: "",
  code: "",
  boxes: 1,
  colour: "#2f8f5b",
  status: "in-use",
};

export default function LoftForm({
  loft,
  onSave,
  onCancel,
}) {
  const [form, setForm] = useState(
    loft || emptyLoft,
  );

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]:
        name === "boxes" ? Number(value) : value,
    }));
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
    <form
      className="panel loft-form"
      onSubmit={handleSubmit}
    >
      <h3>
        {loft ? "Edit Loft" : "Add Loft"}
      </h3>

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
          Nest Boxes
          <input
            name="boxes"
            type="number"
            min="1"
            value={form.boxes}
            onChange={updateField}
            required
          />
        </label>

        <label>
          Card Colour
          <input
            name="colour"
            type="color"
            value={form.colour}
            onChange={updateField}
          />
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

      <div className="loft-form-actions">
        <button className="primary" type="submit">
          Save Loft
        </button>

        <button
          className="secondary"
          type="button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}