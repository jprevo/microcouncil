import { OutputActions } from "./OutputActions";
import { OutputMeta } from "./OutputMeta";
import { OutputNote } from "./OutputNote";
import { OutputWarning } from "./OutputWarning";
import { PromptBox } from "./PromptBox";
import { Card } from "../ui/Card";
import { CardHead } from "../ui/CardHead";
import { CardTitle } from "../ui/CardTitle";
import { useT } from "../../locale/useT";
import { usePrompt } from "../../state/usePrompt";

export function OutputCard() {
  const prompt = usePrompt();
  const t = useT();

  return (
    <Card labelledBy="title-output" variant="output" id="prompt-output">
      <CardHead
        title={<CardTitle id="title-output">{t.output.title}</CardTitle>}
        hint={<OutputMeta prompt={prompt} />}
      />
      <OutputWarning />
      <PromptBox prompt={prompt} />
      <OutputActions prompt={prompt} />
      <OutputNote />
    </Card>
  );
}
