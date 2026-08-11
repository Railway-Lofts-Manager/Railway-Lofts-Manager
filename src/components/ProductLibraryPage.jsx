import { useEffect, useState } from "react";
import productStore from "../data/ProductStore";
import ProductLibrary from "./FeedPlanner/ProductLibrary";
import "./FeedPlanner.css";

export default function ProductLibraryPage() {
  const [products, setProducts] = useState(productStore.getProducts());

  useEffect(() => productStore.subscribe(setProducts), []);

  return (
    <div className="feed-planner-page">
      <header className="feed-planner-hero product-library-page-hero">
        <div>
          <p className="feed-kicker">Private to this fancier</p>
          <h1>Product Library</h1>
          <p>Manage the corn, grains, minerals, supplements and treatments available for this loft’s feeding programmes.</p>
        </div>
        <div className="feed-hero-count"><strong>{products.filter((product) => !product.archived).length}</strong><span>active products</span></div>
      </header>

      <div className="standalone-product-library">
        <ProductLibrary
          products={products}
          onSave={(product) => productStore.saveProduct(product)}
          onArchive={(id) => productStore.archiveProduct(id)}
          onRestore={(id) => productStore.restoreProduct(id)}
          onDelete={(id) => productStore.deleteProduct(id)}
          onReanalyse={() => productStore.reanalyseProducts()}
        />
      </div>
    </div>
  );
}
