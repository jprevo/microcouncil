import { Footer } from "./components/layout/Footer";
import { Shell } from "./components/layout/Shell";
import { TopBar } from "./components/layout/TopBar";
import { ConfigColumn } from "./components/panels/ConfigColumn";
import { OutputColumn } from "./components/panels/OutputColumn";
import { LocaleProvider } from "./locale/LocaleProvider";
import type { LocaleBundle } from "./locale/types";
import { SavesProvider } from "./saves/SavesProvider";
import { AppStateProvider } from "./state/AppStateProvider";
import { ToastProvider } from "./toast/ToastProvider";

export function App({ bundle }: { readonly bundle: LocaleBundle }) {
  return (
    <LocaleProvider bundle={bundle}>
      <AppStateProvider>
        <SavesProvider>
          <ToastProvider>
            <TopBar />
            <Shell>
              <ConfigColumn />
              <OutputColumn />
            </Shell>
            <Footer />
          </ToastProvider>
        </SavesProvider>
      </AppStateProvider>
    </LocaleProvider>
  );
}
