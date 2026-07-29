import { useState } from "react";

const emptyForm = {
  racePoint: "",
  miles: "",
  yards: "",
  raceDate: "",
  status: "Upcoming",
};

export default function RaceForm({ onSave, onCancel }) {
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setFormData((currentData) => ({
      ...currentData,
      [name]: value,
    }));

    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const racePoint = formData.racePoint.trim();
    const miles = Number(formData.miles);
    const yards = Number(formData.yards);

    if (!racePoint) {
      setError("Please enter a race point.");
      return;
    }

    if (formData.miles === "" || miles < 0) {
      setError("Please enter a valid distance in miles.");
      return;
    }

    if (formData.yards === "" || yards < 0 || yards > 1759) {
      setError("Yards must be between 0 and 1,759.");
      return;
    }

    const newRace = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : Date.now(),
      racePoint,
      miles,
      yards,
      raceDate: formData.raceDate,
      status: formData.status,
    };

    onSave(newRace);
  }

  return (
    <form className="content-card race-form" onSubmit={handleSubmit}>
      <div className="card-heading">
        <div>
          <p className="card-kicker">Race Programme</p>
          <h3>Add New Race</h3>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <div className="form-group form-group-wide">
          <label htmlFor="racePoint">Race Point</label>
          <input
            id="racePoint"
            name="racePoint"
            type="text"
            value={formData.racePoint}
            onChange={handleChange}
            placeholder="Example: Stratford"
            autoFocus
          />
        </div>

        <div className="form-group">
          <label htmlFor="miles">Miles</label>
          <input
            id="miles"
            name="miles"
            type="number"
            min="0"
            value={formData.miles}
            onChange={handleChange}
            placeholder="68"
          />
        </div>

        <div className="form-group">
          <label htmlFor="yards">Yards</label>
          <input
            id="yards"
            name="yards"
            type="number"
            min="0"
            max="1759"
            value={formData.yards}
            onChange={handleChange}
            placeholder="0"
          />
        </div>

        <div className="form-group">
          <label htmlFor="raceDate">Race Date</label>
          <input
            id="raceDate"
            name="raceDate"
            type="date"
            value={formData.raceDate}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
          >
            <option value="Upcoming">Upcoming</option>
            <option value="Marked">Marked</option>
            <option value="Liberated">Liberated</option>
            <option value="Completed">Completed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="primary-button">
          Save Race
        </button>

        <button
          type="button"
          className="neutral-button"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}