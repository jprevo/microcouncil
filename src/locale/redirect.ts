import { readLocalePreference } from "./preference";
import { DEFAULT_LOCALE, localeHref, matchLocale } from "./registry";

/** What the browser asks for, newest API first, as a plain list of BCP 47 tags. */
function requestedLanguages(): readonly string[] {
  const { languages, language } = globalThis.navigator;
  if (languages.length > 0) return languages;
  return language === "" ? [] : [language];
}

/**
 * Sends a first-time visitor to the page for their own language, and a returning
 * one to the language they picked by hand — a stored choice always outranks what
 * the browser advertises, since it is the more deliberate of the two.
 *
 * Only the default page redirects: it is the address people reach by typing the
 * domain, whereas `/fr` and its siblings are deliberate — a shared link, a
 * bookmark, a search result — and bouncing those elsewhere would make a language
 * impossible to link to.
 *
 * Returns true once navigation has started, so the caller can skip mounting an
 * app that is about to be thrown away. Called before the first render, from the
 * generated entry point of every page (`scripts/build-pages.mjs`), which is why
 * a redirected visitor never sees a flash of the wrong language: at that point
 * the document is still an empty `#root`.
 */
export function redirectToPreferredLocale(current: string): boolean {
  if (current !== DEFAULT_LOCALE.code) return false;

  const target = readLocalePreference() ?? matchLocale(requestedLanguages());
  if (target === null || target === current) return false;

  // `replace`, not `assign`: the page being left behind is one the visitor never
  // asked for, and it has no business sitting in history ready to bounce them
  // straight back into it.
  globalThis.location.replace(localeHref(target));
  return true;
}
