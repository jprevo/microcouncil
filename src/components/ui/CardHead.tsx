import type { ReactNode } from "react";

interface CardHeadProps {
  /** The `CardTitle`, and whatever pill belongs on the same line as it. */
  readonly title: ReactNode;
  /** One line under the rule, explaining what the section expects. */
  readonly hint?: ReactNode;
  readonly actions?: ReactNode;
}

/**
 * The head of a card: the heading, a rule running across the space it leaves,
 * then the section's actions. The rule is what closes the row — without it the
 * label and the buttons would float at opposite ends of an empty line.
 */
export function CardHead({ title, hint, actions }: CardHeadProps) {
  return (
    <div className="card__head">
      <div className="card__head-line">
        {title}
        <span className="card__rule" aria-hidden="true" />
        {actions === undefined ? null : (
          <div className="card__actions">{actions}</div>
        )}
      </div>
      {hint}
    </div>
  );
}
