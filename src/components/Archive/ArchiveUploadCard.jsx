export default function ArchiveUploadCard({
  icon,
  title,
  onClick,
}) {
  return (
    <button
      type="button"
      className="archive-upload-card"
      onClick={onClick}
    >
      <span>{icon}</span>

      <strong>{title}</strong>
    </button>
  );
}