function Detail({ title, children }) {
  if (!children || (Array.isArray(children) && !children.length)) return null;
  return <div className="product-detail-item"><dt>{title}</dt><dd>{Array.isArray(children) ? children.join(", ") : children}</dd></div>;
}

export default function ProductDetails({ product, onBack, onEdit, onArchive, onRestore, onDelete }) {
  const query = encodeURIComponent(`${product.manufacturer || ""} ${product.name} official pigeon product dosage ingredients`.trim());
  function confirmDelete() {
    const confirmed = window.confirm(`Permanently delete ${product.name}?\n\nThis cannot be undone. Archive the product instead if it may be needed for older feeding plans.`);
    if (confirmed) onDelete(product.id);
  }
  return (
    <section className="product-detail-page">
      <button className="feed-back-button" onClick={onBack}>← Back to Product Library</button>
      <div className="product-detail-hero">
        <div className="product-detail-image">
          {(product.displayPhoto || product.labelPhoto || product.photo) ? <img src={product.displayPhoto || product.labelPhoto || product.photo} alt={product.name} /> : <span>📦</span>}
        </div>
        <div className="product-detail-title">
          <p className="feed-kicker">{product.category}</p>
          <h2>{product.name}</h2>
          <p>{product.manufacturer || "Manufacturer not recorded"}</p>
          <div className="product-detail-badges">
            <span className={product.verified ? "verified" : "review"}>{product.verified ? "✓ Instructions verified" : "Review required"}</span>
            <span>{product.inStock ? "In stock" : "Not in stock"}</span>
            {product.archived && <span>Archived</span>}
          </div>
        </div>
        <div className="product-detail-actions">
          <button className="feed-primary-button" onClick={() => onEdit(product)}>Edit product</button>
          <a className="feed-secondary-button" href={`https://www.google.com/search?q=${query}`} target="_blank" rel="noreferrer">Research product online ↗</a>
          {product.archived
            ? <button className="feed-secondary-button" onClick={() => onRestore(product.id)}>Restore product</button>
            : <button className="feed-text-button" onClick={() => onArchive(product.id)}>Archive product</button>}
          <button className="feed-delete-button" onClick={confirmDelete}>Delete product</button>
        </div>
      </div>

      <div className="product-detail-layout">
        <article className="feed-content-card product-purpose-card">
          <p className="feed-kicker">Product information</p>
          <h3>What does this product do?</h3>
          <p>{product.description || "No description has been added yet. Use Edit product or Research product online to complete this record."}</p>
          {product.primaryJob && <div className="product-primary-job"><strong>Primary job</strong><span>{product.primaryJob}</span></div>}
          {product.keyBenefits && <div className="product-key-benefits"><strong>Key benefits</strong><p>{product.keyBenefits}</p></div>}
        </article>
        <article className="feed-content-card">
          <h3>Directions and dosage</h3>
          <dl className="product-detail-list">
            <Detail title="Used in">{product.administration}</Detail>
            <Detail title="Recommended amount">{[product.dosageAmount, product.dosageUnit, product.dosageBasis].filter(Boolean).join(" · ")}</Detail>
            <Detail title="Frequency">{product.frequency}</Detail>
            <Detail title="When and how to feed">{product.feedingGuidance}</Detail>
            <Detail title="Water guidance">{product.waterInstructions}</Detail>
            <Detail title="Suitable birds">{product.suitableFor}</Detail>
            <Detail title="Programme stages">{product.programmeStages}</Detail>
          </dl>
        </article>
        {product.mixingRules?.length > 0 && <article className="feed-content-card product-mixing-card"><h3>Mixing details</h3><div className="product-mixing-rules">{product.mixingRules.map((rule, index) => <div className="product-mixing-rule" key={`${rule.context}-${index}`}><strong>{rule.amount} {rule.unit}</strong><span>per {rule.basisAmount} {rule.basisUnit}</span><p>{rule.context}</p>{rule.durationDays && <small>Course: {rule.durationDays} days</small>}{rule.userSupplied && <small>User-supplied routine</small>}{rule.locked && <small>Label dose — planner must not alter it</small>}</div>)}</div></article>}
        {product.historicalUses?.length > 0 && <article className="feed-content-card product-history-use-card"><h3>Original Young Bird Plan uses</h3><ul>{product.historicalUses.map((use) => <li key={use}>{use}</li>)}</ul></article>}
        <article className="feed-content-card">
          <h3>Ingredients and analysis</h3>
          <dl className="product-detail-list">
            <Detail title="Ingredients">{product.ingredients}</Detail>
            <Detail title="Nutritional analysis">{product.nutritionalAnalysis}</Detail>
          </dl>
          {!product.ingredients && !product.nutritionalAnalysis && <p className="feed-muted">No ingredients or nutritional analysis recorded.</p>}
        </article>
        <article className="feed-content-card">
          <h3>Safety and storage</h3>
          <dl className="product-detail-list">
            <Detail title="Warnings">{product.warnings}</Detail>
            <Detail title="Storage / expiry">{product.storageInstructions}</Detail>
          </dl>
          {!product.warnings && !product.storageInstructions && <p className="feed-muted">No safety or storage information recorded.</p>}
        </article>
        <article className="feed-content-card product-source-card">
          <h3>Information source</h3>
          <p><strong>{product.sourceType || "User entered"}</strong></p>
          {(product.sourceUrls?.length ? product.sourceUrls : product.sourceUrl ? [product.sourceUrl] : []).map((url, index) => <a className="product-source-link" key={url} href={url} target="_blank" rel="noreferrer">Open source {index + 1} ↗</a>)}
          <p className="feed-muted">Last updated {new Date(product.updatedAt || product.createdAt || Date.now()).toLocaleDateString("en-GB")}</p>
        </article>
        {product.barcode && <article className="feed-content-card"><h3>Barcode</h3><p className="product-barcode-value">{product.barcode}</p></article>}
        {(product.labelPhoto || product.rearLabelPhoto) && (
          <article className="feed-content-card product-label-card">
            <h3>Original product labels</h3>
            <div className="product-label-images">
              {product.labelPhoto && <figure><img src={product.labelPhoto} alt={`${product.name} front label`} /><figcaption>Front label</figcaption></figure>}
              {product.rearLabelPhoto && <figure><img src={product.rearLabelPhoto} alt={`${product.name} rear label`} /><figcaption>Rear label</figcaption></figure>}
            </div>
          </article>
        )}
      </div>
    </section>
  );
}
