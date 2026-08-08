import { useMemo, useState } from "react";
import birdStore from "../../data/BirdStore";
import { saveDocument } from "../../data/DocumentStore";
import "./HistoricalArchiveWizard.css";

const documentTypes = [
  ["pedigree", "Pedigree"],
  ["photo", "Photograph"],
  ["certificate", "Certificate"],
  ["race", "Race Sheet"],
  ["handwritten", "Handwritten Record"],
  ["other", "Other Document"],
];

function compact(value) {
  return String(value || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function guessBird(fileName, birds) {
  const fileKey = compact(fileName.replace(/\.[^/.]+$/, ""));
  return birds.find((bird) => fileKey.includes(compact(bird.ringNumber))) || null;
}

function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export default function HistoricalArchiveWizard({ onBack }) {
  const birds = useMemo(() => birdStore.getBirds(), []);
  const [items, setItems] = useState([]);
  const [message, setMessage] = useState("");
  const [importing, setImporting] = useState(false);

  function chooseFiles(event) {
    const files = Array.from(event.target.files || []);
    setItems(
      files.map((file) => {
        const matchedBird = guessBird(file.name, birds);
        return {
          id: globalThis.crypto?.randomUUID?.() || `archive-${Date.now()}-${file.name}`,
          file,
          title: file.name.replace(/\.[^/.]+$/, ""),
          type: "other",
          ringNumber: matchedBird?.ringNumber || "",
        };
      }),
    );
    setMessage(files.length ? `${files.length} files ready for review.` : "");
    event.target.value = "";
  }

  function updateItem(id, updates) {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, ...updates } : item)),
    );
  }

  async function importFiles() {
    const unlinked = items.filter((item) => !item.ringNumber);
    if (unlinked.length) {
      setMessage(`Select a bird for all ${unlinked.length} unlinked files.`);
      return;
    }

    setImporting(true);
    try {
      for (const item of items) {
        const document = {
          id: item.id,
          type: item.type,
          title: item.title,
          name: item.file.name,
          uploaded: new Date().toLocaleDateString("en-GB"),
          size: item.file.size,
          data: await readFile(item.file),
        };
        await saveDocument(document);
        const bird = birdStore.getBird(item.ringNumber);
        const metadata = { ...document };
        delete metadata.data;
        birdStore.updateBird(item.ringNumber, {
          documents: [...(bird?.documents || []), metadata],
        });
      }
      setMessage(`${items.length} historical files imported successfully.`);
      setItems([]);
    } catch (error) {
      console.error(error);
      setMessage("The historical files could not all be imported.");
    } finally {
      setImporting(false);
    }
  }

  return (
    <section className="historical-import-wizard">
      <button type="button" className="secondary" onClick={onBack}>← Import methods</button>
      <div>
        <p className="historical-label">HISTORICAL ARCHIVE</p>
        <h2>Bulk Document Import</h2>
        <p>Select PDFs and images, then verify the bird and document type before import.</p>
      </div>
      <label className="historical-file-picker">
        Choose Historical Files
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" multiple onChange={chooseFiles} />
      </label>
      {message && <p className="historical-message">{message}</p>}
      {items.length > 0 && (
        <>
          <div className="historical-file-list">
            {items.map((item) => (
              <article key={item.id}>
                <strong>{item.file.name}</strong>
                <label>Link to bird
                  <select value={item.ringNumber} onChange={(event) => updateItem(item.id, { ringNumber: event.target.value })}>
                    <option value="">Select bird</option>
                    {birds.map((bird) => <option key={bird.birdId} value={bird.ringNumber}>{bird.ringNumber}{bird.name ? ` • ${bird.name}` : ""}</option>)}
                  </select>
                </label>
                <label>Document type
                  <select value={item.type} onChange={(event) => updateItem(item.id, { type: event.target.value })}>
                    {documentTypes.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </label>
                <label>Title
                  <input value={item.title} onChange={(event) => updateItem(item.id, { title: event.target.value })} />
                </label>
              </article>
            ))}
          </div>
          <button type="button" className="historical-import-button" disabled={importing} onClick={importFiles}>
            {importing ? "Importing..." : `Import ${items.length} Historical Files`}
          </button>
        </>
      )}
    </section>
  );
}
