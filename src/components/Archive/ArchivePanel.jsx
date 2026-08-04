import { useState } from "react";

import "./ArchivePanel.css";

import ArchiveHeader from "./ArchiveHeader";
import ArchiveUploadGrid from "./ArchiveUploadGrid";
import ArchiveDocumentList from "./ArchiveDocumentList";
import ArchiveViewer from "./ArchiveViewer";

import { openArchiveFilePicker } from "./ArchiveUploader";

export default function ArchivePanel({
  bird,
  onUpdateBird,
}) {
  const [selectedDocument, setSelectedDocument] = useState(null);

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

    if (selectedDocument?.id === documentId) {
      setSelectedDocument(null);
    }
  }

  function handleOpen(document) {
    setSelectedDocument(document);
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
        onOpen={handleOpen}
      />

      <ArchiveViewer
        document={selectedDocument}
        onClose={() => setSelectedDocument(null)}
      />

    </div>
  );
}