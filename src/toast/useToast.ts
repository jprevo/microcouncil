import { useContext } from "react";
import { ToastContext } from "./context";
import type { ShowToast } from "./context";

export function useToast(): ShowToast {
  const show = useContext(ToastContext);
  if (show === null)
    throw new Error("useToast must be used inside <ToastProvider>.");
  return show;
}
