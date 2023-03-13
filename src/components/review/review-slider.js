"use client";
import { AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { motion, wrap } from "framer-motion";
import {
  BackPart,
  ExamplePhrasesPart,
  FrontPart,
  PartOfSpeechPart,
} from "../vocab-component/part-of-voacb";
import { useReviewMode } from "@/hooks/useReviewMode";

export default function ReviewSlide({ data: RawData }) {
  const [data, setData] = useState(RawData);
  const [[page, direction], setPage] = useState([0, 0]);
  const { review, setReview } = useReviewMode();
  const index = wrap(0, data.length, page);
  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  const genPrev = () => {
    if (page === 0) {
      return data.length - 1;
    }
    return index === 0 ? data.length - 1 : index - 1;
  };

  const genNext = () => {
    if (page === data.length - 1) {
      return 0;
    }
    return index === data.length - 1 ? 0 : index + 1;
  };

  const prev = genPrev();
  const next = genNext();

  const genProps = (i) => {
    return {
      direction,
      pos: i === index ? "center" : i === genPrev() ? "left" : "right",
      ...data[i],
    };
  };

  const reset = () => {
    setPage([0, 0]);
    setReview((prev) => {
      return {
        ...prev,
        data: prev.rawData.slice(),
      };
    });
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    setReview((prev) => {
      return {
        ...prev,
        resetFunc: reset,
        rawData: RawData.slice(),
        data,
      };
    });
  }, []);

  useEffect(() => {
    setData(review.data);
  }, [review.data]);

  return (
    <>
      <AnimatePresence initial={false} custom={direction}>
        <SlideItem {...genProps(prev)} key={prev} />
        <SlideItem {...genProps(index)} key={index} />
        <SlideItem {...genProps(next)} key={next} />

        <div className="absolute bottom-4 left-0 right-0 gap-8 flex justify-center text-gray-300">
          <motion.div
            whileHover={{ x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => paginate(-1)}
            className="h-[70px] w-[70px] hover:text-gray-700 rounded-full glass-morphism flex justify-center items-center cursor-pointer hover:opacity-80 transition-opacity duration-300 ease-in-out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </motion.div>
          <motion.div
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => paginate(1)}
            className="h-[70px] w-[70px] hover:text-gray-700 rounded-full glass-morphism flex justify-center items-center cursor-pointer hover:opacity-80 transition-opacity duration-300 ease-in-out"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="50"
              height="50"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </motion.div>
        </div>
      </AnimatePresence>
    </>
  );
}

const SlideItem = ({
  front,
  back,
  partOfSpeech,
  examplePhrasesHTML,
  direction,
  pos,
}) => {
  const { review, setReview } = useReviewMode();

  const scale = pos === "center" ? 1 : 0.8;

  const variants = {
    left: {
      x: -300,
      opacity: 0.4,
      zIndex: 0,
      scale,
      pointerEvents: "none",
    },
    right: {
      x: 300,
      opacity: 0.4,
      zIndex: 0,
      scale,
      pointerEvents: "none",
    },
    enter: (direction) => {
      return {
        x: direction > 0 ? 300 : -300,
        opacity: 0.4,
        zIndex: 0,
        scale: 0,
      };
    },
    center: {
      x: 0,
      opacity: 1,
      zIndex: 1,
      scale,
      pointerEvents: "auto",
    },
    exit: (direction) => {
      return {
        x: direction < 0 ? 300 : -300,
        opacity: 0,
        zIndex: 0,
        scale: 0,
      };
    },
  };
  return (
    <>
      <motion.div
        layout
        className="absolute w-full bg-white rounded-lg shadow-lg flex flex-col items-center pt-8 pb-6 px-4"
        custom={direction}
        variants={variants}
        initial="enter"
        animate={`${pos}`}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={1}
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          height: { duration: 0.2, type: "tween" },
          opacity: { duration: 0.2 },
        }}
      >
        <div className="flex flex-col bg-white">
          {review.display.includes("front") && <FrontPart front={front} />}
          {review.display.includes("back") && pos === "center" && (
            <div className="mb-4">
              <BackPart back={back} />
            </div>
          )}
          {review.display.includes("phrase") && pos === "center" && (
            <ExamplePhrasesPart phrase={examplePhrasesHTML} />
          )}

          <div className="mx-auto mt-6">
            <PartOfSpeechPart partOfSpeech={partOfSpeech} />
          </div>
        </div>
      </motion.div>
    </>
  );
};
