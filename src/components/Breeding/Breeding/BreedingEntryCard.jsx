import YoungBirdMoveFields from "./YoungBirdMoveFields";
import AvailableRingSelect from "../Rings/AvailableRingSelect";
import "./BreedingEntryCard.css";

function expectedHatchDate(laidDate) {
  if (!laidDate) {
    return "";
  }

  const date = new Date(`${laidDate}T00:00:00`);
  date.setDate(date.getDate() + 18);

  return date.toISOString().slice(0, 10);
}

export default function BreedingEntryCard({
  entry,
  entryNumber,
  onChange,
}) {
  function updateField(event) {
    const { name, value } = event.target;
    const updates = { [name]: value };

    if (name === "laidDate") {
      updates.expectedHatchDate =
        expectedHatchDate(value);
    }

    onChange?.(entry.id, updates);
  }

  return (
    <article className="breeding-entry-card">
      <h4>Entry {entryNumber}</h4>

      <div className="breeding-entry-grid">
        <label>
          Date Laid
          <input
            name="laidDate"
            type="date"
            value={entry.laidDate}
            onChange={updateField}
          />
        </label>

        <label>
          Expected Hatch
          <input
            name="expectedHatchDate"
            type="date"
            value={entry.expectedHatchDate}
            readOnly
          />
        </label>

        <label>
          Actual Hatch
          <input
            name="hatchDate"
            type="date"
            value={entry.hatchDate}
            onChange={updateField}
          />
        </label>

        <label>
          Date Rung
          <input
            name="ringedDate"
            type="date"
            value={entry.ringedDate}
            onChange={updateField}
          />
        </label>

        <AvailableRingSelect
          entry={entry}
          onChange={onChange}
        />

        <label>
          Colour
          <input
            name="colour"
            value={entry.colour}
            onChange={updateField}
          />
        </label>

        <label>
          Sex
          <select
            name="sex"
            value={entry.sex}
            onChange={updateField}
          >
            <option>Unknown</option>
            <option>Cock</option>
            <option>Hen</option>
          </select>
        </label>

        <label>
          Outcome
          <select
            name="outcome"
            value={entry.outcome}
            onChange={updateField}
          >
            <option value="">Select outcome</option>
            <option>Hatched</option>
            <option>Not Hatched</option>
            <option>Infertile</option>
            <option>Smashed</option>
            <option>Died</option>
            <option>Killed</option>
            <option>Healthy</option>
            <option>Fostered In</option>
            <option>Fostered Out</option>
          </select>
        </label>

        <YoungBirdMoveFields
          entry={entry}
          onChange={onChange}
        />

        <label className="breeding-entry-comments">
          Comments
          <textarea
            name="comments"
            value={entry.comments}
            onChange={updateField}
            rows="2"
          />
        </label>
      </div>
    </article>
  );
}
