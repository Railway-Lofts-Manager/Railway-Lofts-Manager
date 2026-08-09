import { useEffect, useRef, useState } from "react";
import ProductResearchModal from "./ProductResearchModal";
import ProductPasteImportModal from "./ProductPasteImportModal";

const EMPTY_PRODUCT = {
  name: "",
  manufacturer: "",
  category: "Corn / Feed Mix",
  administration: "Feed",
  barcode: "",
  description: "",
  primaryJob: "",
  feedingGuidance: "",
  waterInstructions: "",
  keyBenefits: "",
  ingredients: "",
  nutritionalAnalysis: "",
  dosageAmount: "",
  dosageUnit: "Grams",
  dosageBasis: "Per bird",
  frequency: "As directed",
  suitableFor: [],
  programmeStages: [],
  warnings: "",
  storageInstructions: "",
  sourceType: "User entered",
  sourceUrl: "",
  verified: false,
  inStock: true,
  photo: "",
  displayPhoto: "",
  labelPhoto: "",
  rearLabelPhoto: "",
  notes: "",
};

const BIRD_GROUPS = ["Racing cocks", "Racing hens", "Young birds", "Stock birds", "Breeding pairs"];
const STAGES = ["Race preparation", "Recovery", "Training", "Breeding", "Moulting", "Winter", "Rest"];

function ToggleList({ label, values, selected, onChange }) {
  return (
    <fieldset className="product-toggle-fieldset">
      <legend>{label}</legend>
      <div className="product-toggle-list">
        {values.map((value) => (
          <label key={value}>
            <input
              type="checkbox"
              checked={selected.includes(value)}
              onChange={(event) => onChange(
                event.target.checked
                  ? [...selected, value]
                  : selected.filter((item) => item !== value),
              )}
            />
            {value}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function ProductForm({ product, onSave, onClose }) {
  const [form, setForm] = useState(() => ({ ...EMPTY_PRODUCT, ...product }));
  const [error, setError] = useState("");
  const [scanMessage, setScanMessage] = useState("");
  const [researchOpen, setResearchOpen] = useState(false);
  const [pasteImportOpen, setPasteImportOpen] = useState(false);
  const barcodeInputRef = useRef(null);

  useEffect(() => {
    setForm({ ...EMPTY_PRODUCT, ...product });
  }, [product]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resizePhoto(file) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      const url = URL.createObjectURL(file);
      image.onload = () => {
        const maximum = 1200;
        const scale = Math.min(1, maximum / Math.max(image.width, image.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));
        canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      image.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Image could not be read.")); };
      image.src = url;
    });
  }

  async function loadPhoto(event, field) {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      update(field, await resizePhoto(file));
      setError("");
    } catch {
      setError("That photograph could not be read. Please choose another image.");
    }
  }

  function useResearchResult(result) {
    setForm((current) => {
      const next = { ...current };
      ["name", "manufacturer", "barcode", "description", "primaryJob", "feedingGuidance", "waterInstructions", "keyBenefits", "ingredients", "nutritionalAnalysis", "dosageAmount", "dosageUnit", "dosageBasis", "administration", "frequency", "warnings", "storageInstructions", "displayPhoto", "sourceType", "sourceUrl", "sourceUrls", "pastedSourceText"].forEach((field) => {
        if (result[field]) next[field] = result[field];
      });
      if (result.suitableFor?.length) next.suitableFor = [...new Set([...current.suitableFor, ...result.suitableFor])];
      if (result.programmeStages?.length) next.programmeStages = [...new Set([...current.programmeStages, ...result.programmeStages])];
      next.verified = false;
      next.notes = [current.notes, result.researchNote].filter(Boolean).join("\n");
      return next;
    });
    setResearchOpen(false);
  }

  async function scanBarcode(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!("BarcodeDetector" in globalThis)) {
      setScanMessage("Automatic barcode reading is not available on this device. Enter the number shown below the barcode instead.");
      return;
    }
    try {
      const bitmap = await createImageBitmap(file);
      const detector = new globalThis.BarcodeDetector({
        formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128", "qr_code"],
      });
      const results = await detector.detect(bitmap);
      bitmap.close?.();
      if (!results.length) {
        setScanMessage("No barcode was recognised. Try again in good light or enter it manually.");
        return;
      }
      update("barcode", results[0].rawValue);
      setScanMessage(`Barcode recognised: ${results[0].rawValue}`);
    } catch {
      setScanMessage("The barcode could not be read. Try again or enter it manually.");
    }
  }

  function submit(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Please enter the product name.");
      return;
    }
    onSave({ ...form, name: form.name.trim(), manufacturer: form.manufacturer.trim() });
  }

  return (
    <div className="feed-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <form className="feed-modal product-form" onSubmit={submit}>
        <header className="feed-modal-header">
          <div>
            <p className="feed-kicker">Product library</p>
            <h2>{product?.id ? "Edit product" : "Add a product"}</h2>
          </div>
          <div className="product-form-header-actions">
            <button type="button" className="feed-secondary-button" onClick={() => setPasteImportOpen(true)}>📋 Paste Product Information</button>
            <button type="button" className="feed-primary-button" onClick={() => setResearchOpen(true)}>🔎 Find Product Information</button>
            <button type="button" className="feed-icon-button" onClick={onClose} aria-label="Close">×</button>
          </div>
        </header>

        <div className="product-form-body">
          <section className="product-photo-editor">
            <div className="product-photo-preview">
              {(form.displayPhoto || form.labelPhoto || form.photo) ? <img src={form.displayPhoto || form.labelPhoto || form.photo} alt="Product" /> : <span>📦<small>Product photograph</small></span>}
            </div>
            {form.displayPhoto && <small className="product-image-label">Online display image</small>}
            <label className="feed-secondary-button product-upload-button">
              {form.labelPhoto ? "Replace front label" : "Upload front label"}
              <input type="file" accept="image/*" capture="environment" onChange={(event) => loadPhoto(event, "labelPhoto")} />
            </label>
            <label className="feed-secondary-button product-upload-button">
              {form.rearLabelPhoto ? "Replace rear label" : "Upload rear label"}
              <input type="file" accept="image/*" capture="environment" onChange={(event) => loadPhoto(event, "rearLabelPhoto")} />
            </label>
            {form.displayPhoto && <button type="button" className="feed-text-button" onClick={() => update("displayPhoto", "")}>Use my photograph instead</button>}
            {(form.labelPhoto || form.rearLabelPhoto) && <small className="product-help">Your original label photographs remain stored with this product.</small>}
          </section>

          <div className="product-form-grid">
            <label>Product name *<input value={form.name} onChange={(e) => update("name", e.target.value)} /></label>
            <label>Manufacturer<input value={form.manufacturer} onChange={(e) => update("manufacturer", e.target.value)} /></label>
            <label>Product category
              <select value={form.category} onChange={(e) => update("category", e.target.value)}>
                {["Corn / Feed Mix", "Straight Grain", "Supplement", "Drink Additive", "Mineral / Grit", "Medication / Treatment", "Other"].map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label>Used in
              <select value={form.administration} onChange={(e) => update("administration", e.target.value)}>
                {["Feed", "Water", "Separate", "Feed or water", "Other"].map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label className="full">Barcode
              <div className="product-barcode-row">
                <input value={form.barcode} onChange={(e) => update("barcode", e.target.value)} placeholder="Type the number or scan the barcode" />
                <button type="button" className="feed-secondary-button" onClick={() => barcodeInputRef.current?.click()}>Scan barcode</button>
                <input ref={barcodeInputRef} className="visually-hidden" type="file" accept="image/*" capture="environment" onChange={scanBarcode} />
              </div>
              {scanMessage && <small className="product-help">{scanMessage}</small>}
            </label>
            <label className="full">What does this product do?<textarea rows="3" value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="A clear description of the product and its intended use" /></label>
            <label>Primary job<input value={form.primaryJob} onChange={(e) => update("primaryJob", e.target.value)} placeholder="e.g. recovery, energy or weight control" /></label>
            <label>Recommended frequency<input value={form.frequency} onChange={(e) => update("frequency", e.target.value)} /></label>
            <label className="full">When and how to feed<textarea rows="3" value={form.feedingGuidance} onChange={(e) => update("feedingGuidance", e.target.value)} /></label>
            <label className="full">Water guidance<textarea rows="2" value={form.waterInstructions} onChange={(e) => update("waterInstructions", e.target.value)} /></label>
            <label className="full">Key benefits and functional ingredients<textarea rows="3" value={form.keyBenefits} onChange={(e) => update("keyBenefits", e.target.value)} /></label>
            <label className="full">Ingredients<textarea rows="3" value={form.ingredients} onChange={(e) => update("ingredients", e.target.value)} placeholder="Copy from the product label" /></label>
            <label className="full">Nutritional analysis<textarea rows="3" value={form.nutritionalAnalysis} onChange={(e) => update("nutritionalAnalysis", e.target.value)} /></label>
            <label>Dosage / feed amount<input value={form.dosageAmount} onChange={(e) => update("dosageAmount", e.target.value)} placeholder="e.g. 20 or 5–10" /></label>
            <label>Unit
              <select value={form.dosageUnit} onChange={(e) => update("dosageUnit", e.target.value)}>
                {["Grams", "Kilograms", "Millilitres", "Litres", "Teaspoon", "Tablespoon", "Fluid ounces", "Egg cup", "Scoops", "Other"].map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label>Calculation basis
              <select value={form.dosageBasis} onChange={(e) => update("dosageBasis", e.target.value)}>
                {["Per bird", "Per pair", "Per pot", "Per serving", "Per kilogram of feed", "Per litre of water", "Per loft", "Manufacturer instructions"].map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label>Information source
              <select value={form.sourceType} onChange={(e) => update("sourceType", e.target.value)}>
                {["User entered", "Product label", "Manufacturer website", "Retailer website", "Pasted product information", "Open Pet Food Facts", "Open Food Facts", "Open Products Facts", "Other online source"].map((value) => <option key={value}>{value}</option>)}
              </select>
            </label>
            <label className="full">Source web address<input type="url" value={form.sourceUrl} onChange={(e) => update("sourceUrl", e.target.value)} placeholder="https://..." /></label>
            <ToggleList label="Suitable birds" values={BIRD_GROUPS} selected={form.suitableFor} onChange={(value) => update("suitableFor", value)} />
            <ToggleList label="Suitable programme stages" values={STAGES} selected={form.programmeStages} onChange={(value) => update("programmeStages", value)} />
            <label className="full">Warnings / products not to combine<textarea rows="3" value={form.warnings} onChange={(e) => update("warnings", e.target.value)} /></label>
            <label className="full">Storage and expiry instructions<textarea rows="2" value={form.storageInstructions} onChange={(e) => update("storageInstructions", e.target.value)} /></label>
            <label className="full">Notes<textarea rows="2" value={form.notes} onChange={(e) => update("notes", e.target.value)} /></label>
            <label className="product-check"><input type="checkbox" checked={form.inStock} onChange={(e) => update("inStock", e.target.checked)} />Currently in stock</label>
            <label className="product-check"><input type="checkbox" checked={form.verified} onChange={(e) => update("verified", e.target.checked)} />I have checked these instructions against the label or manufacturer</label>
          </div>
        </div>

        {error && <p className="product-form-error">{error}</p>}
        <footer className="feed-modal-footer">
          <button type="button" className="feed-secondary-button" onClick={onClose}>Cancel</button>
          <button type="submit" className="feed-primary-button">Save product</button>
        </footer>
      </form>
      {researchOpen && <ProductResearchModal product={form} onUse={useResearchResult} onClose={() => setResearchOpen(false)} />}
      {pasteImportOpen && <ProductPasteImportModal onUse={(result) => { useResearchResult(result); setPasteImportOpen(false); }} onClose={() => setPasteImportOpen(false)} />}
    </div>
  );
}
