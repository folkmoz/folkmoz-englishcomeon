const transition = {
  duration: 0.5,
  delay: 0.2,
  ease: [0.43, 0.13, 0.23, 0.96],
};

const fadeInUp = {
  initial: {
    opacity: 0,
    y: 60,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition,
  },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const fadeInUpWithStagger = {
  initial: {
    opacity: 0,
    y: 60,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      ...transition,
      staggerChildren: 0.1,
    },
  },
};

const fadeIn = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition,
  },
};

const fadeInWithStagger = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      ...transition,
      staggerChildren: 0.1,
    },
  },
};

export { fadeInUp, stagger, fadeInUpWithStagger, fadeIn, fadeInWithStagger };
