import "./ArchiveDocumentList.css";

import ArchiveDocumentRow from "./ArchiveDocumentRow";
import ArchiveEmpty from "./ArchiveEmpty";

export default function ArchiveDocumentList({
  documents = [],
  onDelete,
  onOpen,
}) {
  return (
    <section className="archive-library">

      <div className="archive-library-header">

        <h3>📂 Bird Archive</h3>

        <span className="archive-document-count">
          {documents.length} document{documents.length !== 1 ? "s" : ""}
        </span>

      </div>

      {documents.length === 0 ? (
        <ArchiveEmpty />
      ) : (
        <div className="archive-document-grid">

          {documents.map((document) => (
            <ArchiveDocumentRow
              key={document.id}
              document={document}
              onDelete={onDelete}
              onOpen={onOpen}
            />
          ))}

        </div>
      )}

    </section>
  );
}