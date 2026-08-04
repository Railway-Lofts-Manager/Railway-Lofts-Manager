export default function ArchiveDocumentRow({
  document,
  onDelete,
}) {
  function openDocument() {
    if (document.data) {
      window.open(document.data, "_blank");
    }
  }

  function deleteDocument(e) {
    e.stopPropagation();

    const confirmed = window.confirm(
      `Delete "${document.name}"?`
    );

    if (confirmed) {
      onDelete(document.id);
    }
  }

  return (
    <div
      className="archive-document"
      onClick={openDocument}
    >
      <div className="archive-document-icon">
        📄
      </div>

      <div className="archive-document-details">
        <strong>{document.name}</strong>

        <small>
          {document.type} • {document.uploaded}
        </small>
      </div>

      <button
        className="archive-delete-button"
        onClick={deleteDocument}
        type="button"
      >
        🗑
      </button>
    </div>
  );
}