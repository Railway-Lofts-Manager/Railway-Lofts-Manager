import { useMemo, useState } from "react";
import ProductDetails from "./ProductDetails";
import ProductForm from "./ProductForm";

export default function ProductLibrary({ products, onSave, onArchive, onRestore, onDelete }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All products");
  const [showArchived, setShowArchived] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  const categories = useMemo(() => ["All products", ...new Set(products.map((product) => product.category).filter(Boolean))], [products]);
  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((product) => {
      if (!showArchived && product.archived) return false;
      if (category !== "All products" && product.category !== category) return false;
      return !term || [product.name, product.manufacturer, product.category, product.primaryJob, product.barcode]
        .some((value) => String(value || "").toLowerCase().includes(term));
    });
  }, [products, search, category, showArchived]);

  const selected = products.find((product) => product.id === selectedId);
  if (selected) {
    return (
      <>
        <ProductDetails product={selected} onBack={() => setSelectedId(null)} onEdit={setEditing} onArchive={onArchive} onRestore={onRestore} onDelete={(id) => { onDelete(id); setSelectedId(null); }} />
        {editing && <ProductForm product={editing} onClose={() => setEditing(null)} onSave={(product) => { onSave(product); setEditing(null); }} />}
      </>
    );
  }

  return (
    <>
      <section className="product-library-toolbar">
        <div>
          <p className="feed-kicker">Your available products</p>
          <h2>Product Library</h2>
          <p>Store feed, drink products, supplements and their verified instructions in one place.</p>
        </div>
        <button className="feed-primary-button" onClick={() => setEditing({})}>＋ Add product</button>
      </section>

      <section className="feed-content-card product-filters">
        <label className="product-search"><span>Search products</span><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Name, manufacturer, job or barcode" /></label>
        <label><span>Product type</span><select value={category} onChange={(e) => setCategory(e.target.value)}>{categories.map((value) => <option key={value}>{value}</option>)}</select></label>
        <label className="product-archive-toggle"><input type="checkbox" checked={showArchived} onChange={(e) => setShowArchived(e.target.checked)} />Show archived products</label>
      </section>

      {visible.length ? (
        <section className="product-card-grid">
          {visible.map((product) => (
            <button key={product.id} className="product-card" onClick={() => setSelectedId(product.id)}>
              <div className="product-card-photo">{(product.displayPhoto || product.labelPhoto || product.photo) ? <img src={product.displayPhoto || product.labelPhoto || product.photo} alt="" /> : <span>📦</span>}</div>
              <div className="product-card-body">
                <div className="product-card-topline"><span>{product.category}</span>{product.archived && <b>Archived</b>}</div>
                <h3>{product.name}</h3>
                <p>{product.manufacturer || "Manufacturer not recorded"}</p>
                {product.primaryJob && <div className="product-job"><small>Primary job</small><strong>{product.primaryJob}</strong></div>}
                <div className="product-card-footer"><span className={product.verified ? "verified" : "review"}>{product.verified ? "✓ Verified" : "Review required"}</span><strong>Open product →</strong></div>
              </div>
            </button>
          ))}
        </section>
      ) : (
        <section className="feed-content-card product-empty-state">
          <span>🌽</span><h3>{products.length ? "No products match these filters" : "Your Product Library is empty"}</h3>
          <p>{products.length ? "Try changing the search or product type." : "Add your first feed, grain, supplement or drink product."}</p>
          {!products.length && <button className="feed-primary-button" onClick={() => setEditing({})}>Add first product</button>}
        </section>
      )}

      {editing && <ProductForm product={editing.id ? editing : null} onClose={() => setEditing(null)} onSave={(product) => { onSave(product); setEditing(null); }} />}
    </>
  );
}
