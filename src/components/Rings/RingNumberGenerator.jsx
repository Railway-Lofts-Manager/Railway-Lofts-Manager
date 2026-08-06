import { useMemo, useState } from "react";
import ringStore from "../../data/RingStore";
import "./RingNumberGenerator.css";

function createRingBatch(firstRing, quantity) {
  const cleanedRing = firstRing.trim().toUpperCase();
  const match = cleanedRing.match(/^(.*?)(\d+)$/);

  if (!match) {
    throw new Error(
      "The first ring number must finish with a number.",
    );
  }

  const [, prefix, numberText] = match;
  const firstNumber = BigInt(numberText);

  return Array.from({ length: quantity }, (_, index) => {
    const nextNumber = String(firstNumber + BigInt(index));
    return `${prefix}${nextNumber.padStart(numberText.length, "0")}`;
  });
}

export default function RingNumberGenerator() {
  const [firstRing, setFirstRing] = useState("");
  const [quantity, setQuantity] = useState("");
  const [rings, setRings] = useState([]);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");

  const preview = useMemo(() => {
    if (rings.length <= 8) return rings;
    return [...rings.slice(0, 4), "…", ...rings.slice(-4)];
  }, [rings]);

  function handleSubmit(event) {
    event.preventDefault();
    const ringQuantity = Number(quantity);

    if (!Number.isInteger(ringQuantity) || ringQuantity < 1) {
      setError("Enter how many rings were purchased.");
      setRings([]);
      return;
    }

    if (ringQuantity > 5000) {
      setError("A ring batch can contain up to 5,000 rings.");
      setRings([]);
      return;
    }

    try {
      const generatedRings = createRingBatch(firstRing, ringQuantity);
      setRings(generatedRings);
      setError("");
      setSaved(false);
      setSaveMessage("");
      setSaveError("");
    } catch (generationError) {
      setError(generationError.message);
      setRings([]);
    }
  }

  function handleSave() {
    try {
      const savedCount = ringStore.addBatch(rings);
      setSaved(true);
      setSaveMessage(
        `${savedCount} rings saved to the Ring Register.`,
      );
      setSaveError("");
    } catch (saveFailure) {
      setSaved(false);
      setSaveMessage("");
      setSaveError(saveFailure.message);
    }
  }

  return (
    <section className="panel ring-number-generator">
      <header className="ring-generator-header">
        <p className="ring-generator-label">RING MANAGEMENT</p>
        <h2>Ring Number Generator</h2>
        <p className="muted">
          Enter the first ring number and the quantity purchased.
        </p>
      </header>

      <form className="ring-generator-form" onSubmit={handleSubmit}>
        <label>
          First Ring Number
          <input
            value={firstRing}
            onChange={(event) => {
              setFirstRing(event.target.value);
              setRings([]);
              setSaved(false);
              setSaveMessage("");
              setSaveError("");
            }}
            placeholder="Example: GB26R00100"
            autoComplete="off"
            required
          />
        </label>

        <label>
          Quantity Purchased
          <input
            type="number"
            min="1"
            max="5000"
            value={quantity}
            onChange={(event) => {
              setQuantity(event.target.value);
              setRings([]);
              setSaved(false);
              setSaveMessage("");
              setSaveError("");
            }}
            placeholder="Example: 100"
            required
          />
        </label>

        <button className="primary" type="submit">
          Generate Ring Batch
        </button>
      </form>

      {error && <p className="ring-generator-error">{error}</p>}

      {rings.length > 0 && (
        <div className="ring-generator-preview">
          <h3>{rings.length} rings generated</h3>
          <p>
            {rings[0]} to {rings[rings.length - 1]}
          </p>
          <div className="ring-preview-list">
            {preview.map((ring, index) => (
              <span key={`${ring}-${index}`}>{ring}</span>
            ))}
          </div>

          <div className="ring-preview-actions">
            <button
              className="ring-save-button"
              type="button"
              onClick={handleSave}
              disabled={saved}
            >
              {saved ? "Saved to Ring Register" : "Save Ring Batch"}
            </button>

            {saved && (
              <span className="ring-saved-confirmation">
                ✓ These rings are now stored in Loft Commander
              </span>
            )}
          </div>

          {saveMessage && (
            <p className="ring-inline-message">{saveMessage}</p>
          )}

          {saveError && (
            <p className="ring-inline-error">{saveError}</p>
          )}
        </div>
      )}
    </section>
  );
}
