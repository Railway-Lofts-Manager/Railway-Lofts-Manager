import "./ArchivePanel.css";

import ArchiveHeader from "./ArchiveHeader";
import ArchiveUploadGrid from "./ArchiveUploadGrid";
import ArchiveDocumentList from "./ArchiveDocumentList";

import { openArchiveFilePicker } from "./ArchiveUploader";

export default function ArchivePanel({
  bird,
  onUpdateBird,
}) {
  const documents = bird?.documents || [];

  function handleUpload(type) {
    openArchiveFilePicker(type, (document) => {
      const updatedBird = {
        ...bird,
        documents: [...documents, document],
      };

      onUpdateBird(updatedBird);
    });
  }

  function handleDelete(documentId) {
    const updatedBird = {
      ...bird,
      documents: documents.filter(
        (doc) => doc.id !== documentId
      ),
    };

    onUpdateBird(updatedBird);
  }

  return (
    <div className="archive-panel">

      <ArchiveHeader />

      <ArchiveUploadGrid
        onUpload={handleUpload}
      />

      <ArchiveDocumentList
        documents={documents}
        onDelete={handleDelete}
      />

    </div>
  );
}