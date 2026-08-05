import { useState } from "react";
import settingsStore from
  "../../data/SettingsStore";
import "./CustomerDetailsForm.css";

export default function CustomerDetailsForm() {
  const [form, setForm] = useState(
    settingsStore.getSettings(),
  );
  const [saved, setSaved] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setSaved(false);
  }

  function handleSubmit(event) {
    event.preventDefault();

    settingsStore.updateSettings({
      ownerName: form.ownerName.trim(),
      loftName: form.loftName.trim(),
      loftNumber: form.loftNumber.trim(),
      location: form.location.trim(),
      season: Number(form.season),
    });

    setSaved(true);
  }

  return (
    <form
      className="panel customer-details-form"
      onSubmit={handleSubmit}
    >
      <div>
        <h3>Customer Details</h3>
        <p className="muted">
          These details personalise Loft Commander
          for this customer.
        </p>
      </div>

      <div className="customer-details-grid">
        <label>
          Owner Name
          <input
            name="ownerName"
            value={form.ownerName}
            onChange={updateField}
            required
          />
        </label>

        <label>
          Loft Name
          <input
            name="loftName"
            value={form.loftName}
            onChange={updateField}
            required
          />
        </label>

        <label>
          Loft Number
          <input
            name="loftNumber"
            value={form.loftNumber}
            onChange={updateField}
          />
        </label>

        <label>
          Location
          <input
            name="location"
            value={form.location}
            onChange={updateField}
          />
        </label>

        <label>
          Current Season
          <input
            name="season"
            type="number"
            min="2020"
            value={form.season}
            onChange={updateField}
            required
          />
        </label>
      </div>

      <button className="primary" type="submit">
        {saved
          ? "✓ Details Saved"
          : "Save Customer Details"}
      </button>
    </form>
  );
}