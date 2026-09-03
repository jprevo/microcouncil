/** Hands the browser a file built in memory, without ever leaving the page. */
function download(text: string, filename: string, type: string): void {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadMarkdown(text: string, filename: string): void {
  download(text, filename, "text/markdown;charset=utf-8");
}

export function downloadJson(text: string, filename: string): void {
  download(text, filename, "application/json;charset=utf-8");
}
