"use client";
import { motion } from "framer-motion";
import { useReviewMode } from "@/hooks/useReviewMode";

const list = [
  { name: "Shuffle", value: "shuffle" },
  { name: "Reverse", value: "reverse" },
  { name: "Reset", value: "reset" },
  { name: "Test", value: "test" },
];

export default function ReviewFuncSetting() {
  const { review, setReview } = useReviewMode();

  const handleDisplay = (value) => {
    switch (value) {
      case "shuffle":
        setReview((prev) => {
          return {
            ...prev,
            data: prev.data.sort(() => Math.random() - 0.5),
          };
        });
        break;
      case "reverse":
        setReview((prev) => {
          return {
            ...prev,
            data: prev.data.reverse(),
          };
        });
        break;
      case "reset":
        review.resetFunc();
        break;
      case "test":
        setReview((prev) => {
          return {
            ...prev,
            mode: "test",
          };
        });
        break;
      default:
        break;
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
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 9V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10c0 1.1.9 2 2 2h4"></path>
                <rect x="12" y="13" width="10" height="7" rx="2"></rect>
              </svg>
            </span>
            Function:
          </div>
        </div>
        <motion.div className="glass-morphism p-2 rounded-md border border-slate-200">
          <motion.div className="rounded-md overflow-hidden flex">
            {list.map((item) => (
              <motion.div
                whileTap={{ scale: 0.98 }}
                key={item.value}
                className={
                  "md:cursor-pointer p-4 hover:bg-gray-700 hover:text-white"
                }
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
