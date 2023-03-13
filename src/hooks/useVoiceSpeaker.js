export const useVoiceSpeaker = (text, lang = "en-US") => {
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = lang;
  msg.rate = 1;
  msg.pitch = 1;
  msg.volume = 1;

  const speak = () => {
    window.speechSynthesis.speak(msg);
  };

  return { speak };
};
