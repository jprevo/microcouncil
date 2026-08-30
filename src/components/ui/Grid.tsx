import type { ReactNode } from 'react';

interface GridProps {
  readonly variant: 'members' | 'environments';
  readonly children: ReactNode;
}

export function Grid({ variant, children }: GridProps) {
  return <div className={`grid grid--${variant}`}>{children}</div>;
}
