import { Fragment } from "react";

/** Renders `` `code` `` spans from a plain-text string as real `<code>` elements. */
export function InlineCode({ text }: { readonly text: string }) {
  const parts = text.split(/`([^`]+)`/g);
  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <code key={index}>{part}</code>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        ),
      )}
    </>
  );
}
