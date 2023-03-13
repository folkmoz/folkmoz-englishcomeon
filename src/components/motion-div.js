import * as animation from "@/lib/motion-variants";
import { motion } from "framer-motion";

export default function MotionDiv({ children, type, ...props }) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={animation[type]}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export const ContainerMotionHover = ({ children, ...props }) => {
  return (
    <motion.div initial="rest" whileHover={"hover"} animate="rest" {...props}>
      {children}
    </motion.div>
  );
};
