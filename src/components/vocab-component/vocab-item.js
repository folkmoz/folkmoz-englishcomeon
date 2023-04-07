"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import MotionDiv from "../motion-div";
import { useSelectedVocab } from "@/hooks/useSelectedVocab";

export default function VocabItem({ item }) {
  const { selected, setSelected } = useSelectedVocab();
  const front = item.properties.Front.title[0].plain_text;

  const replaceUrl = (e) => {
    e.preventDefault();
    window.history.replaceState(null, "", `/vocab/${front}`);
    setSelected(item);
  };

  return (
    <Link href={`/vocab/${front}`} onClick={replaceUrl} prefetch={false}>
      <MotionDiv
        type={"fadeIn"}
        whileHover={{ y: -10 }}
        className="p-4 glass-morphism hover:bg-white md:cursor-pointer"
      >
        <div className="min-h-[50px]">
          <motion.div className="font-semibold">
            {front}
          </motion.div>
        </div>
      </MotionDiv>
    </Link>
  );
}
