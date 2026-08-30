import { useEffect, useRef, useState } from 'react';
import { copyText } from '../../lib/clipboard';
import { useToast } from '../../toast/useToast';

const DONE_MS = 1800;

export interface CopyControl {
  readonly copied: boolean;
  readonly copy: () => void;
}

/** Copie `text`, marque le bouton un instant, puis annonce `message` dans un toast. */
export function useCopyAction(text: string, message: string): CopyControl {
  const [copied, setCopied] = useState(false);
  const timer = useRef(0);
  const toast = useToast();

  useEffect(() => () => globalThis.clearTimeout(timer.current), []);

  const copy = (): void => {
    void copyText(text).then((success) => {
      if (!success) {
        toast('Copie impossible — sélectionnez le texte manuellement');
        return;
      }
      setCopied(true);
      globalThis.clearTimeout(timer.current);
      timer.current = globalThis.setTimeout(() => setCopied(false), DONE_MS);
      toast(message);
    });
  };

  return { copied, copy };
}
