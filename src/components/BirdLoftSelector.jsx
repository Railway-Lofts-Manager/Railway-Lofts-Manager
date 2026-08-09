import "./BirdLoftSelector.css";

export default function BirdLoftSelector({
  form,
  setForm,
  lofts = [],
}) {
  const selectedLoftId =
    form.loftId ||
    lofts.find((loft) => loft.name === form.loft)
      ?.id ||
    "";

  function selectLoft(event) {
    const loftId = event.target.value;
    const loft = lofts.find(
      (item) => item.id === loftId,
    );

    setForm((current) => ({
      ...current,
      loftId,
      loft: loft?.name || "",
      section: loft?.name || "",
      status:
        current.status === "Hospital" && loft?.type === "race"
          ? "Racing"
          : current.status === "Hospital" && loft?.type === "young-bird"
            ? "Young Bird"
            : current.status === "Hospital" && loft?.type === "breeding"
              ? "Stock"
              : current.status,
    }));
  }

  return (
    <label className="bird-loft-selector">
      Current loft

      <select
        name="loftId"
        value={selectedLoftId}
        onChange={selectLoft}
      >
        <option value="">Select a loft</option>

        {lofts.map((loft) => (
          <option key={loft.id} value={loft.id}>
            {loft.name}
          </option>
        ))}
      </select>
    </label>
  );
}
