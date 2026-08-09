import { useState } from "react";
import { parseProductText } from "../../data/ProductTextParser";

const FIELD_LABELS = {
  name: "Product name",
  manufacturer: "Manufacturer",
  description: "Description",
  primaryJob: "Primary job",
  feedingGuidance: "When and how to feed",
  waterInstructions: "Water guidance",
  keyBenefits: "Key benefits",
  ingredients: "Ingredients",
  nutritionalAnalysis: "Nutritional analysis",
  administration: "Used in",
  frequency: "Directions / frequency",
  dosageAmount: "Dosage amount",
  warnings: "Warnings",
  storageInstructions: "Storage",
};

export default function ProductPasteImportModal({ onUse, onClose }) {
  const [text, setText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [parsed, setParsed] = useState(null);
  const [message, setMessage] = useState("");

  function readInformation() {
    if (!text.trim()) {
      setMessage("Copy the product information from the website and paste it into the large box first.");
      return;
    }
    const result = parseProductText(text, sourceUrl);
    const found = Object.entries(FIELD_LABELS).filter(([field]) => result[field]);
    setParsed(result);
    setMessage(found.length ? `${found.length} product fields were recognised. Check them below before filling the form.` : "The text was saved, but no labelled product fields were recognised. Try copying the product description, ingredients and directions together.");
  }

  return (
    <div className="feed-modal-backdrop paste-import-backdrop">
      <section className="feed-modal paste-import-modal">
        <header className="feed-modal-header"><div><p className="feed-kicker">Copy from a website</p><h2>Paste Product Information</h2></div><button type="button" className="feed-icon-button" onClick={onClose}>×</button></header>
        <div className="paste-import-body">
          <div className="paste-import-instructions"><strong>How to use this</strong><ol><li>Open the product’s website.</li><li>Copy its description, ingredients, analysis and dosage instructions.</li><li>Paste everything below and select Read information.</li></ol></div>
          <label>Website address (recommended)<input type="url" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://manufacturer.com/product..." /></label>
          <label>Copied product information<textarea rows="12" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste the product description, ingredients, dosage and other useful information here…" /></label>
          <button type="button" className="feed-primary-button paste-read-button" onClick={readInformation}>Read product information</button>
          {message && <p className="paste-import-message">{message}</p>}
          {parsed && (
            <section className="paste-import-preview">
              <h3>Information recognised</h3>
              <div>{Object.entries(FIELD_LABELS).filter(([field]) => parsed[field]).map(([field, label]) => <article key={field}><small>{label}</small><p>{String(parsed[field])}</p></article>)}</div>
              <p className="paste-review-warning">This information has not been verified. Check it against the current product label before marking the product as verified.</p>
            </section>
          )}
        </div>
        <footer className="feed-modal-footer"><button type="button" className="feed-secondary-button" onClick={onClose}>Cancel</button>{parsed && <button type="button" className="feed-primary-button" onClick={() => onUse(parsed)}>Fill product form</button>}</footer>
      </section>
    </div>
  );
}
