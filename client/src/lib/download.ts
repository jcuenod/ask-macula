import type { HistoryEntry } from "./historyManager";

const convertToCSV = (data: HistoryEntry["results"]): string => {
  if (!data || data.length === 0) {
    return "";
  }
  const headers = Object.keys(data[0]);
  const csvRows = [headers.join(",")]; // Header row

  data.forEach((row) => {
    const values = headers.map((header) => {
      const escaped = ("" + row[header]).replace(/"/g, '""'); // Escape double quotes
      return `"${escaped}"`; // Enclose in double quotes
    });
    csvRows.push(values.join(","));
  });

  return csvRows.join("\n");
};

export const initiateCsvDownload = (item: HistoryEntry) => {
  const csvData = convertToCSV(item.results);
  const blob = new Blob(["\uFEFF" + csvData], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  const filename =
    item.naturalLanguageQuery
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .substring(0, 30) || "query_results";
  link.setAttribute("download", `${filename}_${item.id}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
