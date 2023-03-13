import { createGlobalState } from "react-hooks-global-state";

const initialState = {
  selected: null,
  review: {
    rawData: null,
    data: [],
    mode: "default",
    display: ["front"],
    resetFunc: () => {},
  },
};
const { useGlobalState } = createGlobalState(initialState);

export { useGlobalState };
