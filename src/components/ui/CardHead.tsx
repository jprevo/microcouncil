import type { ReactNode } from 'react';

interface CardHeadProps {
  readonly children: ReactNode;
  readonly actions?: ReactNode;
}

export function CardHead({ children, actions }: CardHeadProps) {
  return (
    <div className="card__head">
      <div>{children}</div>
      {actions === undefined ? null : <div className="card__actions">{actions}</div>}
    </div>
  );
}
