import { useCopyAction } from '../ui/useCopyAction';
import type { CopyControl } from '../ui/useCopyAction';

export function useCopyPrompt(prompt: string): CopyControl {
  return useCopyAction(prompt, 'Prompt copié dans le presse-papiers');
}
