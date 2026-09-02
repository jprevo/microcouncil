import { Aurora } from "./components/layout/Aurora";
import { Footer } from "./components/layout/Footer";
import { Shell } from "./components/layout/Shell";
import { TopBar } from "./components/layout/TopBar";
import { ConfigColumn } from "./components/panels/ConfigColumn";
import { OutputColumn } from "./components/panels/OutputColumn";
import { SavesProvider } from "./saves/SavesProvider";
import { AppStateProvider } from "./state/AppStateProvider";
import { ToastProvider } from "./toast/ToastProvider";

export function App() {
  return (
    <AppStateProvider>
      <SavesProvider>
        <ToastProvider>
          <Aurora />
          <TopBar />
          <Shell>
            <ConfigColumn />
            <OutputColumn />
          </Shell>
          <Footer />
        </ToastProvider>
      </SavesProvider>
    </AppStateProvider>
  );
}
