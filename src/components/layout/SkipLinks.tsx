import { useT } from "../../locale/useT";

/**
 * Two ways past the top of the page, drawn only while they have the focus.
 *
 * The prompt is the point of the app and it sits at the far end of the document,
 * behind the whole catalogue of members: without a way over them, reaching the
 * copy button from the keyboard meant crossing every tile on the way. The grids
 * now hold one tab stop each, and these links skip even that.
 */
export function SkipLinks() {
  const t = useT();
  return (
    <>
      <a className="skip-link" href="#main">
        {t.a11y.skipToContent}
      </a>
      <a className="skip-link" href="#prompt-output">
        {t.a11y.skipToPrompt}
      </a>
    </>
  );
}
