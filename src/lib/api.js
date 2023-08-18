import { SplitVariable } from "@/hooks/useSplitVariable";
import notion from "@/lib/notion";
import { cache } from "react";

export const revalidate = 60;

const notionApi = async (start) => {
  return await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    start_cursor: start || undefined,
    sorts: [
      {
        property: "Front",
        direction: "ascending",
      },
    ],
    filter: {
      property: "Front",
      rich_text: {
        is_not_empty: true,
      },
    },
  });
};

export const getAllVocab = cache(async () => {
  let allData = [];
  let loop = true;
  let start_cursor = "";
  while (loop) {
    const response = await notionApi(start_cursor);
    if (response.has_more) {
      start_cursor = response.next_cursor ?? "";
    } else {
      loop = false;
    }
    allData = [...allData, ...response.results];
  }
  const normalizedData = allData.map((item) => SplitVariable(item));

  return normalizedData;
});
