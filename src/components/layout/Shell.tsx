import type { ReactNode } from 'react';
import { Lede } from './Lede';

export function Shell({ children }: { readonly children: ReactNode }) {
  return (
    <main className="shell">
      <Lede />
      <div className="columns">{children}</div>
    </main>
  );
}
