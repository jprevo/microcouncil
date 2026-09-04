import { writeLocalePreference } from "../../locale/preference";
import { LOCALES, localeHref } from "../../locale/registry";
import { useLocale } from "../../locale/useLocale";
import { useT } from "../../locale/useT";

/**
 * The language switch. Every language is its own page, so choosing one is a
 * navigation rather than a re-render — and the choice is written down first, so
 * that from now on the site opens in it instead of guessing from the browser.
 *
 * Each language names itself, in its own language: someone who lands on the
 * wrong page has to be able to recognise their own.
 */
export function LocalePicker() {
  const { bundle } = useLocale();
  const t = useT();

  function choose(code: string): void {
    if (code === bundle.meta.code) return;
    writeLocalePreference(code);
    globalThis.location.assign(localeHref(code));
  }

  return (
    <span className="locale-picker">
      <span aria-hidden="true">🌐</span>
      <select
        className="locale-picker__select"
        aria-label={t.footer.language}
        value={bundle.meta.code}
        onChange={(event) => {
          choose(event.target.value);
        }}
      >
        {LOCALES.map((locale) => (
          <option key={locale.code} value={locale.code} lang={locale.code}>
            {locale.label}
          </option>
        ))}
      </select>
    </span>
  );
}
