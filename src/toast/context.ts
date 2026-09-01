import { createContext } from "react";

export type ShowToast = (message: string) => void;

export const ToastContext = createContext<ShowToast | null>(null);
