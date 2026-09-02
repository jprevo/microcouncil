/** Repli pour les contextes non sécurisés (fichier local ouvert sans serveur). */
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
    // `execCommand` est obsolète mais reste le seul recours hors contexte sécurisé.
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
