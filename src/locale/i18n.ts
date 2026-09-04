import type { PluralForms, ZeroPluralForms } from "./types";

/** Fills `{name}`-style placeholders; a param missing from `params` is left as-is. */
export function format(
  template: string,
  params: Readonly<Record<string, string | number>>,
): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}

/** CLDR-lite: `one` at exactly 1, `other` otherwise. Enough for the locales shipped today. */
export function pluralize(count: number, forms: PluralForms): string {
  return count === 1 ? forms.one : forms.other;
}

/** The same, with a dedicated phrasing for zero instead of falling through to `other`. */
export function pluralizeZero(count: number, forms: ZeroPluralForms): string {
  if (count === 0) return forms.zero;
  return pluralize(count, forms);
}
