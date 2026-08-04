import ArchiveUploadCard from "./ArchiveUploadCard";

const uploadTypes = [
  { icon: "📷", title: "Upload Photograph", type: "photo" },
  { icon: "📄", title: "Upload Pedigree", type: "pedigree" },
  { icon: "🏆", title: "Upload Certificate", type: "certificate" },
  { icon: "🏁", title: "Upload Race Sheet", type: "race" },
  { icon: "✍️", title: "Handwritten Record", type: "handwritten" },
  { icon: "📁", title: "Other Document", type: "other" },
];

export default function ArchiveUploadGrid({
  onUpload,
}) {
  return (
    <div className="archive-upload-grid">
      {uploadTypes.map((item) => (
        <ArchiveUploadCard
          key={item.type}
          icon={item.icon}
          title={item.title}
          onClick={() => onUpload(item.type)}
        />
      ))}
    </div>
  );
}