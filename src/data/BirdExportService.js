import * as XLSX from "xlsx";

function formatDateForFileName(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function createExportRow(bird) {
  return {
    "Loft Commander ID": bird.birdId || "",
    "Ring Number": bird.ringNumber || "",
    Name: bird.name || "",
    Sex: bird.sex || "",
    Colour: bird.colour || "",
    Breed: bird.breed || "",
    Family: bird.family || "",
    Year: bird.year || "",
    Age: bird.ageCategory || "",
    Status: bird.status || "",
    Loft: bird.loft || "",
    Section: bird.section || "",
    "Nest Box": bird.nestBox || "",
    "Father ID": bird.fatherId || "",
    "Mother ID": bird.motherId || "",
    "Original Owner": bird.originalOwner || "",
    "Archive Source": bird.archiveSource || "",
    Notes: bird.notes || "",
  };
}

export function exportBirdRegister(birds) {
  const rows = birds.map(createExportRow);
  const worksheet = XLSX.utils.json_to_sheet(rows);

  worksheet["!cols"] = [
    { wch: 20 },
    { wch: 18 },
    { wch: 18 },
    { wch: 10 },
    { wch: 16 },
    { wch: 22 },
    { wch: 22 },
    { wch: 10 },
    { wch: 16 },
    { wch: 16 },
    { wch: 24 },
    { wch: 20 },
    { wch: 14 },
    { wch: 20 },
    { wch: 20 },
    { wch: 24 },
    { wch: 24 },
    { wch: 40 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Bird Register");

  XLSX.writeFile(
    workbook,
    `Loft-Commander-Bird-Register-${formatDateForFileName()}.xlsx`,
  );
}
