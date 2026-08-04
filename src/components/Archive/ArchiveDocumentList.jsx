import ArchiveDocumentRow from "./ArchiveDocumentRow";
import ArchiveEmpty from "./ArchiveEmpty";

export default function ArchiveDocumentList({
  documents = [],
  onDelete,
}) {
  if (documents.length === 0) {
    return (
      <div className="archive-library">
        <h3>Document Library</h3>

        <ArchiveEmpty />
      </div>
    );
  }

  return (
    <div className="archive-library">
      <h3>Document Library</h3>

      {documents.map((document) => (
        <ArchiveDocumentRow
          key={document.id}
          document={document}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}