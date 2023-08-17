import Image from "next/image";
import { useVoiceSpeaker } from "@/hooks/useVoiceSpeaker";
import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const ButtonToSpeak = ({ speak, size = 30 }) => {
  return (
    <span className="md:cursor-pointer" onClick={speak}>
      <Image
        src="/icons/speaker.svg"
        alt="speaker icon, use for listen vocabulary via sound"
        width={size}
        height={size}
      />
    </span>
  );
};

const FrontPart = ({ front, ...props }) => {
  return (
    <>
      <motion.div
        {...props}
        className="font-bold text-4xl text-slate-700 flex items-center gap-2 mb-4"
      >
        <span dangerouslySetInnerHTML={{ __html: front }} />
        <ButtonToSpeak
          speak={() => {
            window.speechSynthesis.speak(new SpeechSynthesisUtterance(front));
          }}
        />
      </motion.div>
    </>
  );
};

const PartOfSpeechPart = ({ partOfSpeech }) => {
  return (
    <div className="mb-2">
      <div className="font-semibold text-lg text-slate-600">
        {partOfSpeech &&
          partOfSpeech.map((item) => (
            <span
              key={item.name}
              className={cn("p-1 rounded-md mr-2", {
                "bg-blue-100 text-blue-500": item.name === "Noun",
                "bg-green-100 text-green-500": item.name === "Verb",
                "bg-yellow-100 text-yellow-500": item.name === "Adjective",
                "bg-red-100 text-red-500": item.name === "Adverb",
                "bg-purple-100 text-purple-500": item.name === "Phrase",
                "bg-pink-100 text-pink-500": item.name === "Preposition",
              })}
            >
              {item.name.toLowerCase()}
            </span>
          ))}
      </div>
    </div>
  );
};

const BackPart = ({ back }) => {
  return (
    <div className="text-slate-700 flex items-center gap-2">
      <div className="font-semibold text-lg text-slate-600">
        <span>Meaning:</span>
      </div>

      <div>{back}</div>
    </div>
  );
};

const ExamplePhrasesPart = ({ phrase }) => {
  const [text, setText] = useState("");
  const ref = useRef(null);
  const { speak } = useVoiceSpeaker(text);

  useEffect(() => {
    if (!phrase) return;
    setText(ref.current.children[0]?.innerText || "");
  }, [phrase]);

  return (
    <div className="text-slate-700 flex flex-col gap-2">
      {phrase ? (
        <>
          <div className="font-semibold text-lg text-slate-600">
            <span>Example Phrases:</span>
          </div>
          <div className="p-2 bg-slate-100 rounded relative pb-12">
            <div ref={ref} dangerouslySetInnerHTML={{ __html: phrase }}></div>
            <span className="absolute bottom-2 right-2">
              <ButtonToSpeak speak={speak} size={25} />
            </span>
          </div>
        </>
      ) : (
        <div className={"text-gray-400"}>
          <i>&quot;This card has no example phrases yet&quot;</i>
        </div>
      )}
    </div>
  );
};

export {
    ButtonToSpeak,
    FrontPart,
    PartOfSpeechPart,
    BackPart,
    ExamplePhrasesPart,
};
