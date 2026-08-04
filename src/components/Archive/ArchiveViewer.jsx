import "./ArchiveViewer.css";

export default function ArchiveViewer({
  document,
  onClose,
}) {
  if (!document) {
    return null;
  }

  const isImage =
    document.type?.startsWith("image/");

  function stopPropagation(event) {
    event.stopPropagation();
  }

  return (
    <div
      className="archive-viewer-overlay"
      onClick={onClose}
    >
      <div
        className="archive-viewer"
        onClick={stopPropagation}
      >
        <div className="archive-viewer-header">

          <h3>
            {document.title || document.name}
          </h3>

          <button
            type="button"
            onClick={onClose}
          >
            ✖
          </button>

        </div>

        <div className="archive-viewer-body">

          {isImage ? (
            <img
              src={document.data}
              alt={document.title}
            />
          ) : (
            <iframe
              src={document.data}
              title={document.title}
            />
          )}

        </div>
      </div>
    </div>
  );
}