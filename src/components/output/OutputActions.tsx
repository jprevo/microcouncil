import { CopyButton } from "./CopyButton";
import { DownloadButton } from "./DownloadButton";

export function OutputActions({ prompt }: { readonly prompt: string }) {
  return (
    <div className="output__actions">
      <CopyButton prompt={prompt} />
      <DownloadButton prompt={prompt} />
    </div>
  );
}
