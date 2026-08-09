import { useEffect, useState } from "react";
import productStore from "../data/ProductStore";
import ProductLibrary from "./FeedPlanner/ProductLibrary";
import "./FeedPlanner.css";

export default function FeedPlanner() {
  const [products, setProducts] = useState(productStore.getProducts());
  const [tab, setTab] = useState("library");

  useEffect(() => productStore.subscribe(setProducts), []);

  return (
    <div className="feed-planner-page">
      <header className="feed-planner-hero">
        <div>
          <p className="feed-kicker">Loft Commander nutrition</p>
          <h1>Feed Planner</h1>
          <p>Build adaptable feed and drink programmes using the products available to each fancier.</p>
        </div>
        <div className="feed-hero-count"><strong>{products.filter((product) => !product.archived).length}</strong><span>active products</span></div>
      </header>

      <nav className="feed-planner-tabs" aria-label="Feed Planner sections">
        <button className={tab === "library" ? "active" : ""} onClick={() => setTab("library")}>Product Library</button>
        <button className={tab === "create" ? "active" : ""} onClick={() => setTab("create")}>Create Feed Plan</button>
        <button className={tab === "plans" ? "active" : ""} onClick={() => setTab("plans")}>Saved Plans</button>
        <button className={tab === "performance" ? "active" : ""} onClick={() => setTab("performance")}>Feed Performance</button>
      </nav>

      {tab === "library" && <ProductLibrary products={products} onSave={(product) => productStore.saveProduct(product)} onArchive={(id) => productStore.archiveProduct(id)} onRestore={(id) => productStore.restoreProduct(id)} onDelete={(id) => productStore.deleteProduct(id)} />}

      {tab !== "library" && (
        <section className="feed-content-card feed-next-stage">
          <span>{tab === "create" ? "🗓️" : tab === "plans" ? "📋" : "📈"}</span>
          <h2>{tab === "create" ? "Create Feed Plan" : tab === "plans" ? "Saved Plans" : "Feed Performance"}</h2>
          <p>{tab === "create"
            ? "The programme wizard will use products from your Product Library. Add and verify the products first so quantities and instructions can be calculated safely."
            : tab === "plans"
              ? "Versioned feeding programmes and their complete change history will appear here."
              : "Race results, returns and programme comparisons will appear here once saved plans are linked to races."}</p>
          <button className="feed-primary-button" onClick={() => setTab("library")}>Open Product Library</button>
        </section>
      )}
    </div>
  );
}
