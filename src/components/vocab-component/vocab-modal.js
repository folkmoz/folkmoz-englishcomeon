import { useSelectedVocab } from "@/hooks/useSelectedVocab";
import { motion } from "framer-motion";
import VocabModalBody from "./vocab-modal-body";
import { useEffect } from "react";

const variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
}

export default function VocabModal({ item }) {
  const { _, setSelected } = useSelectedVocab();
  const front = item.properties.Front.title[0].plain_text;

  const closeModal = () => {
    setSelected(null);
    window.history.replaceState(null, "", `/`);
  };

  useEffect(() => {
    document.body.classList.add("overflow-hidden");

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, []);

  return (
    <motion.div  className="flex justify-center items-center fixed inset-0">
      <div className="w-full max-w-lg h-full flex flex-col">
        <div className="flex-1 md:py-28">
          <motion.div
            className="flex flex-col bg-white relative z-50 rounded-[10px] shadow-xl"
          >
            <div className="flex-1 p-4 md:p-8">
              <div className="flex flex-col ">
                <VocabModalBody item={item} />
              </div>
            </div>
          </motion.div>
        </div>
      </div>
      <motion.div
        onClick={closeModal}
        className="absolute inset-0 glass-morphism"
      />
    </motion.div>
  );
}
