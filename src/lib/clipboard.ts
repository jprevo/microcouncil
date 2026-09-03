/** Fallback for insecure contexts, such as the page opened as a local file. */
function copyViaScratchArea(text: string): boolean {
  const scratch = document.createElement("textarea");
  scratch.value = text;
  scratch.setAttribute("readonly", "");
  scratch.style.position = "fixed";
  scratch.style.opacity = "0";
  document.body.append(scratch);
  scratch.select();
  let copied: boolean;
  try {
    // `execCommand` is deprecated, but it is the only option outside a secure context.
    // eslint-disable-next-line sonarjs/deprecation
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  }
  scratch.remove();
  return copied;
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return copyViaScratchArea(text);
  }
}
