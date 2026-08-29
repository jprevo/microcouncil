/** Entier aléatoire dans [0, max) en s'appuyant sur le CSPRNG du navigateur. */
function randomInt(max: number): number {
  if (max <= 0) return 0;
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return (buffer[0] ?? 0) % max;
}

/** Mélange de Fisher-Yates sur une copie. */
export function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = randomInt(i + 1);
    const a = copy[i];
    const b = copy[j];
    if (a !== undefined && b !== undefined) {
      copy[i] = b;
      copy[j] = a;
    }
  }
  return copy;
}

export function pickOne<T>(items: readonly T[]): T | undefined {
  return items[randomInt(items.length)];
}

export function pickMany<T>(items: readonly T[], count: number): T[] {
  return shuffle(items).slice(0, Math.max(0, Math.min(count, items.length)));
}
