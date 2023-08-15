export const SplitVariable = (item) => {
  try {
    const front = item.properties.Front.title[0].plain_text;
    const back = item.properties.Back.rich_text[0].plain_text;
    const partOfSpeech = item.properties["Part of Speech"].multi_select.length
      ? item.properties["Part of Speech"].multi_select.map((item) => ({
          name: item.name,
          color: item.color,
        }))
      : null;

    const getPhrasesHTML = () => {
      const words = item.properties["Example Phrases"].rich_text;
      if (!words.length) return null;
      let phrases = "<pre class='whitespace-pre-wrap'>";
      words.forEach((phrase: any) => {
        const isUnderline = phrase.annotations.underline;
        phrases += isUnderline
          ? `<u>${phrase.plain_text}</u>`
          : phrase.plain_text;
      });
      phrases += "</pre>";
      return phrases;
    };

    const examplePhrasesHTML = getPhrasesHTML();

    return { front, back, partOfSpeech, examplePhrasesHTML };
  } catch (e) {
    return null;
  }
};
