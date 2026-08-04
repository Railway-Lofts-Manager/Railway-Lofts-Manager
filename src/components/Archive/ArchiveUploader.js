export function openArchiveFilePicker(type, callback) {
  const input = document.createElement("input");

  input.type = "file";
  input.accept = ".pdf,.jpg,.jpeg,.png";
  input.style.display = "none";

  document.body.appendChild(input);

  input.addEventListener("change", (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      document.body.removeChild(input);
      return;
    }

    const defaultTitle = file.name.replace(/\.[^/.]+$/, "");

    const title = window.prompt(
      "Document title:",
      defaultTitle
    );

    if (title === null) {
      document.body.removeChild(input);
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      callback({
        id: crypto.randomUUID(),
        type,
        title,
        name: file.name,
        uploaded: new Date().toLocaleDateString(),
        size: file.size,
        data: reader.result,
      });

      document.body.removeChild(input);
    };

    reader.readAsDataURL(file);
  });

  input.click();
}