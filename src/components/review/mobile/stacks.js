"use client";
import { Antic_Didone } from "@next/font/google";
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion";

import { useReviewMode } from "@/hooks/useReviewMode";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import move from "lodash-move/index";

const font = Antic_Didone({
  display: "swap",
  weight: ["400"],
  preload: true,
  subsets: ["latin"],
});

export default function Stacks({ data }) {
  const [render, setRender] = useState(data.slice(0, 4));
  const [page, setPage] = useState(0);
  const { review, setReview } = useReviewMode();

  const movetoEnd = (from) => {
    setReview((prev) => {
      return {
        ...prev,
        data: move(prev.data, from, prev.data.length - 1),
      };
    });
    setPage((prev) => prev + 1);
  };

  const genProps = (i) => {};

  useEffect(() => {
    review.init(data);
  }, []);

  useEffect(() => {
    setRender(review.data.slice(0, 4));
  }, [review.data]);

  return (
    <>
      <div>
        <div className={"mb-4"}>
          <div className={cn("mb-4 w-full", font.className)}>
            <div className="font-semibold text-center">
              <span className={"text-4xl"}>
                {page + 1 > data.length
                  ? page + 1 - data.length * Math.floor(page / data.length)
                  : page + 1}
              </span>
              /<i className={"opacity-60 text-2xl"}>{data.length}</i>
            </div>
          </div>
        </div>

        <div className={"h-full relative"}>
          <AnimatePresence>
            {render.map((item, i) => {
              return (
                <Card
                  moveToEnd={movetoEnd}
                  key={item.front}
                  data={item}
                  index={i}
                />
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

const Card = ({ data, index, moveToEnd }) => {
  const [isExit, setIsExit] = useState(false);
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-700, 0, 700], [-40, 0, 40]);

  const controls = useAnimation();

  const onDragEnd = (e, info) => {
    const { offset, velocity: v } = info;
    const dir = offset.x > 0 ? 1 : -1;

    if (offset.x > 250 || v.x > 900) {
      controls
        .start({
          x: (window.innerWidth + 200) * dir,
          transition: { duration: v.x > 900 ? 0.3 : 0.5 },
        })
        .then(() => {
          moveToEnd(index);
        });
    } else if (offset.x < -250 || v.x < -900) {
      controls
        .start({
          x: (window.innerWidth + 200) * dir,
          transition: { duration: v.x < -900 ? 0.3 : 0.5 },
        })
        .then(() => {
          moveToEnd(index);
        });
    }
  };

  const onDrag = (e, info) => {
    const { offset } = info;
    if (offset.x > 250) {
      setIsExit(true);
    } else if (offset.x < -250) {
      setIsExit(true);
    } else {
      setIsExit(false);
    }
  };

  // useEffect(() => {
  //   let random = Math.random() * (3 - -3) + 3;
  //   rotate.set(random);
  // }, [rotate]);

  return (
    <>
      <motion.div
        style={{
          x,
          rotate,
          zIndex: 4 - index,
        }}
        custom={index}
        animate={controls}
        drag="x"
        dragSnapToOrigin={!isExit}
        onDragEnd={onDragEnd}
        onDrag={onDrag}
        className={cn(
          "bg-white min-h-[70%] flex flex-col justify-center items-center absolute w-full rounded-md",
          index === 0 ? "drop-shadow-md" : "shadow-md",
        )}
      >
        <div className={"h-full px-2"}>
          <div>
            <h2
              className={cn(
                "text-slate-600 font-semibold",
                data.front.length > 10 ? "text-2xl" : "text-4xl",
              )}
            >
              {data.front}
            </h2>
          </div>
        </div>
      </motion.div>
    </>
  );
};
