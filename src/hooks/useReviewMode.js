import { useGlobalState } from "./state";

export const useReviewMode = () => {
  const [review, setReview] = useGlobalState("review");

  return { review, setReview };
};
