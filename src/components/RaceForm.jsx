import { useState } from "react";
import racePointStore from "../data/RacePointStore";

const ADD_NEW_RACE_POINT = "__add_new_race_point__";

const emptyForm = {
  racePoint: "",
  miles: "",
  yards: "0",
  raceDate: "",
  status: "Upcoming",
};

export default function RaceForm({ initialRace, onSave, onCancel }) {
  const [racePoints, setRacePoints] = useState(() => racePointStore.getRacePoints());
  const initialStoredPoint = racePoints.find(
    (point) => point.name.toLowerCase() === String(initialRace?.racePoint || "").toLowerCase(),
  );
  const [addingRacePoint, setAddingRacePoint] = useState(
    () => !initialRace && racePoints.length === 0,
  );
  const [selectedRacePoint, setSelectedRacePoint] = useState(() =>
    initialStoredPoint?.id || (initialRace?.racePoint ? "__current_race_point__" : ""),
  );
  const [formData, setFormData] = useState(() =>
    initialRace
      ? {
          ...emptyForm,
          ...initialRace,
          miles: String(initialRace.miles ?? ""),
          yards: String(initialRace.yards ?? "0"),
        }
      : emptyForm,
  );
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;
    setFormData((currentData) => ({ ...currentData, [name]: value }));
    setError("");
  }

  function handleRacePointSelection(event) {
    const value = event.target.value;

    if (value === ADD_NEW_RACE_POINT) {
      setAddingRacePoint(true);
      setSelectedRacePoint(ADD_NEW_RACE_POINT);
      setFormData((currentData) => ({
        ...currentData,
        racePoint: "",
        miles: "",
        yards: "0",
      }));
      setError("");
      return;
    }

    const racePoint = racePoints.find((point) => point.id === value);
    setAddingRacePoint(false);
    setSelectedRacePoint(value);

    if (value === "__current_race_point__" && initialRace) {
      setFormData((currentData) => ({
        ...currentData,
        racePoint: initialRace.racePoint,
        miles: String(initialRace.miles ?? ""),
        yards: String(initialRace.yards ?? "0"),
      }));
    } else if (racePoint) {
      setFormData((currentData) => ({
        ...currentData,
        racePoint: racePoint.name,
        miles: String(racePoint.miles),
        yards: String(racePoint.yards),
      }));
    }

    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();

    const racePoint = formData.racePoint.trim();
    const miles = Number(formData.miles);
    const yards = Number(formData.yards);

    if (!racePoint) {
      setError("Please select or enter a race point.");
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

    racePointStore.saveRacePoint({ name: racePoint, miles, yards });
    setRacePoints(racePointStore.getRacePoints());

    onSave({
      ...initialRace,
      id:
        initialRace?.id ||
        globalThis.crypto?.randomUUID?.() ||
        `race-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      racePoint,
      miles,
      yards,
      raceDate: formData.raceDate,
      status: formData.status,
    });
  }

  return (
    <form className="content-card race-form" onSubmit={handleSubmit}>
      <div className="card-heading">
        <div>
          <p className="card-kicker">Race Programme</p>
          <h3>{initialRace ? "Edit Race" : "Add New Race"}</h3>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="form-grid">
        <div className="form-group form-group-wide">
          <label htmlFor="racePointChoice">Race Point</label>
          <select
            id="racePointChoice"
            value={selectedRacePoint}
            onChange={handleRacePointSelection}
            autoFocus
          >
            <option value="">Select race point</option>
            {initialRace?.racePoint && !initialStoredPoint && (
              <option value="__current_race_point__">{initialRace.racePoint}</option>
            )}
            {racePoints.map((point) => (
              <option key={point.id} value={point.id}>{point.name}</option>
            ))}
            <option value={ADD_NEW_RACE_POINT}>+ Add New Race Point</option>
          </select>
        </div>

        {addingRacePoint && (
          <div className="form-group form-group-wide">
            <label htmlFor="racePoint">New Race Point</label>
            <input
              id="racePoint"
              name="racePoint"
              type="text"
              value={formData.racePoint}
              onChange={handleChange}
              placeholder="Example: Stratford"
            />
          </div>
        )}

        <div className="form-group">
          <label htmlFor="miles">Miles</label>
          <input id="miles" name="miles" type="number" min="0" value={formData.miles} onChange={handleChange} placeholder="68" />
        </div>

        <div className="form-group">
          <label htmlFor="yards">Yards</label>
          <input id="yards" name="yards" type="number" min="0" max="1759" value={formData.yards} onChange={handleChange} placeholder="0" />
        </div>

        <div className="form-group">
          <label htmlFor="raceDate">Race Date</label>
          <input id="raceDate" name="raceDate" type="date" value={formData.raceDate} onChange={handleChange} />
        </div>

        <div className="form-group">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" value={formData.status} onChange={handleChange}>
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
          {initialRace ? "Save Changes" : "Save Race"}
        </button>
        <button type="button" className="neutral-button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  );
}
