import { useState } from "react";

import "./ArchivePanel.css";

import ArchiveHeader from "./ArchiveHeader";
import ArchiveUploadGrid from "./ArchiveUploadGrid";
import ArchiveDocumentList from "./ArchiveDocumentList";
import ArchiveViewer from "./ArchiveViewer";

import { openArchiveFilePicker } from "./ArchiveUploader";
import {
  deleteDocument,
  getDocument,
  saveDocument,
} from "../../data/DocumentStore";

export default function ArchivePanel({
  bird,
  onUpdateBird,
}) {
  const [selectedDocument, setSelectedDocument] = useState(null);

  const documents = bird?.documents || [];

  function handleUpload(type) {
    openArchiveFilePicker(type, async (document) => {
      await saveDocument(document);
      const metadata = { ...document };
      delete metadata.data;
      const updatedBird = {
        ...bird,
        documents: [...documents, metadata],
      };

      onUpdateBird(updatedBird);
    });
  }

  async function handleDelete(documentId) {
    await deleteDocument(documentId);
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

  async function handleOpen(document) {
    const storedDocument = await getDocument(document.id);
    setSelectedDocument(storedDocument || document);
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
