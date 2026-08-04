import "./ArchiveDocumentRow.css";

const categoryMap = {
  pedigree: { icon: "📄", label: "Pedigree" },
  photo: { icon: "📷", label: "Photograph" },
  certificate: { icon: "🏆", label: "Certificate" },
  race: { icon: "🏁", label: "Race Sheet" },
  handwritten: { icon: "✍️", label: "Handwritten Record" },
  other: { icon: "📁", label: "Other Document" },
};

export default function ArchiveDocumentRow({
  document,
  onDelete,
  onOpen,
}) {
  const category =
    categoryMap[document.type] || categoryMap.other;

  function deleteDocument() {
    if (
      window.confirm(
        `Delete "${document.title || document.name}"?`
      )
    ) {
      onDelete(document.id);
    }
  }

  return (
    <article className="archive-document-card">

      <div className="archive-document-header">

        <div className="archive-document-icon">
          {category.icon}
        </div>

        <div className="archive-document-title">

          <h3>{document.title || document.name}</h3>

          <span className="archive-category">
            {category.label}
          </span>

        </div>

      </div>

      <div className="archive-document-meta">

        <div>
          <strong>Uploaded</strong>
          <span>{document.uploaded}</span>
        </div>

        <div>
          <strong>Original File</strong>
          <span>{document.name}</span>
        </div>

      </div>

      <div className="archive-document-actions">

        <button
          type="button"
          onClick={() => onOpen(document)}
        >
          👁 Open
        </button>

        <button
          type="button"
          onClick={deleteDocument}
        >
          🗑 Delete
        </button>

      </div>

    </article>
  );
}