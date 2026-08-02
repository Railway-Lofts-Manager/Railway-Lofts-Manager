import "./ArchivePanel.css";

export default function ArchivePanel({ bird }) {
  const documents = bird?.documents || [];

  return (
    <div className="archive-panel">

      <div className="archive-header">
        <p className="archive-label">PERMANENT BIRD RECORD</p>
        <h2>Archive Intelligence</h2>
        <p className="archive-intro">
          Preserve every important document, photograph and historical record
          connected to this bird.
        </p>
      </div>

      <div className="archive-upload-grid">

        <button className="archive-upload-card">
          <span>📷</span>
          <strong>Upload Photograph</strong>
        </button>

        <button className="archive-upload-card">
          <span>📄</span>
          <strong>Upload Pedigree</strong>
        </button>

        <button className="archive-upload-card">
          <span>🏆</span>
          <strong>Upload Certificate</strong>
        </button>

        <button className="archive-upload-card">
          <span>🏁</span>
          <strong>Upload Race Sheet</strong>
        </button>

        <button className="archive-upload-card">
          <span>✍️</span>
          <strong>Handwritten Record</strong>
        </button>

        <button className="archive-upload-card">
          <span>📁</span>
          <strong>Other Document</strong>
        </button>

      </div>

      <div className="archive-library">

        <h3>Document Library</h3>

        {documents.length === 0 ? (
          <div className="archive-empty">
            No archive documents have been uploaded yet.
          </div>
        ) : (
          documents.map((doc, index) => (
            <div className="archive-document" key={index}>
              📄 {doc.name}
            </div>
          ))
        )}

      </div>

    </div>
  );
}