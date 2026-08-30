export function PromptBox({ prompt }: { readonly prompt: string }) {
  return (
    <pre className="prompt" tabIndex={0}>
      {prompt}
    </pre>
  );
}
