import { useGlobalState } from "./state";

export const useSelectedVocab = () => {
  const [selected, setSelected] = useGlobalState("selected");

  return { selected, setSelected };
};
