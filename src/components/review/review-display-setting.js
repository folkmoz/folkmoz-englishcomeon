"use client";
import { useReviewMode } from "@/hooks/useReviewMode";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const list = [
  {
    name: "Front",
    value: "front",
  },
  {
    name: "Back",
    value: "back",
  },
  {
    name: "Pharase",
    value: "phrase",
  },
];

export default function ReviewDisplaySetting() {
  const { review, setReview } = useReviewMode();

  const handleDisplay = (value) => {
    if (review.display.length === 1 && review.display.includes(value)) {
      return;
    }
    setReview((prev) => {
      return {
        ...prev,
        display: prev.display.includes(value)
          ? prev.display.filter((item) => item !== value)
          : [...prev.display, value],
      };
    });
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
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4"></path>
                <rect x="12" y="13" width="10" height="7" rx="2"></rect>
              </svg>
            </span>
            Display:
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
