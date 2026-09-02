import { CopyButton } from "./CopyButton";
import { DownloadButton } from "./DownloadButton";

export function OutputActions({ prompt }: { readonly prompt: string }) {
  return (
    <div className="output__actions">
      <CopyButton prompt={prompt} />
      <div className="output__actions-aside">
        <DownloadButton prompt={prompt} />
      </div>
    </div>
  );
}
