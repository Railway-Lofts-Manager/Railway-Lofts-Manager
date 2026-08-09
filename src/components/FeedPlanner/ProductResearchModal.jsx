import { useEffect, useState } from "react";
import { productResearchSearchUrl, researchProduct } from "../../data/ProductResearchService";

function Candidate({ candidate, onUse }) {
  return (
    <article className="research-result-card">
      <div className="research-result-image">{candidate.displayPhoto ? <img src={candidate.displayPhoto} alt="" /> : <span>📦</span>}</div>
      <div className="research-result-body">
        <p className="feed-kicker">{candidate.sourceType}</p>
        <h3>{candidate.name}</h3>
        <p>{candidate.manufacturer || "Manufacturer not recorded"}</p>
        {candidate.description && <small>{candidate.description}</small>}
        <div className="research-result-information">
          {candidate.ingredients && <span>Ingredients found</span>}
          {candidate.nutritionalAnalysis && <span>Analysis found</span>}
          {candidate.barcode && <span>Barcode {candidate.barcode}</span>}
        </div>
      </div>
      <div className="research-result-actions">
        <button type="button" className="feed-primary-button" onClick={() => onUse(candidate)}>Review and use</button>
        {candidate.sourceUrl && <a className="feed-text-link" href={candidate.sourceUrl} target="_blank" rel="noreferrer">Open source ↗</a>}
      </div>
    </article>
  );
}

export default function ProductResearchModal({ product, onUse, onClose }) {
  const [search, setSearch] = useState({ name: product.name || "", manufacturer: product.manufacturer || "", barcode: product.barcode || "" });
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  async function runSearch() {
    if (!search.name.trim() && !search.barcode.trim()) {
      setMessage("Enter a product name or barcode first.");
      return;
    }
    setStatus("loading");
    setMessage("");
    try {
      const found = await researchProduct(search);
      setResults(found);
      setStatus("complete");
      if (!found.length) setMessage("No matching structured product record was found. Try adding the manufacturer, checking the barcode, or use the wider internet search below.");
    } catch {
      setStatus("complete");
      setMessage("The online product sources could not be reached. Check the internet connection and try again.");
    }
  }

  useEffect(() => { runSearch(); }, []); // Search immediately using the information already entered.

  return (
    <div className="feed-modal-backdrop research-backdrop">
      <section className="feed-modal research-modal">
        <header className="feed-modal-header"><div><p className="feed-kicker">Automatic product research</p><h2>Find Product Information</h2></div><button type="button" className="feed-icon-button" onClick={onClose}>×</button></header>
        <div className="research-modal-body">
          <div className="research-search-grid">
            <label>Product name<input value={search.name} onChange={(e) => setSearch((current) => ({ ...current, name: e.target.value }))} /></label>
            <label>Manufacturer<input value={search.manufacturer} onChange={(e) => setSearch((current) => ({ ...current, manufacturer: e.target.value }))} /></label>
            <label>Barcode<input value={search.barcode} onChange={(e) => setSearch((current) => ({ ...current, barcode: e.target.value }))} /></label>
            <button type="button" className="feed-primary-button" onClick={runSearch} disabled={status === "loading"}>{status === "loading" ? "Searching…" : "Search internet"}</button>
          </div>
          <div className="research-safety-note"><strong>Check before saving</strong><span>Online information can be incomplete or out of date. Dosages and warnings must be checked against the current product label or official manufacturer instructions.</span></div>
          {message && <div className="research-message">{message}</div>}
          {status === "loading" && <div className="research-loading"><span></span><p>Searching connected product databases…</p></div>}
          {status !== "loading" && results.length > 0 && <div className="research-results"><p>{results.length} possible {results.length === 1 ? "match" : "matches"}</p>{results.map((candidate) => <Candidate key={candidate.externalId} candidate={candidate} onUse={onUse} />)}</div>}
          {status !== "loading" && <div className="research-wider-search"><div><strong>Can’t find the product?</strong><span>Search the wider internet for the manufacturer’s official product page, then return and save the source address.</span></div><a className="feed-secondary-button" href={productResearchSearchUrl(search)} target="_blank" rel="noreferrer">Wider internet search ↗</a></div>}
        </div>
        <footer className="feed-modal-footer"><button type="button" className="feed-secondary-button" onClick={onClose}>Close</button></footer>
      </section>
    </div>
  );
}
