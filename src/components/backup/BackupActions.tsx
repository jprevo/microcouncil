import { ExportButton } from "./ExportButton";
import { ImportButton } from "./ImportButton";

/** The two halves of one gesture: taking your data out, and putting it back. */
export function BackupActions() {
  return (
    <>
      <ExportButton />
      <ImportButton />
    </>
  );
}
