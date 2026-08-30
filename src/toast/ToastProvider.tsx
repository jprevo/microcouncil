import { useCallback, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Toast } from './Toast';
import { ToastContext } from './context';

const VISIBLE_MS = 2200;

export function ToastProvider({ children }: { readonly children: ReactNode }) {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);
  const timer = useRef(0);

  const show = useCallback((text: string) => {
    setMessage(text);
    setVisible(true);
    globalThis.clearTimeout(timer.current);
    timer.current = globalThis.setTimeout(() => setVisible(false), VISIBLE_MS);
  }, []);

  useEffect(() => () => globalThis.clearTimeout(timer.current), []);

  return (
    <ToastContext value={show}>
      {children}
      <Toast message={message} visible={visible} />
    </ToastContext>
  );
}
