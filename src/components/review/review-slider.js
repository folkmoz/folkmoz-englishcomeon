"use client";
import { AnimatePresence, motion, wrap } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  BackPart,
  ExamplePhrasesPart,
  FrontPart,
  PartOfSpeechPart,
} from "../vocab-component/part-of-voacb";
import { useReviewMode } from "@/hooks/useReviewMode";
import { cn } from "@/lib/utils";
import { Antic_Didone } from "@next/font/google";

const font = Antic_Didone({
  display: "swap",
  weight: ["400"],
  preload: true,
  subsets: ["latin"],
});

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
      ...review.data[i],
      paginate,
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
    setReview((prev) => {
      return {
        ...prev,
        resetFunc: reset,
        rawData: RawData.slice(),
        data,
      };
    });
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    setPage([0, 0]);
  }, [review.data]);

  return (
    <>
      <div className={cn("ml-auto mb-4 max-w-xs", font.className)}>
        <div className="ml-8 font-semibold">
          <span className={"text-2xl"}>
            {page + 1 > data.length
              ? page + 1 - data.length * Math.floor(page / data.length)
              : page + 1}
          </span>
          /<i className={"opacity-60"}>{data.length}</i>
        </div>
      </div>

      <div className={"w-full max-w-lg  relative h-full mx-auto"}>
        <AnimatePresence initial={false} custom={direction}>
          <SlideItem {...genProps(prev)} key={prev} />
          <SlideItem {...genProps(index)} key={index} />
          <SlideItem {...genProps(next)} key={next} />
        </AnimatePresence>

        <div className="absolute bottom-4 left-0 right-0 gap-8 flex justify-center text-gray-300 z-10">
          <motion.button
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
          </motion.button>
          <motion.button
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
          </motion.button>
        </div>
      </div>
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
  paginate,
}) => {
  const { review, setReview } = useReviewMode();
  const [isWrong, setIsWrong] = useState(false);

  const ranNum = useMemo(() => {
    return Math.random() >= 0.5 ? 1 : 0;
  }, []);
  const scale = pos === "center" ? 1 : 0.8;
  const isOne = ranNum === 1;
  const isTestMode = review.mode === "test";

  const inputRef = useRef();

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

  const handleDisplay = (value) => {
    if (review.display.length === 1 && review.display.includes(value)) {
      return;
    } else {
      setReview((prev) => {
        return {
          ...prev,
          display: prev.display.includes(value)
            ? prev.display.filter((item) => item !== value)
            : [...prev.display, value],
        };
      });
    }
  };

  const moveState = (e) => {
    const isInput = e.target.tagName === "INPUT";
    const isNumber = !isNaN(e.key);
    const hasValue = e.target.value;
    if (isInput && hasValue) return;
    if (isInput && isNumber) return;
    switch (e.key) {
      case "ArrowRight":
        paginate(1);
        break;
      case "ArrowLeft":
        paginate(-1);
        break;
      case "1":
        handleDisplay("front");
        break;
      case "2":
        handleDisplay("back");
        break;
      case "3":
        handleDisplay("phrase");
        break;
      default:
        break;
    }
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

  const checkAnswer = (e) => {
    const answer = e.target.value.toLowerCase().trim();
    if (e.key === "Enter") {
      if (answer === front.toLowerCase().trim()) {
        paginate(1);
        e.target.value = "";
      } else {
        setIsWrong(true);
        setTimeout(() => {
          setIsWrong(false);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  });

  useEffect(() => {
    if (c.isCenter) {
      window.addEventListener("keydown", moveState);
    }
    return () => {
      window.removeEventListener("keydown", moveState);
    };
  }, [c.isCenter, review.display]);

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
          {c.hasBack &&
            c.isCenter &&
            review.display.length === 1 &&
            review.mode !== "test" && (
              <>
                <div className="mb-4">
                  <input
                    ref={inputRef}
                    onKeyDown={checkAnswer}
                    className={cn(
                      "w-full outline-none border rounded px-2 py-1 text-sky-800",
                      {
                        "border-red-500 animate-shake-x": isWrong,
                      },
                    )}
                  />
                </div>
              </>
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
