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
    <motion.div className="pt-4">
      <FrontPart front={front} layoutId={`${front}-title`} />
      <MotionDiv type={"fadeInWithStagger"} className="flex flex-col gap-4">
        <PartOfSpeechPart partOfSpeech={partOfSpeech} />
        <BackPart back={back} />
        <ExamplePhrasesPart phrase={examplePhrasesHTML} />
        <div className="absolute bottom-8 right-0 left-0">
          <Player
            autoplay
            loop
            speed={1.7}
            src={
              "https://assets8.lottiefiles.com/packages/lf20_d0gmxgy5KG.json"
            }
            style={{ width: 300, height: 300 }}
          />
        </div>
      </MotionDiv>
    </motion.div>
  );
}
