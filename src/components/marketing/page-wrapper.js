"use client";

import { useSelectedVocab } from "@/hooks/useSelectedVocab";
import MotionDiv from "../motion-div";
import VocabModal from "../vocab-component/vocab-modal";
import { AnimatePresence } from "framer-motion";

export default function PageWrapper({ children }) {
  const { selected } = useSelectedVocab();

  return (
    <MotionDiv className="flex-1 grid sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5 gap-6 ">
      {children}

      <AnimatePresence >
        {selected && <VocabModal item={selected} />}
      </AnimatePresence>
    </MotionDiv>
  );
}
