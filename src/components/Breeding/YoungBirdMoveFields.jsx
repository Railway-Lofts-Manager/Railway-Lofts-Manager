import useLofts from "../../hooks/useLofts";
import "./YoungBirdMoveFields.css";

export default function YoungBirdMoveFields({
  entry,
  onChange,
}) {
  const lofts = useLofts();

  const youngBirdLofts = lofts.filter(
    (loft) =>
      loft.type === "young-bird" &&
      loft.status === "in-use",
  );

  function updateField(event) {
    const { name, value } = event.target;

    onChange(entry.id, {
      [name]: value,
    });
  }

  return (
    <section className="young-bird-move-fields">
      <h5>Move to Young Bird Loft</h5>

      <label>
        Date Moved
        <input
          type="date"
          name="movedToYoungBirdLoftDate"
          value={entry.movedToYoungBirdLoftDate || ""}
          onChange={updateField}
        />
      </label>

      <label>
        Young Bird Loft
        <select
          name="destinationLoftId"
          value={entry.destinationLoftId || ""}
          onChange={updateField}
        >
          <option value="">Select loft</option>

          {youngBirdLofts.map((loft) => (
            <option key={loft.id} value={loft.id}>
              {loft.name}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}