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

/**
 * `one` vs `other`, decided by `Intl.PluralRules` rather than a hardcoded "1 is
 * singular" rule: English only calls 1 singular, but French calls both 0 and 1
 * singular ("0 fiche", "1 fiche", "2 fiches"), and other locales have further
 * categories (`few`, `many`, `two`) this app doesn't ship copy for yet. Rules
 * outside `{one, other}` collapse onto `other`, which is the safe default across
 * CLDR locales.
 */
export function pluralize(
  count: number,
  forms: PluralForms,
  numberLocale: string,
): string {
  return new Intl.PluralRules(numberLocale).select(count) === "one"
    ? forms.one
    : forms.other;
}

/** The same, with a dedicated phrasing for zero instead of falling through to the rule. */
export function pluralizeZero(
  count: number,
  forms: ZeroPluralForms,
  numberLocale: string,
): string {
  if (count === 0) return forms.zero;
  return pluralize(count, forms, numberLocale);
}
