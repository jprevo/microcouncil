import { REPO_URL } from "../../lib/links";
import { useT } from "../../locale/useT";

/**
 * A plain link to the repository, dressed as the other pills of the top bar.
 * GitHub's own star button would bring a third-party script and a live count
 * with it: the script would break the promise that the page never calls anyone,
 * and the count would tie the look of the page to a number it does not control.
 *
 * It opens in a new tab so that a council being put together is not lost; the
 * accessible name says so, since nothing on screen does.
 */
export function GitHubStar() {
  const t = useT();
  return (
    <a
      className="icon-button"
      href={REPO_URL}
      target="_blank"
      rel="noreferrer"
      aria-label={t.topbar.starAria}
    >
      <span aria-hidden="true">⭐</span>
      <span className="icon-button__label">{t.topbar.star}</span>
    </a>
  );
}
