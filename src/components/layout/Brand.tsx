import logoDark from "../../assets/logo-dark.svg";
import logoLight from "../../assets/logo-light.svg";
import { useT } from "../../locale/useT";

/**
 * The title, with the round table to its left. Both marks are always in the
 * document and the stylesheet hides the one that does not belong to the current
 * theme: the alternative — swapping `src` from the theme state — would repaint
 * the mark one frame after the rest of the page, and the toggle is the one
 * gesture where that flicker would be seen.
 *
 * The images are decorative, `alt=""`: the mark says nothing the heading next to
 * it does not already say out loud.
 */
export function Brand() {
  const t = useT();
  return (
    <h1 className="brand">
      <img className="brand__mark brand__mark--light" src={logoLight} alt="" />
      <img className="brand__mark brand__mark--dark" src={logoDark} alt="" />
      {t.brand}
    </h1>
  );
}
