import { useGlobalState } from "./state";

export const useReviewMode = () => {
  const [review, setReview] = useGlobalState("review");

  review.init = (data) => {
    setReview((prev) => {
      return {
        ...prev,
        rawData: data.slice(),
        data,
      };
    });
  };

  return { review, setReview };
};
