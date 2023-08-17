"use client";
import { AnimatePresence, motion, wrap } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import {
  BackPart,
  ExamplePhrasesPart,
  FrontPart,
  PartOfSpeechPart,
} from "../vocab-component/part-of-voacb";
import { useReviewMode } from "@/hooks/useReviewMode";
import { cn } from "@/lib/utils";

export default function ReviewSlide({ data: RawData }) {
  const [data, setData] = useState(RawData);
  const [[page, direction], setPage] = useState([0, 0]);
  const { review, setReview } = useReviewMode();
  const index = wrap(0, data.length, page);
  const paginate = (newDirection) => {
    setPage([page + newDirection, newDirection]);
  };

  const moveState = (e) => {
    if (e.key === "ArrowRight") paginate(1);
    if (e.key === "ArrowLeft") paginate(-1);
  };

  useEffect(() => {
    window.addEventListener("keydown", moveState);

    return () => {
      window.removeEventListener("keydown", moveState);
    };
  }, [page]);

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

        <div className="absolute bottom-4 left-0 right-0 gap-8 flex justify-center text-gray-300 z-10">
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

  const ranNum = useMemo(() => {
    return Math.random() >= 0.5 ? 1 : 0;
  }, []);
  const scale = pos === "center" ? 1 : 0.8;
  const isOne = ranNum === 1;
  const isTestMode = review.mode === "test";

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

  const c = {
    hasBack: review.display.includes("back"),
    hasPhrase: review.display.includes("phrase"),
    hasFront: review.display.includes("front"),
    isCenter: pos === "center",
  };

  const genProps = (where) => {
    if (where === "back") {
      if (isTestMode && !isOne) {
        return front;
      } else if (isTestMode && isOne) {
        return back;
      }
      return back;
    } else if (where === "front") {
      if (isTestMode && isOne) {
        return front;
      } else if (isTestMode && !isOne) {
        return back;
      }
      return front;
    }
  };

  return (
    <>
      <motion.div
        className="absolute w-full bg-white rounded-lg shadow-lg flex flex-col items-center pt-8 pb-6 px-4"
        layout="preserve-aspect"
        custom={direction}
        variants={variants}
        initial="enter"
        animate={`${pos}`}
        exit="exit"
        transition={{
          x: { type: "spring", stiffness: 300, damping: 30 },
          height: { duration: 1, type: "tween" },
          opacity: { duration: 0.2 },
        }}
      >
        <div
          className={cn("flex flex-col bg-white", {
            "w-full":
              review.display.includes("phrase") &&
              pos === "center" &&
              examplePhrasesHTML,
          })}
        >
          {c.hasFront && <FrontPart front={genProps("front")} />}
          {c.hasBack && c.isCenter && (
            <div className="mb-4">
              <BackPart back={genProps("back")} />
            </div>
          )}
          {c.hasBack && !c.isCenter && review.display.length === 1 && (
            <div className="mb-4">
              <BackPart back={genProps("back")} />
            </div>
          )}
          {c.hasPhrase && c.isCenter && (
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
