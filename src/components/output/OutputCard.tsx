import { OutputActions } from "./OutputActions";
import { OutputMeta } from "./OutputMeta";
import { OutputNote } from "./OutputNote";
import { OutputWarning } from "./OutputWarning";
import { PromptBox } from "./PromptBox";
import { Card } from "../ui/Card";
import { CardHead } from "../ui/CardHead";
import { CardTitle } from "../ui/CardTitle";
import { usePrompt } from "../../state/usePrompt";

export function OutputCard() {
  const prompt = usePrompt();

  return (
    <Card labelledBy="title-output" variant="output">
      <CardHead>
        <CardTitle id="title-output">Votre prompt</CardTitle>
        <OutputMeta prompt={prompt} />
      </CardHead>
      <OutputWarning />
      <PromptBox prompt={prompt} />
      <OutputActions prompt={prompt} />
      <OutputNote />
    </Card>
  );
}
