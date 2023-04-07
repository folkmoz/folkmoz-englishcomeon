import MotionDiv from "../motion-div";
import { SplitVariable } from "@/hooks/useSplitVariable";
import { motion } from "framer-motion";
import { Player } from "@lottiefiles/react-lottie-player";
import {
  FrontPart,
  BackPart,
  ExamplePhrasesPart,
  PartOfSpeechPart,
} from "./part-of-voacb";

export default function VocabModalBody({ item }) {
  const { examplePhrasesHTML, partOfSpeech, back, front } = SplitVariable(item);
  return (
    <motion.div className="py-4">
      <FrontPart front={front}  />
      <MotionDiv  className="flex flex-col gap-4">
        <PartOfSpeechPart partOfSpeech={partOfSpeech} />
        <BackPart back={back} />
        <ExamplePhrasesPart phrase={examplePhrasesHTML} />

      </MotionDiv>
    </motion.div>
  );
}
