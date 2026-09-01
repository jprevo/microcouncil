/** Entier aléatoire dans [0, max) en s'appuyant sur le CSPRNG du navigateur. */
function randomInt(max: number): number {
  if (max <= 0) return 0;
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return (buffer[0] ?? 0) % max;
}

export function pickOne<T>(items: readonly T[]): T | undefined {
  return items[randomInt(items.length)];
}
