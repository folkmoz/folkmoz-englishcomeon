"use client";
import { motion } from "framer-motion";
import { useReviewMode } from "@/hooks/useReviewMode";
import { cn } from "@/lib/utils";

const list = [{ name: "Part of Speech", value: "partOfSpeech" }];

export default function ReviewFuncSetting() {
  const { review, setReview } = useReviewMode();

  const handleDisplay = (value) => {
    if (value === "shuffle") {
      setReview((prev) => {
        return {
          ...prev,
          data: prev.data.sort(() => Math.random() - 0.5),
        };
      });
    }
  };

  return (
    <>
      <motion.div className="select-none">
        <div>
          <div className="text-lg font-semibold flex gap-2">
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4"></path>
                <rect x="12" y="13" width="10" height="7" rx="2"></rect>
              </svg>
            </span>
            Sort:
          </div>
        </div>
        <motion.div className="glass-morphism p-2 rounded-md border border-slate-200">
          <motion.div className="rounded-md overflow-hidden flex">
            {list.map((item) => (
              <motion.div
                whileTap={{ scale: 0.98 }}
                key={item.value}
                className={cn("md:cursor-pointer p-4", {
                  "bg-green-300 text-green-700": review.display.includes(
                    item.value
                  ),
                  "bg-gray-100 text-gray-400": !review.display.includes(
                    item.value
                  ),
                })}
                onClick={() => handleDisplay(item.value)}
              >
                <div className="text-center  text-lg">{item.name}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}
